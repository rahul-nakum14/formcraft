"use client"

import { useState } from "react"
import { useParams, useLocation } from "wouter"
import { useQuery } from "@tanstack/react-query"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Button } from "@/components/ui/button"
import type { Form, FormSubmission, UserType } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ArrowLeft, Download, File, FilePlus, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"

const FormSubmissions = () => {
  const params = useParams()
  const formId = params.id
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [viewSubmission, setViewSubmission] = useState<FormSubmission | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Fetch user data
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  })

  // Fetch form data
  const { data: form, isLoading: isLoadingForm } = useQuery<Form>({
    queryKey: [`/api/forms/${formId}`],
    onSuccess: (data) => {
      // Success handler if needed
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to load form: ${error.message}`,
        variant: "destructive",
      })
      setLocation("/dashboard/forms")
    },
  })

  // Fetch form submissions
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<FormSubmission[]>({
    queryKey: [
      `/api/forms/${formId}/submissions`,
      {
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      },
    ],
    enabled: !!formId,
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to load submissions: ${error.message}`,
        variant: "destructive",
      })
    },
  })

  const isLoading = isLoadingForm || isLoadingSubmissions

  // Get field labels from form elements
  const getFieldLabel = (fieldId: string): string => {
    if (!form?.elements) return fieldId
    const element = form.elements.find((el) => el.id === fieldId)
    return element?.label || fieldId
  }

  // Get field type from form elements
  const getFieldType = (fieldId: string): string => {
    if (!form?.elements) return "text"
    const element = form.elements.find((el) => el.id === fieldId)
    return element?.type || "text"
  }

  // Get all field IDs from form elements in order
  const getAllFieldIds = (): string[] => {
    if (!form?.elements) return []
    return form.elements.map((el) => el.id)
  }

  // Get table headers based on form structure
  const getTableHeaders = (): string[] => {
    const allFieldIds = getAllFieldIds()
    return allFieldIds.slice(0, 3).map((fieldId) => getFieldLabel(fieldId))
  }

  // Handle download CSV
  const handleDownloadCSV = async () => {
    try {
      if (!submissions || submissions.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no submissions to export.",
          variant: "destructive",
        })
        return
      }

      // Create CSV content based on form structure
      const allFieldIds = getAllFieldIds()
      const headers = allFieldIds.map((fieldId) => getFieldLabel(fieldId))
      const csvHeaders = ["Date", ...headers].join(",")

      const csvRows = submissions.map((submission) => {
        const date = submission.createdAt ? format(new Date(submission.createdAt), "yyyy-MM-dd HH:mm:ss") : "Unknown"
        const values = allFieldIds.map((fieldId) => {
          const value = submission.data[fieldId] || ""
          if (value && typeof value === "object" && value.name) {
            // Handle file objects
            return `"${value.name}"`
          }
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : `"${String(value)}"`
        })
        return [date, ...values].join(",")
      })

      const csvContent = [csvHeaders, ...csvRows].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${form?.title || "form"}-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download started",
        description: "Your CSV file is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download submissions",
        variant: "destructive",
      })
    }
  }

  // Handle view submission
  const handleViewSubmission = (submission: FormSubmission) => {
    setViewSubmission(submission)
    setIsViewDialogOpen(true)
  }

  // Handle file download
  const handleFileDownload = async (fileData: any, fieldLabel: string) => {
    try {
      if (fileData && (fileData.url || fileData.path)) {
        // Create a download link
        const downloadUrl = fileData.url || `/api/files/download/${fileData.path}`
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = fileData.name || `${fieldLabel}-file`
        link.target = "_blank"

        // For security, we'll open in new tab instead of direct download
        window.open(downloadUrl, "_blank")

        toast({
          title: "Download started",
          description: `Downloading ${fileData.name || "file"}`,
        })
      } else {
        throw new Error("File not available")
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "File not available for download",
        variant: "destructive",
      })
    }
  }

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter((submission: FormSubmission) => {
    if (!searchQuery) return true

    // Search in submission data
    return Object.values(submission.data).some((value) => {
      if (value && typeof value === "object" && value.name) {
        // Search in file names
        return value.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  // Render field value based on type
  const renderFieldValue = (fieldId: string, value: any, isPreview = false) => {
    const fieldType = getFieldType(fieldId)
    const fieldLabel = getFieldLabel(fieldId)

    if (fieldType === "file" && value && typeof value === "object") {
      if (isPreview) {
        return (
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-blue-500" />
            <span className="truncate text-blue-600">{value.name || "File"}</span>
          </div>
        )
      } else {
        return (
          <div className="flex items-center space-x-2">
            <File className="h-4 w-4 text-blue-500" />
            <span className="break-all">{value.name || "File"}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFileDownload(value, fieldLabel)}
              className="ml-2 shrink-0"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        )
      }
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No"
    }

    if (typeof value === "string") {
      return isPreview && value.length > 30 ? value.substring(0, 30) + "..." : value
    }

    return String(value || "")
  }

  // Get submission row data with proper alignment
  const getSubmissionRowData = (submission: FormSubmission) => {
    const allFieldIds = getAllFieldIds()
    const rowData = []

    // Add first 3 fields or fill with empty strings
    for (let i = 0; i < 3; i++) {
      if (i < allFieldIds.length) {
        const fieldId = allFieldIds[i]
        const value = submission.data[fieldId]
        rowData.push(renderFieldValue(fieldId, value, true))
      } else {
        rowData.push("")
      }
    }

    return rowData
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/forms")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{form?.title || "Form"} Submissions</h1>
              <p className="text-muted-foreground">View and manage submissions for this form.</p>
            </div>
          </div>
        </div>

        {/* Export button */}
        <div className="flex justify-end">
          <Button onClick={handleDownloadCSV} disabled={!submissions || submissions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Submissions table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    {getTableHeaders().map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubmissions.map((submission) => {
                    const rowData = getSubmissionRowData(submission)
                    return (
                      <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {submission.createdAt
                            ? format(new Date(submission.createdAt), "MMM dd, yyyy HH:mm")
                            : "Unknown"}
                        </td>
                        {rowData.map((data, index) => (
                          <td key={index} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                            <div className="truncate">{data}</div>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="ghost" size="sm" onClick={() => handleViewSubmission(submission)}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                <FilePlus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
              <p className="text-gray-500 text-center">
                {searchQuery ? "No submissions match your search." : "Share your form to start collecting responses."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      {viewSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Submission Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setViewSubmission(null)
                    setIsViewDialogOpen(false)
                  }}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted on:{" "}
                  {viewSubmission.createdAt
                    ? format(new Date(viewSubmission.createdAt), "MMMM dd, yyyy 'at' HH:mm")
                    : "Unknown"}
                </div>

                {getAllFieldIds().map((fieldId) => {
                  const fieldLabel = getFieldLabel(fieldId)
                  const fieldValue = viewSubmission.data[fieldId]

                  if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
                    return null
                  }

                  return (
                    <div key={fieldId} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {fieldLabel}
                      </label>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {renderFieldValue(fieldId, fieldValue, false)}
                      </div>
                    </div>
                  )
                })}

                {viewSubmission.ipAddress && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IP Address
                    </label>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{viewSubmission.ipAddress}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => {
                    setViewSubmission(null)
                    setIsViewDialogOpen(false)
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default FormSubmissions
