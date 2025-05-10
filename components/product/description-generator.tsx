"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateProductDescription } from "@/lib/services/description-generator"
import { Loader2 } from "lucide-react"

interface DescriptionGeneratorProps {
  productName: string
  onApply: (description: string) => void
  initialDescription?: string
}

export function DescriptionGenerator({ productName, onApply, initialDescription = "" }: DescriptionGeneratorProps) {
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [audience, setAudience] = useState("general")
  const [features, setFeatures] = useState("")
  const [benefits, setBenefits] = useState("")
  const [generatedDescription, setGeneratedDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [customDescription, setCustomDescription] = useState(initialDescription)

  const handleGenerate = () => {
    setIsGenerating(true)

    // Split features and benefits into arrays
    const featuresList = features
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0)

    const benefitsList = benefits
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b.length > 0)

    // Generate description
    const description = generateProductDescription({
      productName,
      tone,
      length,
      audience,
      features: featuresList,
      benefits: benefitsList,
    })

    setGeneratedDescription(description)
    setIsGenerating(false)
  }

  const handleApplyGenerated = () => {
    onApply(generatedDescription)
  }

  const handleApplyCustom = () => {
    onApply(customDescription)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Description Generator</CardTitle>
        <CardDescription>Generate compelling product descriptions or write your own</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Description</TabsTrigger>
            <TabsTrigger value="custom">Custom Description</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger id="length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="premium">Premium Buyers</SelectItem>
                    <SelectItem value="budget">Budget Conscious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="features">Key Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Soft cotton material&#10;Adjustable straps&#10;Machine washable"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="benefits">Key Benefits (one per line)</Label>
                <Textarea
                  id="benefits"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Keeps baby comfortable&#10;Easy to clean&#10;Durable for daily use"
                  rows={4}
                />
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating || !productName} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Description"
              )}
            </Button>

            {generatedDescription && (
              <div className="mt-4">
                <Label htmlFor="generated-description">Generated Description</Label>
                <Textarea id="generated-description" value={generatedDescription} readOnly rows={8} className="mt-2" />
                <Button onClick={handleApplyGenerated} className="mt-2" variant="secondary">
                  Apply This Description
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-description">Custom Description</Label>
                <Textarea
                  id="custom-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Write your own product description here..."
                  rows={10}
                />
              </div>

              <Button onClick={handleApplyCustom} variant="secondary">
                Apply Custom Description
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
