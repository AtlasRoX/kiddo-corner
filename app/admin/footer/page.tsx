"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  getFooterSections,
  updateFooterSection,
  updateFooterSectionOrder,
  type FooterSection,
} from "@/lib/services/footer-service"
import { TranslatedText } from "@/components/translated-text"
import { Loader2, Plus, Trash, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

export default function FooterSettingsPage() {
  const [sections, setSections] = useState<FooterSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await getFooterSections()
      // Sort sections by display_order
      const sortedData = [...data].sort((a, b) => a.display_order - b.display_order)
      setSections(sortedData)
    } catch (error) {
      console.error("Error fetching footer sections:", error)
      toast({
        title: "Error",
        description: "Failed to load footer sections. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSectionUpdate = async (id: number, updates: Partial<FooterSection>) => {
    try {
      setSaving(true)
      const result = await updateFooterSection(id, updates)
      if (result.success) {
        toast({
          title: "Success",
          description: "Footer section updated successfully.",
        })
        // Update local state
        setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...updates } : section)))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error updating footer section:", error)
      toast({
        title: "Error",
        description: "Failed to update footer section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index,
    }))

    setSections(updatedItems)

    // Update in database
    try {
      const orderUpdates = updatedItems.map((item) => ({
        id: item.id,
        display_order: item.display_order,
      }))
      await updateFooterSectionOrder(orderUpdates)
    } catch (error) {
      console.error("Error updating section order:", error)
      toast({
        title: "Error",
        description: "Failed to update section order. Please try again.",
        variant: "destructive",
      })
      // Revert to original order
      fetchSections()
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    await handleSectionUpdate(id, { is_active: isActive })
  }

  const handleTitleChange = async (id: number, title: string) => {
    await handleSectionUpdate(id, { title })
  }

  const handleContentChange = async (id: number, content: any) => {
    await handleSectionUpdate(id, { content })
  }

  const renderSectionEditor = (section: FooterSection) => {
    switch (section.section_name) {
      case "about":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="about-title">Section Title</Label>
              <Input
                id="about-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="about-text">About Text</Label>
              <Textarea
                id="about-text"
                value={section.content.text || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, text: e.target.value })}
                rows={5}
              />
            </div>
          </div>
        )

      case "contact":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-title">Section Title</Label>
              <Input
                id="contact-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact-address">Address</Label>
              <Textarea
                id="contact-address"
                value={section.content.address || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={section.content.email || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={section.content.phone || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, phone: e.target.value })}
              />
            </div>
          </div>
        )

      case "links":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="links-title">Section Title</Label>
              <Input
                id="links-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label>Quick Links</Label>
              <div className="space-y-2 mt-2">
                {section.content.links &&
                  Array.isArray(section.content.links) &&
                  section.content.links.map((link: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Link Title"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...section.content.links]
                          newLinks[index] = { ...newLinks[index], title: e.target.value }
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...section.content.links]
                          newLinks[index] = { ...newLinks[index], url: e.target.value }
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newLinks = [...section.content.links]
                          newLinks.splice(index, 1)
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const links = section.content.links || []
                    handleContentChange(section.id, {
                      ...section.content,
                      links: [...links, { title: "", url: "" }],
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Link
                </Button>
              </div>
            </div>
          </div>
        )

      case "social":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="social-title">Section Title</Label>
              <Input
                id="social-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label>Social Links</Label>
              <div className="space-y-2 mt-2">
                {section.content.links &&
                  Array.isArray(section.content.links) &&
                  section.content.links.map((link: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Platform"
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...section.content.links]
                          newLinks[index] = { ...newLinks[index], title: e.target.value }
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...section.content.links]
                          newLinks[index] = { ...newLinks[index], url: e.target.value }
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Icon (facebook, twitter, etc.)"
                        value={link.icon}
                        onChange={(e) => {
                          const newLinks = [...section.content.links]
                          newLinks[index] = { ...newLinks[index], icon: e.target.value }
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newLinks = [...section.content.links]
                          newLinks.splice(index, 1)
                          handleContentChange(section.id, { ...section.content, links: newLinks })
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const links = section.content.links || []
                    handleContentChange(section.id, {
                      ...section.content,
                      links: [...links, { title: "", url: "", icon: "" }],
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Social Link
                </Button>
              </div>
            </div>
          </div>
        )

      case "newsletter":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="newsletter-title">Section Title</Label>
              <Input
                id="newsletter-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newsletter-text">Newsletter Text</Label>
              <Textarea
                id="newsletter-text"
                value={section.content.text || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, text: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newsletter-placeholder">Input Placeholder</Label>
              <Input
                id="newsletter-placeholder"
                value={section.content.placeholder || ""}
                onChange={(e) =>
                  handleContentChange(section.id, {
                    ...section.content,
                    placeholder: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="newsletter-button">Button Text</Label>
              <Input
                id="newsletter-button"
                value={section.content.button_text || ""}
                onChange={(e) =>
                  handleContentChange(section.id, {
                    ...section.content,
                    button_text: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )

      case "copyright":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="copyright-title">Section Title</Label>
              <Input
                id="copyright-title"
                value={section.title}
                onChange={(e) => handleTitleChange(section.id, e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="copyright-text">Copyright Text</Label>
              <Input
                id="copyright-text"
                value={section.content.text || ""}
                onChange={(e) => handleContentChange(section.id, { ...section.content, text: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return <p>Unknown section type</p>
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">
          <TranslatedText text="Footer Settings" />
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <TranslatedText text="Footer Sections" />
            </CardTitle>
            <CardDescription>
              <TranslatedText text="Drag and drop to reorder sections. Toggle to show or hide sections." />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="footer-sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={String(section.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                          >
                            <div className="flex items-center">
                              <div {...provided.dragHandleProps} className="mr-3 cursor-grab">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <span className={`font-medium ${section.is_active ? "" : "text-gray-400 line-through"}`}>
                                {section.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setActiveTab(section.section_name)
                                }}
                              >
                                Edit
                              </Button>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`active-${section.id}`}
                                  checked={section.is_active}
                                  onCheckedChange={(checked) => handleToggleActive(section.id, checked)}
                                />
                                <Label htmlFor={`active-${section.id}`} className="sr-only">
                                  Active
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <TranslatedText text="Edit Footer Section" />
            </CardTitle>
            <CardDescription>
              <TranslatedText text="Customize the content of each footer section." />
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
  <TabsList className="flex flex-wrap gap-2 mb-4">
    {sections.map((section) => (
      <TabsTrigger key={section.id} value={section.section_name}>
        {section.title}
      </TabsTrigger>
    ))}
  </TabsList>

  {sections.map((section) => (
    <TabsContent key={section.id} value={section.section_name}>
      <Card>
        <CardHeader>
          <CardTitle>Edit: {section.title}</CardTitle>
          <CardDescription>Update content for this section.</CardDescription>
        </CardHeader>
        <CardContent>{renderSectionEditor(section)}</CardContent>
      </Card>
    </TabsContent>
  ))}
</Tabs>

          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
