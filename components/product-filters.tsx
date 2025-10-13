"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { TranslatedText } from "@/components/translated-text"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface ProductFiltersProps {
  categories: string[]
  selectedCategory: string
  priceRange: [number, number]
  selectedMinPrice: number
  selectedMaxPrice: number
  selectedSort: string
  inStockOnly: boolean
  onCategoryChange: (category: string) => void
  onPriceChange: (minPrice: number, maxPrice: number) => void
  onSortChange: (sort: string) => void
  onInStockChange: (inStock: boolean) => void
  onClose?: () => void
}

export function ProductFilters({
  categories,
  selectedCategory,
  priceRange,
  selectedMinPrice,
  selectedMaxPrice,
  selectedSort,
  inStockOnly,
  onCategoryChange,
  onPriceChange,
  onSortChange,
  onInStockChange,
  onClose,
}: ProductFiltersProps) {
  const [priceValues, setPriceValues] = useState<[number, number]>([selectedMinPrice, selectedMaxPrice])
  const [categoryFilter, setCategoryFilter] = useState("")
  const [filteredCategories, setFilteredCategories] = useState<string[]>(categories)
  const { language } = useLanguage()

  // Update filter values when props change
  useEffect(() => {
    setPriceValues([selectedMinPrice, selectedMaxPrice])
  }, [selectedMinPrice, selectedMaxPrice])

  // Update filtered categories when category filter or categories change
  useEffect(() => {
    if (categoryFilter) {
      setFilteredCategories(
        categories.filter((category) => category.toLowerCase().includes(categoryFilter.toLowerCase())),
      )
    } else {
      setFilteredCategories(categories)
    }
  }, [categoryFilter, categories])

  const handlePriceChange = (values: number[]) => {
    setPriceValues([values[0], values[1]])
  }

  const handlePriceApply = () => {
    onPriceChange(priceValues[0], priceValues[1])
  }

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category === selectedCategory ? "" : category)
  }

  const clearCategoryFilter = () => {
    setCategoryFilter("")
  }

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 space-y-6 sticky top-4">
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${language === "bn" ? "bangla-text" : ""}`}>
          <TranslatedText textKey="products.filters" fallback="Filters" />
        </h2>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={[]} className="w-full">
        <AccordionItem value="categories" className="border-b">
          <AccordionTrigger className="text-base py-3">
            <TranslatedText textKey="products.categories" fallback="Categories" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-8 pr-8 h-9"
                />
                {categoryFilter && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={clearCategoryFilter}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {filteredCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No categories found</p>
              ) : (
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                  {filteredCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className={`block w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                        category === selectedCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="text-base py-3">
            <TranslatedText textKey="products.price" fallback="Price Range" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[priceRange[0], priceRange[1]]}
                value={[priceValues[0], priceValues[1]]}
                min={priceRange[0]}
                max={priceRange[1]}
                step={10}
                onValueChange={handlePriceChange}
                className="my-6"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={priceValues[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val >= priceRange[0] && val <= priceValues[1]) {
                        setPriceValues([val, priceValues[1]])
                      }
                    }}
                    className="pl-8 pr-2 py-1.5 w-full rounded-md border border-input bg-background text-sm focus:ring-1"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground pointer-events-none">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={priceValues[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val <= priceRange[1] && val >= priceValues[0]) {
                        setPriceValues([priceValues[0], val])
                      }
                    }}
                    className="pl-8 pr-2 py-1.5 w-full rounded-md border border-input bg-background text-sm focus:ring-1"
                  />
                </div>
              </div>
              <Button size="sm" onClick={handlePriceApply} className="w-full">
                <TranslatedText textKey="products.apply" fallback="Apply" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stock" className="border-b">
          <AccordionTrigger className="text-base py-3">
            <TranslatedText textKey="products.availability" fallback="Availability" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Switch id="in-stock" checked={inStockOnly} onCheckedChange={onInStockChange} />
              <Label htmlFor="in-stock" className="cursor-pointer">
                <TranslatedText textKey="products.inStockOnly" fallback="In stock only" />
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort" className="border-b-0">
          <AccordionTrigger className="text-base py-3">
            <TranslatedText textKey="products.sortBy" fallback="Sort By" />
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedSort || ""} onValueChange={onSortChange} className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="newest" id="newest" />
                <Label htmlFor="newest" className="cursor-pointer">
                  <TranslatedText textKey="products.sortNewest" fallback="Newest" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-asc" id="price-asc" />
                <Label htmlFor="price-asc" className="cursor-pointer">
                  <TranslatedText textKey="products.sortPriceAsc" fallback="Price: Low to High" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price-desc" id="price-desc" />
                <Label htmlFor="price-desc" className="cursor-pointer">
                  <TranslatedText textKey="products.sortPriceDesc" fallback="Price: High to Low" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name-asc" id="name-asc" />
                <Label htmlFor="name-asc" className="cursor-pointer">
                  <TranslatedText textKey="products.sortNameAsc" fallback="Name: A to Z" />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name-desc" id="name-desc" />
                <Label htmlFor="name-desc" className="cursor-pointer">
                  <TranslatedText textKey="products.sortNameDesc" fallback="Name: Z to A" />
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
