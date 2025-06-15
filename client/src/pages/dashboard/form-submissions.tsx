"use client"

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Download, FileText, Eye, Trash2 } from "lucide-react"

interface Submission {
  id: string
  formId: string
  data: any
  createdAt: string
  updatedAt: string
}

const formSchema = z.object({
  note: z
    .string()
    .min(2, {
      message: "Note must be at least 2 characters.",
    })
    .max(30, {
      message: "Note must not be longer than 30 characters.",
    }),
})

const FormSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [formId, setFormId] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const { toast } = useToast()

  // Add this function to handle file downloads
  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 font-mono text-white">
          <code className="block">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    })
  }

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/form/${formId}/submissions`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setSubmissions(data)
      } catch (error) {
        console.error("Could not fetch submissions:", error)
      }
    }

    if (formId) {
      fetchSubmissions()
    }
  }, [formId])

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const submission = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSubmission(submission)
                  setOpen(true)
                }}
              >
                <Eye className="h-3 w-3 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-3 w-3 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: submissions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Submissions</CardTitle>
        <CardDescription>Select a form to view its submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={(value) => setFormId(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="656c5190a56915599896166b">Contact Form</SelectItem>
            <SelectItem value="656c5190a56915599896166c">Application Form</SelectItem>
            <SelectItem value="656c5190a56915599896166d">Feedback Form</SelectItem>
          </SelectContent>
        </Select>
        {submissions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>{/* Pagination controls */}</TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <p>No submissions found for this form.</p>
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>View all the information about this submission.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedSubmission && (
              <>
                {Object.entries(selectedSubmission.data).map(([key, value]) => {
                  // Check if this is a file field
                  if (typeof value === "object" && value !== null && "url" in value && "name" in value) {
                    return (
                      <div key={key} className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-gray-100">
                          <div className="flex items-center space-x-2">
                            <span>{value.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFileDownload(value.url, value.name)}
                              className="h-6 px-2 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Size: {((value.size || 0) / (1024 * 1024)).toFixed(2)}MB
                          </p>
                        </dd>
                      </div>
                    )
                  }

                  // Regular field display
                  return (
                    <div key={key} className="space-y-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd className="text-sm text-gray-900 dark:text-gray-100">
                        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                      </dd>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default FormSubmissions
