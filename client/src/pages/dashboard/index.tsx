"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Form, FormSubmission, UserType } from "@/lib/types"
import { BarChart3, FilePlus, FileText, PlusCircle, ArrowRight, Clock, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"

const Dashboard = () => {
  const [, setLocation] = useLocation()

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  })

  // Fetch forms
  const { data: forms, isLoading: isLoadingForms } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  })

  // Fetch submission counts
  const { data: submissionData, isLoading: isLoadingSubmissions } = useQuery<{
    formCounts: { [formId: string]: number }
    totalCount: number
  }>({
    queryKey: ["/api/forms/submissions-count"],
    enabled: !!forms && forms.length > 0,
  })

  // Fetch recent submissions
  const { data: recentSubmissions, isLoading: isLoadingRecentSubmissions } = useQuery<FormSubmission[]>({
    queryKey: ["/api/forms/recent-submissions"],
    enabled: !!forms && forms.length > 0,
  })

  // Check URL for query parameters (e.g., after payment)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get("payment")

    if (paymentStatus === "success") {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleCreateForm = () => {
    setLocation("/dashboard/forms/new")
  }

  if (isLoadingUser || isLoadingForms) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  // Calculate statistics
  const totalForms = forms?.length || 0
  const totalViews = forms?.reduce((sum, form) => sum + (form.views || 0), 0) || 0
  const totalSubmissions = submissionData?.totalCount || 0

  const formsLimit = user?.planType === "premium" ? "Unlimited" : "3"
  const submissionsLimit = user?.planType === "premium" ? "Unlimited" : "100"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.username}!</h1>
            <p className="text-muted-foreground">Here's an overview of your forms and recent activity.</p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={handleCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create new form
          </Button>
        </div>

        {/* Plan status alert for free users */}
        {user?.planType === "free" && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">
            <AlertTitle className="flex items-center">Free Plan: {totalForms} of 3 forms used</AlertTitle>
            <AlertDescription>
              You can create {Math.max(0, 3 - totalForms)} more forms on the free plan.
              <Button
                variant="link"
                className="text-amber-800 dark:text-amber-200 p-0 h-auto font-medium"
                onClick={() => setLocation("/pricing")}
              >
                Upgrade to Premium
              </Button>{" "}
              for unlimited forms and more features.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalForms}</div>
              <p className="text-xs text-muted-foreground">Limit: {formsLimit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground">All forms combined</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FilePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Limit: {submissionsLimit}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Forms */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Forms</h2>
            <Button variant="link" className="text-sm" onClick={() => setLocation("/dashboard/forms")}>
              View all forms
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {forms && forms.length > 0 ? (
            <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
              {forms.slice(0, 3).map((form) => {
                // Count submissions for this specific form
                const formSubmissionCount = submissionData?.formCounts[form.id] || 0

                return (
                  <Card key={form.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base font-medium truncate">{form.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Views: {form.views || 0}</span>
                        <span>Submissions: {formSubmissionCount}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status:{" "}
                        {form.status === "published" ? (
                          <span className="text-green-600 dark:text-green-400">Published</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400">Draft</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/dashboard/forms/${form.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/dashboard/forms/${form.id}/submissions`)}
                      >
                        Submissions
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}

              {/* Create Form Card */}
              {totalForms < (user?.planType === "premium" ? Number.POSITIVE_INFINITY : 3) && (
                <Card
                  className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:border-primary-300 dark:hover:border-primary-700"
                  onClick={handleCreateForm}
                >
                  <PlusCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Create a new form</p>
                </Card>
              )}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mb-4">
                  <FilePlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No forms yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first form to start collecting responses
                </p>
                <Button onClick={handleCreateForm}>Create a form</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Submissions */}
        {forms && forms.length > 0 && (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Submissions</h2>
              <Button variant="link" className="text-sm" onClick={() => setLocation("/dashboard/forms")}>
                View all submissions
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Card className="mt-4">
              {isLoadingRecentSubmissions ? (
                <CardContent className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              ) : recentSubmissions && recentSubmissions.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentSubmissions.slice(0, 5).map((submission) => {
                    // Find the form title
                    const formTitle = forms?.find((f) => f.id === submission.formId)?.title || "Unknown Form"

                    return (
                      <div key={submission.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium">{formTitle}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>
                              {submission.createdAt
                                ? formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/dashboard/forms/${submission.formId}/submissions`)}
                        >
                          View
                        </Button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mb-4">
                    <FilePlus className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground text-center">Share your form to start collecting responses</p>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* Premium Features Upsell */}
        {user?.planType === "free" && (
          <div className="mt-6">
            <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
              <CardHeader>
                <CardTitle>Upgrade to Premium for more features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary-200 dark:bg-primary-800 p-1 mr-2">
                      <svg
                        className="h-3 w-3 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm">Unlimited forms</span>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary-200 dark:bg-primary-800 p-1 mr-2">
                      <svg
                        className="h-3 w-3 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm">Unlimited submissions</span>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary-200 dark:bg-primary-800 p-1 mr-2">
                      <svg
                        className="h-3 w-3 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                  <div className="flex items-start">
                    <div className="rounded-full bg-primary-200 dark:bg-primary-800 p-1 mr-2">
                      <svg
                        className="h-3 w-3 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm">Email notifications</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setLocation("/pricing")}>
                  View Plans & Upgrade
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
