"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { Form, FormElement as FormElementType } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import FormElementComponent from "@/components/ui/form-builder/FormElement"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createNewElement } from "@/lib/form-elements"
import { PlusCircle, Eye, X } from "lucide-react"
import FormPreview from "@/components/FormPreview"

interface FormCanvasProps {
  form: Form
  onFormChange: (form: Form) => void
  selectedElementId: string | null
  onElementSelect: (elementId: string | null) => void
  onPreview?: () => void
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  onFormChange,
  selectedElementId,
  onElementSelect,
  onPreview,
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragCounter = useRef(0)

  // Remove the local selectedElementId state since it's now passed as prop
  // const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // Update form title or description
  const updateFormBasics = (field: "title" | "description", value: string) => {
    onFormChange({
      ...form,
      [field]: value,
    })
  }

  // Update the addElement function to use the prop
  const addElement = (elementType: string, index?: number) => {
    const newElement = createNewElement(elementType)
    if (!newElement) return

    const elements = [...form.elements]
    if (typeof index === "number") {
      elements.splice(index, 0, newElement)
    } else {
      elements.push(newElement)
    }

    onFormChange({
      ...form,
      elements,
    })

    // Select the new element using the prop function
    onElementSelect(newElement.id)
  }

  // Update an existing element
  const updateElement = (updatedElement: FormElementType) => {
    const elements = form.elements.map((element) => (element.id === updatedElement.id ? updatedElement : element))

    onFormChange({
      ...form,
      elements,
    })
  }

  // Update the deleteElement function
  const deleteElement = (elementId: string) => {
    const elements = form.elements.filter((element) => element.id !== elementId)

    onFormChange({
      ...form,
      elements,
    })

    // Deselect if the deleted element was selected
    if (selectedElementId === elementId) {
      onElementSelect(null)
    }
  }

  // Handle drag over events for drop zone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  // Handle drop events to add new elements
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const elementType = e.dataTransfer.getData("element-type")
    if (elementType) {
      // Calculate position to insert based on mouse position
      if (canvasRef.current && form.elements.length > 0) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const mouseY = e.clientY - canvasRect.top

        // Find the correct insertion index by comparing with element positions
        let insertIndex = form.elements.length // Default to end
        const elementNodes = canvasRef.current.querySelectorAll(".form-element-container")

        for (let i = 0; i < elementNodes.length; i++) {
          const rect = elementNodes[i].getBoundingClientRect()
          const elementMidpoint = rect.top + rect.height / 2 - canvasRect.top

          if (mouseY < elementMidpoint) {
            insertIndex = i
            break
          }
        }

        addElement(elementType, insertIndex)
      } else {
        addElement(elementType)
      }
    }
  }

  // Handle drag enter/leave to show visual feedback
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current += 1
    if (canvasRef.current) {
      canvasRef.current.classList.add("border-primary-500", "bg-primary-50", "dark:bg-primary-900/10")
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0 && canvasRef.current) {
      canvasRef.current.classList.remove("border-primary-500", "bg-primary-50", "dark:bg-primary-900/10")
    }
  }

  // Update the togglePreview function
  const togglePreview = () => {
    setShowPreview(!showPreview)
    onElementSelect(null) // Clear selection when toggling preview
  }

  return (
    <>
      {showPreview ? (
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Form Preview</h2>
              <p className="text-sm text-muted-foreground">This is how your form will appear to users</p>
            </div>
            <Button variant="outline" size="sm" onClick={togglePreview} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Close Preview
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FormPreview form={form} inBuilder={true} />
          </div>
        </div>
      ) : (
        <Card className="min-h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight">Form Builder</h3>
              <p className="text-sm text-muted-foreground">Drag & drop elements or edit existing ones</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={togglePreview} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={canvasRef}
              className="min-h-[400px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              {/* Form title and description */}
              <div className="mb-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Title</label>
                  <Input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateFormBasics("title", e.target.value)}
                    placeholder="Enter Form Title"
                    className="text-xl font-bold border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Form Description (Optional)
                  </label>
                  <Textarea
                    value={form.description || ""}
                    onChange={(e) => updateFormBasics("description", e.target.value)}
                    placeholder="Enter form description to help users understand what this form is for"
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 focus:border-primary-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Form elements */}
              {form.elements.length > 0 ? (
                <div className="space-y-4">
                  {form.elements.map((element) => (
                    <div key={element.id} className="form-element-container">
                      {/* In the FormElementComponent, update the onSelect prop */}
                      <FormElementComponent
                        element={element}
                        isSelected={selectedElementId === element.id}
                        onSelect={() => onElementSelect(element.id)}
                        onDelete={() => deleteElement(element.id)}
                        onUpdate={updateElement}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No form elements yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    Drag elements from the panel or click the button below to add your first element
                  </p>
                  <Button variant="outline" size="sm" onClick={() => addElement("text")}>
                    Add Text Input
                  </Button>
                </div>
              )}

              {/* Add element button at the bottom */}
              {form.elements.length > 0 && (
                <div className="flex justify-center mt-8 pt-6 border-t border-dashed border-gray-300 dark:border-gray-600">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement("text")}
                    className="flex items-center gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Element
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default FormCanvas
