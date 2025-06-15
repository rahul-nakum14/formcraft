"use client"

import { useEffect, useState } from "react"
import { useParams } from "wouter"
import { useQuery } from "@tanstack/react-query"
import FormPreview from "@/components/FormPreview"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"

const PublicForm = () => {
  const params = useParams()
  const formId = params.id
  const { toast } = useToast()
  const [isExpired, setIsExpired] = useState(false)

  // Fetch the public form
  const {
    data: form,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/public/forms/${formId}`] as const,
    refetchOnWindowFocus: false,
  })

  // Increment form views
  useEffect(() => {
    const recordView = async () => {
      if (formId) {
        try {
          await apiRequest("POST", `/api/public/forms/${formId}/view`, {
            referrer: document.referrer || "direct",
          })
        } catch (error) {
          console.error("Error recording view:", error)
        }
      }
    }

    recordView()
  }, [formId])

  // Check if form is expired
  useEffect(() => {
    if (form && form.expiresAt) {
      const expiryDate = new Date(form.expiresAt)
      if (expiryDate < new Date()) {
        setIsExpired(true)
      }
    }
  }, [form])

  // Apply page background color to the entire page
  useEffect(() => {
    if (form?.theme?.pageBackgroundColor) {
      // Apply to body and html to ensure full coverage
      document.body.style.backgroundColor = form.theme.pageBackgroundColor
      document.documentElement.style.backgroundColor = form.theme.pageBackgroundColor
      document.body.style.margin = "0"
      document.body.style.padding = "0"
      document.body.style.minHeight = "100vh"
    }

    // Cleanup on unmount
    return () => {
      document.body.style.backgroundColor = ""
      document.documentElement.style.backgroundColor = ""
      document.body.style.margin = ""
      document.body.style.padding = ""
      document.body.style.minHeight = ""
    }
  }, [form?.theme?.pageBackgroundColor])

  // Page background style
  const pageStyle = {
    backgroundColor: form?.theme?.pageBackgroundColor || "#f8fafc",
    minHeight: "100vh",
    width: "100%",
    padding: "0",
    margin: "0",
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={pageStyle} className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6366f1" }} />
      </div>
    )
  }

  // Show error state
  if (error || !form) {
    return (
      <div style={pageStyle} className="flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Form Not Found</h1>
          <p className="text-gray-600 mb-6">The form you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Show expired form message
  if (isExpired) {
    return (
      <div style={pageStyle} className="flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-600 mb-4">Form Expired</h1>
          <p className="text-gray-600 mb-6">This form is no longer accepting responses because it has expired.</p>
          <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Render the form with proper page background
  return (
    <div style={pageStyle}>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold" style={{ color: form.theme?.textColor || "#111827" }}>
            FormCraft
          </h1>
          <p className="mt-2 text-sm opacity-70" style={{ color: form.theme?.textColor || "#6b7280" }}>
            Powered by FormCraft - Create your own forms at formcraft.app
          </p>
        </div>
        <FormPreview form={form} />
      </div>
    </div>
  )
}

export default PublicForm
