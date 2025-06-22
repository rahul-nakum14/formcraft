"use client"

import type React from "react"
import { Trash2, Settings, Grip } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FormElement as FormElementType } from "@/lib/types"

interface FormElementProps {
  element: FormElementType
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (element: FormElementType) => void
}

const FormElement: React.FC<FormElementProps> = ({ element, isSelected, onSelect, onDelete, onUpdate }) => {
  // Function to render the input field based on element type
  const renderElementInput = () => {
    const baseInputClass =
      "mt-1 block w-full rounded-md border-2 border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-colors"

    switch (element.type) {
      case "text":
        return (
          <input
            type="text"
            placeholder={element.placeholder || "Enter text here..."}
            className={baseInputClass}
            readOnly
          />
        )

      case "email":
        return (
          <input
            type="email"
            placeholder={element.placeholder || "email@example.com"}
            className={baseInputClass}
            readOnly
          />
        )

      case "phone":
        return (
          <input
            type="tel"
            placeholder={element.placeholder || "+1 (555) 000-0000"}
            className={baseInputClass}
            readOnly
          />
        )

      case "textarea":
        return (
          <textarea
            rows={3}
            placeholder={element.placeholder || "Enter your message here..."}
            className={baseInputClass}
            readOnly
          />
        )

      case "dropdown":
        return (
          <select className={baseInputClass} disabled>
            <option value="">{element.placeholder || "Select an option"}</option>
            {element.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case "checkbox":
        return (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-2 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                disabled
              />
            </div>
            <div className="ml-3 text-sm">
              <span className="text-gray-700 dark:text-gray-300">{element.label}</span>
            </div>
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`radio-${element.id}`}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  disabled
                />
                <label className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">{option}</label>
              </div>
            ))}
          </div>
        )

      case "file":
        return (
          <input
            type="file"
            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              dark:file:bg-primary-900 dark:file:text-primary-300
              hover:file:bg-primary-100 dark:hover:file:bg-primary-800
              border-2 border-gray-300 dark:border-gray-600 rounded-md"
            disabled
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`relative p-4 border-2 rounded-lg mb-4 cursor-pointer transition-all group ${
        isSelected
          ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      {/* Element controls - visible on hover or when selected */}
      <div
        className={`absolute right-2 top-2 flex space-x-1 z-10 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-sm border"
          onClick={(e) => {
            e.stopPropagation() /* Open settings modal */
          }}
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 bg-white dark:bg-gray-800 shadow-sm border"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Drag handle - visible on hover or when selected */}
      <div
        className={`absolute left-2 top-2 cursor-move z-10 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
      >
        <div className="p-1 bg-white dark:bg-gray-800 rounded shadow-sm border">
          <Grip className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Element content with appropriate padding for controls */}
      <div className="pt-2 pr-20 pl-12">
        {element.type !== "checkbox" && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {element.label} {element.required && <span className="text-red-500">*</span>}
          </label>
        )}

        {renderElementInput()}

        {element.properties?.helpText && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
        )}
      </div>
    </div>
  )
}

export default FormElement
