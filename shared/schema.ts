import { z } from "zod"

// User model
export interface User {
  id: string
  email: string
  username: string
  password: string
  isVerified: boolean
  verificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpiry?: Date
  planType: "free" | "premium"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export const insertUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  isVerified: z.boolean().default(false),
  verificationToken: z.string().optional(),
  planType: z.enum(["free", "premium"]).default("premium"),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
})

export type InsertUser = z.infer<typeof insertUserSchema>

// Form model
export interface Form {
  id: string
  userId: string
  title: string
  description?: string
  status: "draft" | "published"
  elements: FormElement[]
  settings?: FormSettings
  theme?: FormTheme
  createdAt: Date
  updatedAt: Date
  expiresAt?: String | Date
  shareUrl?: string
  embedCode?: string
  views: number
}

export const insertFormSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  elements: z.array(z.any()).default([]),
  settings: z.any().default({}),
  theme: z.any().default({}),
  expiresAt: z.string().optional(),
  shareUrl: z.string().optional(),
  embedCode: z.string().optional(),
  views: z.number().default(0),
})

export const updateFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  elements: z.array(z.any()).optional(),
  settings: z.any().optional(),
  theme: z.any().optional(),
  expiresAt: z.string().optional(),
  shareUrl: z.string().optional(),
  embedCode: z.string().optional(),
})

export type InsertForm = z.infer<typeof insertFormSchema>
export type UpdateForm = z.infer<typeof updateFormSchema>

// Form Element model
export interface FormElement {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validations?: Record<string, any>
  properties?: Record<string, any>
}

// Form Settings model
export interface FormSettings {
  successMessage: string
  redirectUrl?: string
  captchaEnabled: boolean
  emailNotifications: boolean
  notificationEmails?: string[]
  autoResponder?: boolean
  autoResponderTemplate?: string
}

// Form Theme model
export interface FormTheme {
  primaryColor: string
  backgroundColor: string
  backgroundImage?: string
  fontFamily?: string
}

// Form Submission model
export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  createdAt: Date
  ipAddress?: string
  userAgent?: string
  geoLocation?: Record<string, any>
}

export const insertFormSubmissionSchema = z.object({
  formId: z.string(),
  data: z.record(z.any()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  geoLocation: z.record(z.any()).optional(),
})

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>

// Analytics model
export interface Analytics {
  id: string
  formId: string
  views: number
  submissions: number
  conversionRate: number
  timeOnForm?: number
  deviceInfo?: Record<string, any>
  referrers?: Record<string, number>
  dateRange: {
    start: Date
    end: Date
  }
}

// View Record model
export interface ViewRecord {
  id: string
  formId: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  geoLocation?: Record<string, any>
  referrer?: string
}

export const insertViewRecordSchema = z.object({
  formId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  geoLocation: z.record(z.any()).optional(),
  referrer: z.string().optional(),
})

export type InsertViewRecord = z.infer<typeof insertViewRecordSchema>
