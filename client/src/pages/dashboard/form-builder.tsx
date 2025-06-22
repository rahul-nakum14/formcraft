"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation } from "wouter"
import { useQuery, useMutation } from "@tanstack/react-query"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Button } from "@/components/ui/button"
import type { Form, FormElement as FormElementType, UserType } from "@/lib/types"
import { apiRequest, queryClient } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Share2, Eye, Loader2 } from "lucide-react"
import { DEFAULT_FORM_THEME, DEFAULT_FORM_SETTINGS } from "@/lib/constants"
import ElementsPanel from "@/components/ui/form-builder/ElementsPanel"
import FormCanvas from "@/components/ui/form-builder/FormCanvas"
import PropertiesPanel from "@/components/ui/form-builder/PropertiesPanel"
import FormPreview from "@/components/FormPreview"
import { createNewElement } from "@/lib/form-elements"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"

const FormBuilder = () => {
  const params = useParams()
  const formId = params.id
  const isEditMode = !!formId
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const [form, setForm] = useState<Form>({
    id: "",
    userId: "",
    title: "Untitled Form",
    description: "",
    status: "draft",
    elements: [],
    settings: DEFAULT_FORM_SETTINGS,
    theme: DEFAULT_FORM_THEME,
    createdAt: new Date(),
    updatedAt: new Date(),
    views: 0,
  })

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [formHasChanged, setFormHasChanged] = useState(false)
  const [lastSavedStatus, setLastSavedStatus] = useState<"draft" | "published">("draft")

  // Fetch user data
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  })

  // Fetch form data if in edit mode with proper typing for TanStack Query v5
  const {
    data: formData,
    isLoading: isLoadingForm,
    isError,
  } = useQuery({
    queryKey: [`/api/forms/${formId}`] as const,
    enabled: isEditMode,
    gcTime: 0, // Don't keep old data in cache
    staleTime: 0, // Always refetch when requested
    refetchOnWindowFocus: false,
  })

  // Handle form data when available
  useEffect(() => {
    if (formData && isEditMode) {
      const typedFormData = formData as Form

      if (typedFormData.elements && typedFormData.elements.length > 0) {
        setForm(typedFormData)
        setLastSavedStatus(typedFormData.status)
        setFormHasChanged(false)
      } else {
        setForm((prevForm) => ({
          ...typedFormData,
          elements:
            typedFormData.elements && typedFormData.elements.length > 0 ? typedFormData.elements : prevForm.elements,
          id: typedFormData.id || prevForm.id,
          userId: typedFormData.userId || prevForm.userId,
          title: typedFormData.title || prevForm.title,
          status: typedFormData.status || prevForm.status,
          settings: typedFormData.settings || prevForm.settings,
          theme: typedFormData.theme || prevForm.theme,
          createdAt: typedFormData.createdAt || prevForm.createdAt,
          updatedAt: typedFormData.updatedAt || prevForm.updatedAt,
          views: typedFormData.views || prevForm.views,
        }))
        setLastSavedStatus(typedFormData.status)
        setFormHasChanged(false)
      }
    }
  }, [formData, isEditMode])

  // Create or update form mutation
  const formMutation = useMutation({
    mutationFn: async (formData: Partial<Form>) => {
      if (isEditMode) {
        await apiRequest("PATCH", `/api/forms/${formId}`, formData)
        return formData
      } else {
        const response = await apiRequest("POST", "/api/forms", formData)
        return response.json()
      }
    },
    onSuccess: (data) => {
      setFormHasChanged(false)

      if (data?.status) {
        setLastSavedStatus(data.status)
        setForm((prev) => ({ ...prev, status: data.status }))
      }

      if (!isEditMode && data?.id) {
        setLocation(`/dashboard/forms/${data.id}/edit`)
      }

      queryClient.invalidateQueries({ queryKey: ["/api/forms"] })

      toast({
        title: isEditMode ? "Form updated" : "Form created",
        description: isEditMode
          ? "Your form has been updated successfully."
          : "Your form has been created successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} form: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    },
  })

  // Remove the form limit check useEffect:
  // Comment out or remove this entire useEffect:
  // useEffect(() => {
  //   if (!isEditMode && user) {
  //     if (user.planType === 'free') {
  //       // Check if user has reached the form limit
  //       const checkFormLimit = async () => {
  //         try {
  //           const response = await apiRequest('GET', '/api/forms');
  //           const forms = await response.json();

  //           if (forms && forms.length >= 3) {
  //             toast({
  //               title: "Free plan limit reached",
  //               description: "You've reached the limit of 3 forms on the free plan. Upgrade to Premium for unlimited forms.",
  //               variant: "destructive",
  //             });
  //             setLocation('/dashboard/forms');
  //           }
  //         } catch (error) {
  //           console.error('Error checking form limit:', error);
  //         }
  //       };

  //       checkFormLimit();
  //     }
  //   }
  // }, [user, isEditMode, setLocation, toast]);

  // Update form handler
  const handleFormUpdate = (updatedForm: Form) => {
    setForm(updatedForm)
    setFormHasChanged(true)
  }

  // Update element handler
  const handleElementUpdate = (updatedElement: FormElementType) => {
    const updatedElements = form.elements.map((element) =>
      element.id === updatedElement.id ? updatedElement : element,
    )

    setForm({
      ...form,
      elements: updatedElements,
    })

    setFormHasChanged(true)
  }

  // Add element handler
  const handleAddElement = (elementType: string) => {
    const newElement = createNewElement(elementType)
    if (!newElement) return

    setForm({
      ...form,
      elements: [...form.elements, newElement],
    })

    setSelectedElementId(newElement.id)
    setFormHasChanged(true)
  }

  // Save form handler
  const handleSaveForm = () => {
    formMutation.mutate({
      title: form.title,
      description: form.description,
      elements: form.elements,
      settings: form.settings,
      theme: form.theme,
      status: form.status, // Keep current status
      expiresAt: form.expiresAt,
    })
  }

  // Publish form handler
  const handlePublishForm = () => {
    formMutation.mutate({
      title: form.title,
      description: form.description,
      elements: form.elements,
      settings: form.settings,
      theme: form.theme,
      status: "published",
      expiresAt: form.expiresAt,
    })
  }

  // Add a draft handler for when form is published but has changes
  const handleSaveAsDraft = () => {
    formMutation.mutate({
      title: form.title,
      description: form.description,
      elements: form.elements,
      settings: form.settings,
      theme: form.theme,
      status: "draft",
      expiresAt: form.expiresAt,
    })
  }

  // Preview form handler
  const handlePreviewForm = () => {
    setIsPreviewOpen(true)
  }

  // Copy form link to clipboard
  const copyFormLink = () => {
    if (!formId) return

    const link = `${window.location.origin}/form/${formId}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Form link has been copied to clipboard.",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the form link to clipboard.",
          variant: "destructive",
        })
      })
  }

  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    if (!formId) return

    const embedCode = `<iframe src="${window.location.origin}/form/${formId}" width="100%" height="500" frameborder="0"></iframe>`
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        toast({
          title: "Code copied",
          description: "Embed code has been copied to clipboard.",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy the embed code to clipboard.",
          variant: "destructive",
        })
      })
  }

  // Loading state
  if (isEditMode && isLoadingForm) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  // Update the header buttons logic
  const showPublishButton =
    !isEditMode || form.status === "draft" || (formHasChanged && lastSavedStatus === "published")
  const showShareButton = isEditMode && lastSavedStatus === "published" && !formHasChanged

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
              <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Form" : "Create Form"}</h1>
              <p className="text-muted-foreground">
                {isEditMode ? "Modify your existing form" : "Build a new form to collect responses"}
              </p>
            </div>
          </div>

          {/* Update the header buttons section */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSaveForm} disabled={formMutation.isPending || !formHasChanged}>
              {formMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShareDialogOpen(true)}
                  disabled={formMutation.isPending || !showShareButton}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                {showPublishButton ? (
                  <Button onClick={handlePublishForm} disabled={formMutation.isPending}>
                    {formMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Publish
                  </Button>
                ) : (
                  <>
                    <Button onClick={handlePreviewForm} disabled={formMutation.isPending}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    {formHasChanged && (
                      <Button variant="outline" onClick={handleSaveAsDraft} disabled={formMutation.isPending}>
                        Save as Draft
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Remove the premium features alert:
        Comment out or remove this Alert component: */}
        {/* {user?.planType === 'free' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Free Plan Limitations</AlertTitle>
            <AlertDescription>
              Some features are only available on the Premium plan, such as email notifications, CAPTCHA protection, and custom redirects.
            </AlertDescription>
          </Alert>
        )} */}

        {/* Form Builder Layout */}
        {isPreviewOpen ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex justify-end mb-4">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close Preview
              </Button>
            </div>
            <FormPreview form={form} inBuilder={true} onClose={() => setIsPreviewOpen(false)} />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-12">
            {/* Elements Panel */}
            <div className="md:col-span-3">
              <ElementsPanel onAddElement={handleAddElement} />
            </div>

            {/* Form Canvas */}
            <div className="md:col-span-6">
              <FormCanvas
                form={form}
                onFormChange={handleFormUpdate}
                selectedElementId={selectedElementId}
                onElementSelect={setSelectedElementId}
              />
            </div>

            {/* Properties Panel */}
            <div className="md:col-span-3">
              <PropertiesPanel
                form={form}
                selectedElementId={selectedElementId}
                onFormUpdate={handleFormUpdate}
                onElementUpdate={handleElementUpdate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Share Form Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Form</DialogTitle>
            <DialogDescription>Share your form using a link or embed it on your website</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Form Link</Label>
              <div className="flex space-x-2">
                <Input readOnly value={formId ? `${window.location.origin}/form/${formId}` : ""} />
                <Button variant="secondary" size="icon" onClick={copyFormLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link directly with people to let them fill out your form
              </p>
            </div>

            <div className="space-y-2">
              <Label>Embed Code</Label>
              <div className="flex space-x-2">
                <Input
                  readOnly
                  value={
                    formId
                      ? `<iframe src="${window.location.origin}/form/${formId}" width="100%" height="500" frameborder="0"></iframe>`
                      : ""
                  }
                />
                <Button variant="secondary" size="icon" onClick={copyEmbedCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Use this code to embed the form on your website</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default FormBuilder
