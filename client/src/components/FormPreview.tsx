"use client"

import type React from "react"
import { useState } from "react"
import type { Form } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormPreviewProps {
  form: Form
  inBuilder?: boolean
  onClose?: () => void
}

const FormPreview: React.FC<FormPreviewProps> = ({ form, inBuilder = false, onClose }) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const { toast } = useToast()

  const handleChange = (elementId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [elementId]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If in builder mode, just show a toast
    if (inBuilder) {
      toast({
        title: "Form Preview",
        description: "This is just a preview. Submissions are disabled in builder mode.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare submission data
      const submitData: Record<string, any> = {}

      // Process form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          // For files, store file information
          submitData[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified,
          }
        } else {
          submitData[key] = value
        }
      })

      const response = await fetch(`/api/public/forms/${form.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit form")
      }

      const result = await response.json()

      setIsSubmitted(true)
      setSuccessMessage(result.message)

      if (result.redirectUrl) {
        setRedirectUrl(result.redirectUrl)
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = result.redirectUrl
        }, 2000)
      }

      toast({
        title: "Success",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to validate file type
  const isValidFileType = (file: File, acceptedTypes: string): boolean => {
    if (!acceptedTypes) return true

    const allowedTypes = acceptedTypes.split(",").map((type) => type.trim().toLowerCase())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    const mimeType = file.type.toLowerCase()

    return allowedTypes.some((type) => {
      if (type.startsWith(".")) {
        // Extension-based validation
        return fileExtension === type
      } else if (type.includes("/")) {
        // MIME type validation
        return mimeType === type || (type.endsWith("/*") && mimeType.startsWith(type.replace("/*", "/")))
      } else {
        // General type validation (e.g., "image", "pdf")
        return mimeType.includes(type) || fileExtension.includes(type)
      }
    })
  }

  // Function to render form elements based on type
  const renderElement = (element: any) => {
    const inputClass =
      "mt-1 block w-full rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 transition-colors"

    switch (element.type) {
      case "text":
        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              id={element.id}
              name={element.id}
              placeholder={element.placeholder || ""}
              required={element.required}
              value={formData[element.id] || ""}
              onChange={(e) => handleChange(element.id, e.target.value)}
              className={inputClass}
            />
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "email":
        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              id={element.id}
              name={element.id}
              placeholder={element.placeholder || ""}
              required={element.required}
              value={formData[element.id] || ""}
              onChange={(e) => handleChange(element.id, e.target.value)}
              className={inputClass}
            />
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "phone":
        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              id={element.id}
              name={element.id}
              placeholder={element.placeholder || ""}
              required={element.required}
              value={formData[element.id] || ""}
              onChange={(e) => handleChange(element.id, e.target.value)}
              className={inputClass}
            />
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={element.id}
              name={element.id}
              rows={element.properties?.rows || 4}
              placeholder={element.placeholder || ""}
              required={element.required}
              value={formData[element.id] || ""}
              onChange={(e) => handleChange(element.id, e.target.value)}
              className={inputClass}
            />
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "dropdown":
        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={element.id}
              name={element.id}
              required={element.required}
              value={formData[element.id] || ""}
              onChange={(e) => handleChange(element.id, e.target.value)}
              className={inputClass}
            >
              <option value="">{element.placeholder || "Select an option"}</option>
              {element.options?.map((option: string, index: number) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "checkbox":
        return (
          <div className="mb-6" key={element.id}>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={element.id}
                  name={element.id}
                  type="checkbox"
                  required={element.required}
                  checked={formData[element.id] || false}
                  onChange={(e) => handleChange(element.id, e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor={element.id} className="font-medium text-gray-700 dark:text-gray-300">
                  {element.label} {element.required && <span className="text-red-500">*</span>}
                </label>
                {element.properties?.helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
                )}
              </div>
            </div>
          </div>
        )

      case "radio":
        return (
          <div className="mb-6" key={element.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-3">
              {element.options?.map((option: string, index: number) => (
                <div className="flex items-center" key={index}>
                  <input
                    id={`${element.id}-${index}`}
                    name={element.id}
                    type="radio"
                    value={option}
                    required={element.required}
                    checked={formData[element.id] === option}
                    onChange={(e) => handleChange(element.id, e.target.value)}
                    className="h-4 w-4 text-primary-600 border-2 border-gray-300 dark:border-gray-600 focus:ring-primary-500"
                  />
                  <label htmlFor={`${element.id}-${index}`} className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            {element.properties?.helpText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.properties.helpText}</p>
            )}
          </div>
        )

      case "file":
        const acceptedTypes = element.properties?.acceptedFileTypes || ""
        const maxFileSize = element.properties?.maxFileSize || 5 // MB

        return (
          <div className="mb-6" key={element.id}>
            <label htmlFor={element.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {element.label} {element.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              id={element.id}
              name={element.id}
              required={element.required}
              accept={acceptedTypes}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Check file size
                  if (file.size > maxFileSize * 1024 * 1024) {
                    toast({
                      title: "File too large",
                      description: `File size must be less than ${maxFileSize}MB`,
                      variant: "destructive",
                    })
                    e.target.value = ""
                    return
                  }

                  // Check file type if specified
                  if (acceptedTypes && !isValidFileType(file, acceptedTypes)) {
                    toast({
                      title: "Invalid file type",
                      description: `Please select a file of type: ${acceptedTypes}`,
                      variant: "destructive",
                    })
                    e.target.value = ""
                    return
                  }

                  handleChange(element.id, file)
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                dark:file:bg-primary-900 dark:file:text-primary-300
                hover:file:bg-primary-100 dark:hover:file:bg-primary-800
                border-2 border-gray-300 dark:border-gray-600 rounded-md"
            />
            {(element.properties?.helpText || acceptedTypes || maxFileSize) && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {element.properties?.helpText && <p>{element.properties.helpText}</p>}
                {acceptedTypes && <p>Accepted file types: {acceptedTypes}</p>}
                <p>Maximum file size: {maxFileSize}MB</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // Apply theme styles - improved contrast handling
  const formStyle = {
    backgroundColor: form.theme?.backgroundColor || "#ffffff",
    color: form.theme?.textColor || "#000000",
    backgroundImage: form.theme?.backgroundImage ? `url(${form.theme.backgroundImage})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backdropFilter: form.theme?.backgroundImage ? "brightness(0.95)" : "none", // Slightly darken for better readability
  }

  // Get custom button color from theme with hover state support
  const buttonStyle = {
    backgroundColor: form.theme?.primaryColor || "#6366f1",
    borderColor: form.theme?.primaryColor || "#6366f1",
    color: "#ffffff", // Ensure text is always visible
  }

  return (
    <div className="rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto" style={formStyle}>
      <div className="p-8">
        {/* Form title and description */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{form.title}</h1>
          {form.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{form.description}</p>
          )}
        </div>

        {/* Success message after submission */}
        {isSubmitted ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-green-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-medium mb-2">{successMessage || "Form submitted successfully!"}</h2>
            {redirectUrl && <p className="text-sm text-gray-500">Redirecting you shortly...</p>}
          </div>
        ) : (
          /* Form elements */
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.elements?.map(renderElement)}

            {/* Submit button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full py-3 text-lg font-medium"
                style={buttonStyle}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default FormPreview
