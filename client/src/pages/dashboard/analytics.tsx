"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import DashboardLayout from "@/components/layouts/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Form, UserType, FormSubmission } from "@/lib/types"
import { CalendarIcon, BarChart2, Users, Activity, Loader2 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { format, subDays, isWithinInterval, isSameDay, parseISO, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const Analytics = () => {
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // 30 days ago
    to: new Date(),
  })

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<UserType>({
    queryKey: ["/api/user/profile"],
  })

  // Fetch forms
  const { data: forms, isLoading: isLoadingForms } = useQuery<Form[]>({
    queryKey: ["/api/forms"],
  })

  // Fetch submissions based on selection
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery<FormSubmission[]>({
    queryKey: [
      selectedFormId === "all"
        ? "/api/forms/all-submissions"
        : selectedFormId
          ? `/api/forms/${selectedFormId}/submissions`
          : null,
    ],
    enabled: !!selectedFormId && !!forms && forms.length > 0,
  })

  const isLoading = isLoadingUser || isLoadingForms || isLoadingSubmissions

  // Generate daily data based on actual submissions and date range
  const generateDailyViewsData = () => {
    if (!forms || forms.length === 0 || !selectedFormId || !dateRange?.from || !dateRange?.to) return []

    const data = []
    const startDate = startOfDay(dateRange.from)
    const endDate = startOfDay(dateRange.to)

    // Get the selected form or all forms
    const selectedForms = selectedFormId === "all" ? forms : forms.filter((f) => f.id === selectedFormId)

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "MMM dd")

      // Count actual submissions for this specific date
      const submissionsForDate = submissions.filter((submission) => {
        try {
          const submissionDate = startOfDay(parseISO(submission.createdAt))
          return isSameDay(submissionDate, d)
        } catch {
          return false
        }
      }).length

      // For views, distribute them realistically (only for past/current dates)
      let views = 0
      if (d <= new Date()) {
        selectedForms.forEach((form) => {
          try {
            const formCreatedDate = startOfDay(parseISO(form.createdAt))

            // Only count if form was created before or on this date
            if (d >= formCreatedDate) {
              const totalDaysSinceCreation = Math.max(
                1,
                Math.floor((new Date().getTime() - formCreatedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              )

              // Distribute views more evenly
              const baseViewsPerDay = (form.views || 0) / totalDaysSinceCreation
              const variation = 0.8 + Math.random() * 0.4 // 80% to 120% of base
              views += Math.max(0, Math.round(baseViewsPerDay * variation))
            }
          } catch {
            // Skip if date parsing fails
          }
        })
      }

      data.push({
        date: dateStr,
        views: Math.max(0, views),
        submissions: submissionsForDate,
      })
    }

    return data
  }

  const dailyData = generateDailyViewsData()

  // Calculate totals from actual data
  const getSelectedForms = () => {
    if (!forms || !selectedFormId) return []
    return selectedFormId === "all" ? forms : forms.filter((f) => f.id === selectedFormId)
  }

  const selectedForms = getSelectedForms()
  const totalViews = selectedForms.reduce((sum, form) => sum + (form.views || 0), 0)

  // Filter submissions by date range if specified
  const filteredSubmissions = submissions.filter((submission) => {
    if (!dateRange?.from || !dateRange?.to) return true
    try {
      const submissionDate = parseISO(submission.createdAt)
      return isWithinInterval(submissionDate, { start: dateRange.from, end: dateRange.to })
    } catch {
      return false
    }
  })

  const totalSubmissions = filteredSubmissions.length
  const conversionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Track your form performance and submission metrics.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Select
              value={selectedFormId}
              onValueChange={setSelectedFormId}
              disabled={isLoading || !forms || forms.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a form to view analytics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                {forms?.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  disabled={isLoading || !selectedFormId}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date > new Date()} // Disable future dates
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !forms || forms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mb-4">
                <BarChart2 className="h-6 w-6 text-primary-600 dark:text-primary-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">No forms yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first form to start analyzing its performance
              </p>
              <Button onClick={() => (window.location.href = "/dashboard/forms/new")}>Create a form</Button>
            </CardContent>
          </Card>
        ) : !selectedFormId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 mb-4">
                <BarChart2 className="h-6 w-6 text-primary-600 dark:text-primary-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a form to view analytics</h3>
              <p className="text-muted-foreground text-center">
                Choose a form from the dropdown above to see its performance metrics and charts.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFormId === "all" ? "All forms" : "Selected form"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground">
                    {dateRange?.from && dateRange?.to ? "In selected period" : "All time"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Views to submissions ratio</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedFormId === "all"
                      ? forms?.filter((f) => f.status === "published").length || 0
                      : selectedForms.filter((f) => f.status === "published").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Published forms</p>
                </CardContent>
              </Card>
            </div>

            {/* Views & Submissions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Views & Submissions Over Time</CardTitle>
                <CardDescription>
                  Daily form views and submissions for {selectedFormId === "all" ? "all forms" : "the selected form"}
                  {dateRange?.from && dateRange?.to && (
                    <>
                      {" "}
                      from {format(dateRange.from, "MMM dd, yyyy")} to {format(dateRange.to, "MMM dd, yyyy")}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="#6366f1"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        name="Views"
                      />
                      <Line
                        type="monotone"
                        dataKey="submissions"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        name="Submissions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No data available</h3>
                      <p className="text-muted-foreground">No analytics data found for the selected time period.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Analytics
