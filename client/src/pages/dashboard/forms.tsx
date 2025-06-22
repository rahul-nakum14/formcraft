"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useLocation } from "wouter"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Form, UserType } from "@/lib/types"
import { apiRequest, queryClient } from "@/lib/queryClient"
import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  FileText,
  PencilLine,
  Share2,
  Trash2,
  Copy,
  Eye,
  MessageSquare,
  Loader2,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"

const Forms = () => {
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formToDelete, setFormToDelete] = useState<Form | null>(null)
  const [shareFormId, setShareFormId] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [toggleLoadingStates, setToggleLoadingStates] = useState<Record<string, boolean>>({})

  // Fetch user data
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  })

  // Fetch forms - sort by createdAt to maintain consistent order
  const { data: forms, isLoading } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
    select: (data) => {
      // Sort by creation date (newest first) to maintain consistent order
      return data?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (formId: string) => {
      await apiRequest("DELETE", `/api/forms/${formId}`)
    },
    onSuccess: () => {
      toast({
        title: "Form deleted",
        description: "The form has been successfully deleted.",
      })
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] })
      setShowDeleteDialog(false)
      setFormToDelete(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete form: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    },
  })

  // Fix the toggle form status mutation to maintain order
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ formId, status }: { formId: string; status: "draft" | "published" }) => {
      setToggleLoadingStates((prev) => ({ ...prev, [formId]: true }))
      await apiRequest("PATCH", `/api/forms/${formId}`, { status })
      return { formId, status }
    },
    onSuccess: (data) => {
      setToggleLoadingStates((prev) => ({ ...prev, [data.formId]: false }))
      // Update the specific form in the cache without changing order
      queryClient.setQueryData(["/api/forms"], (oldData: Form[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map((form) =>
          form.id === data.formId ? { ...form, status: data.status, updatedAt: new Date() } : form,
        )
      })
      toast({
        title: "Status updated",
        description: "Form status has been updated successfully.",
      })
    },
    onError: (error, variables) => {
      setToggleLoadingStates((prev) => ({ ...prev, [variables.formId]: false }))
      toast({
        title: "Error",
        description: `Failed to update form status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    },
  })

  // Handle create new form
  const handleCreateForm = () => {
    if (user?.planType === "free" && forms && forms.length >= 3) {
      toast({
        title: "Free plan limit reached",
        description: "You've reached the limit of 3 forms on the free plan. Upgrade to Premium for unlimited forms.",
        variant: "destructive",
      })
    } else {
      setLocation("/dashboard/forms/new")
    }
  }

  // Handle form deletion
  const handleDeleteForm = (form: Form) => {
    setFormToDelete(form)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (formToDelete) {
      deleteMutation.mutate(formToDelete.id)
    }
  }

  // Update the handleToggleStatus function
  const handleToggleStatus = (form: Form) => {
    const newStatus = form.status === "published" ? "draft" : "published"
    toggleStatusMutation.mutate({ formId: form.id, status: newStatus })
  }

  // Handle share form
  const handleShareForm = (formId: string) => {
    setShareFormId(formId)
    setShareDialogOpen(true)
  }

  // Copy form link to clipboard
  const copyFormLink = () => {
    if (!shareFormId) return

    const link = `${window.location.origin}/form/${shareFormId}`
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
    if (!shareFormId) return

    const embedCode = `<iframe src="${window.location.origin}/form/${shareFormId}" width="100%" height="500" frameborder="0"></iframe>`
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

  // Filter and search forms while maintaining order
  const filteredForms = forms?.filter((form) => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || form.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Forms</h1>
            <p className="text-muted-foreground">Manage your forms and view their performance.</p>
          </div>
          <Button onClick={handleCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create new form
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {filterStatus === "all" ? "All Forms" : filterStatus === "published" ? "Published" : "Drafts"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Forms</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("published")}>Published</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("draft")}>Drafts</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Forms list */}
        {filteredForms && filteredForms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map((form) => (
              <Card key={form.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium truncate mr-2">{form.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLocation(`/dashboard/forms/${form.id}/edit`)}>
                          <PencilLine className="mr-2 h-4 w-4" />
                          Edit form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareForm(form.id)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share form
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocation(`/dashboard/forms/${form.id}/submissions`)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          View submissions
                        </DropdownMenuItem>
                        <Separator />
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          onClick={() => handleDeleteForm(form)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="truncate">{form.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={form.status === "published" ? "success" : "secondary"}
                        className={
                          form.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : ""
                        }
                      >
                        {form.status === "published" ? "Published" : "Draft"}
                      </Badge>
                      <span className="flex items-center">
                        <Eye className="inline h-3 w-3 mr-1" />
                        {form.views}
                      </span>
                    </div>
                    <span>{form.createdAt && formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <div className="flex items-center">
                    <Label htmlFor={`form-status-${form.id}`} className="mr-2 text-sm">
                      {form.status === "published" ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`form-status-${form.id}`}
                      checked={form.status === "published"}
                      onCheckedChange={() => handleToggleStatus(form)}
                      disabled={toggleLoadingStates[form.id] || false}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setLocation(`/dashboard/forms/${form.id}/edit`)}>
                      <PencilLine className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/dashboard/forms/${form.id}/submissions`)}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Submissions
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {/* Create New Form Card */}
            {user?.planType === "premium" || (forms && forms.length < 3) ? (
              <Card
                className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:border-primary-300 dark:hover:border-primary-700"
                onClick={handleCreateForm}
              >
                <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Create a new form</p>
              </Card>
            ) : null}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mb-4">
                <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              {searchQuery || filterStatus !== "all" ? (
                <>
                  <h3 className="text-lg font-medium mb-2">No matching forms</h3>
                  <p className="text-muted-foreground text-center mb-4">Try adjusting your search or filter criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterStatus("all")
                    }}
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No forms yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first form to start collecting responses
                  </p>
                  <Button onClick={handleCreateForm}>Create a form</Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{formToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Input readOnly value={shareFormId ? `${window.location.origin}/form/${shareFormId}` : ""} />
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
                    shareFormId
                      ? `<iframe src="${window.location.origin}/form/${shareFormId}" width="100%" height="500" frameborder="0"></iframe>`
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

export default Forms
