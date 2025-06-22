// User Types
export interface UserType {
  id: string
  email: string
  username: string
  planType: "free" | "premium"
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
}

// Form Types
export interface Form {
  id: string
  userId: string
  title: string
  description?: string
  status: "draft" | "published"
  elements: FormElement[]
  settings: FormSettings
  theme: FormTheme
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  shareUrl?: string
  embedCode?: string
  views: number
}

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

export interface FormSettings {
  successMessage: string
  redirectUrl?: string
  captchaEnabled: boolean
  emailNotifications: boolean
  notificationEmails?: string[]
  autoResponder?: boolean
  autoResponderTemplate?: string
}

export interface FormTheme {
  primaryColor: string
  backgroundColor: string
  textColor?: string
  backgroundImage?: string
  fontFamily?: string
  pageBackgroundColor?: string // Add this new field
}

// Form Submission Types
export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  createdAt: Date
  ipAddress?: string
  userAgent?: string
  geoLocation?: Record<string, any>
}

// Analytics Types
export interface Analytics {
  views: number
  submissions: number
  conversionRate: number
  timeOnForm?: number
  deviceInfo?: Record<string, number>
  geoLocations?: Record<string, number>
  referrers?: Record<string, number>
  dateRange?: {
    start: Date
    end: Date
  }
}

// View Record Types
export interface ViewRecord {
  id: string
  formId: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  geoLocation?: Record<string, any>
  referrer?: string
}

// Subscription Types
export interface PlanType {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    forms: number
    submissions: number
    isPremium: boolean
  }
}
