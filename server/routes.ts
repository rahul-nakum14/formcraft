import type { Express, Request, Response } from "express"
import { createServer, type Server } from "http"
import Stripe from "stripe"
import { storage } from "./storage"
import { sendVerificationEmail, sendPasswordResetEmail, sendFormSubmissionNotification } from "./services/email"
import { generateToken, hashPassword, comparePassword } from "./services/auth"
import { authMiddleware } from "./middleware/auth"
import { rateLimiter } from "./middleware/rate-limiter"
import { z } from "zod"
import { insertUserSchema, insertFormSchema } from "@shared/schema"
import crypto from "crypto"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    })
  : null

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app)

  // Rate limiter for sensitive routes
  const authRateLimiter = rateLimiter(10, 60 * 1000) // 10 requests per minute
  const formSubmitRateLimiter = rateLimiter(30, 60 * 1000) // 30 requests per minute

  // AUTHENTICATION ROUTES
  app.post("/api/auth/register", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body)

      // Check if user already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email)
      if (existingEmail) {
        return res.status(400).json({ message: "Email is already in use" })
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username)
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" })
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex")

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password)

      // Create user with verification token
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        verificationToken,
      })

      // Send verification email
      await sendVerificationEmail(user.email, verificationToken)

      // Return success but don't include sensitive data
      res.status(201).json({
        message: "User registered successfully. Please check your email to verify your account.",
        userId: user.id,
      })
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors })
      }
      res.status(500).json({ message: "Error registering user: " + error.message })
    }
  })

  app.post("/api/auth/verify", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(400).json({ message: "Verification token is required" })
      }

      const user = await storage.getUserByVerificationToken(token)
      if (!user) {
        return res.status(400).json({ message: "Invalid verification token" })
      }

      // Verify the user
      await storage.verifyUser(user.id)

      res.json({ message: "Email verified successfully. You can now log in." })
    } catch (error: any) {
      res.status(500).json({ message: "Error verifying email: " + error.message })
    }
  })

  app.post("/api/auth/login", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" })
      }

      const user = await storage.getUserByEmail(email)
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" })
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: "Please verify your email before logging in" })
      }

      const isPasswordValid = await comparePassword(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" })
      }

      // Generate JWT token
      const token = generateToken(user)

      // Set the token as a cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          planType: user.planType,
        },
      })
    } catch (error: any) {
      res.status(500).json({ message: "Error logging in: " + error.message })
    }
  })

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      // Clear the auth cookie
      res.clearCookie("token")
      res.json({ message: "Logout successful" })
    } catch (error: any) {
      res.status(500).json({ message: "Error logging out: " + error.message })
    }
  })

  app.post("/api/auth/forgot-password", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ message: "Email is required" })
      }

      const user = await storage.getUserByEmail(email)
      if (!user) {
        // Return 200 even if user doesn't exist for security reasons
        return res.json({ message: "If your email is registered, you will receive a password reset link" })
      }

      // Generate reset token and expiry (1 hour)
      const resetToken = crypto.randomBytes(32).toString("hex")
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 1)

      // Update user with reset token and expiry
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: expiry,
      })

      // Send password reset email
      await sendPasswordResetEmail(user.email, resetToken)

      res.json({ message: "If your email is registered, you will receive a password reset link" })
    } catch (error: any) {
      res.status(500).json({ message: "Error requesting password reset: " + error.message })
    }
  })

  app.post("/api/auth/reset-password", authRateLimiter, async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" })
      }

      const user = await storage.getUserByResetToken(token)
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" })
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword)

      // Update user with new password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpiry: undefined,
      })

      res.json({ message: "Password reset successful. You can now log in with your new password." })
    } catch (error: any) {
      res.status(500).json({ message: "Error resetting password: " + error.message })
    }
  })

  // USER ROUTES
  app.get("/api/user/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const user = await storage.getUser(userId)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Don't include sensitive data
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        planType: user.planType,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        createdAt: user.createdAt,
      })
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user profile: " + error.message })
    }
  })

  app.patch("/api/user/profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const { username, email } = req.body

      // Only allow updating username and email
      const updateData: any = {}
      if (username) updateData.username = username
      if (email) updateData.email = email

      const updatedUser = await storage.updateUser(userId, updateData)

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" })
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        planType: updatedUser.planType,
      })
    } catch (error: any) {
      res.status(500).json({ message: "Error updating user profile: " + error.message })
    }
  })

  // FORM ROUTES
  app.post("/api/forms", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const user = await storage.getUser(userId)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Check if user is on free plan and already has 3 forms
      if (user.planType === "free") {
        const formsCount = await storage.getUserFormsCount(userId)
        if (formsCount >= 3) {
          return res.status(403).json({
            message: "Free plan is limited to 3 forms. Please upgrade to create more forms.",
          })
        }
      }

      const formData = {
        ...req.body,
        userId,
      }

      const validatedData = insertFormSchema.parse(formData)
      const form = await storage.createForm(validatedData)

      res.status(201).json(form)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors })
      }
      res.status(500).json({ message: "Error creating form: " + error.message })
    }
  })

  app.get("/api/forms", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const status = req.query.status as string

      const forms = status ? await storage.getFormsByStatus(userId, status) : await storage.getForms(userId)

      res.json(forms)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching forms: " + error.message })
    }
  })

  app.get("/api/forms/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this form" })
      }

      res.json(form)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching form: " + error.message })
    }
  })

  app.patch("/api/forms/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this form" })
      }

      const updatedForm = await storage.updateForm(formId, req.body)

      res.json(updatedForm)
    } catch (error: any) {
      res.status(500).json({ message: "Error updating form: " + error.message })
    }
  })

  app.delete("/api/forms/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this form" })
      }

      const success = await storage.deleteForm(formId)

      if (success) {
        res.json({ message: "Form deleted successfully" })
      } else {
        res.status(500).json({ message: "Error deleting form" })
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting form: " + error.message })
    }
  })

  // Add this endpoint after the existing form routes, around line 200
  app.get("/api/forms/submissions-count", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      // Get all forms for this user
      const forms = await storage.getForms(userId)

      if (!forms || forms.length === 0) {
        return res.json({})
      }

      // Get submission count for each form
      const submissionCounts: { [formId: string]: number } = {}
      let totalSubmissions = 0

      for (const form of forms) {
        const submissions = await storage.getSubmissions(form.id)
        submissionCounts[form.id] = submissions.length
        totalSubmissions += submissions.length
      }

      res.json({
        formCounts: submissionCounts,
        totalCount: totalSubmissions,
      })
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching submission counts: " + error.message })
    }
  })

  // PUBLIC FORM ROUTES (No auth required)
  app.get("/api/public/forms/:id", async (req: Request, res: Response) => {
    try {
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Check if form is published
      if (form.status !== "published") {
        return res.status(403).json({ message: "This form is not currently available" })
      }

      // Check if form is expired
      if (
        form.expiresAt &&
        new Date(
          typeof form.expiresAt === 'string' || typeof form.expiresAt === 'number'
            ? form.expiresAt
            : form.expiresAt instanceof Date
              ? form.expiresAt.toISOString()
              : form.expiresAt.toString()
        ) < new Date()
      ) {
        return res.status(403).json({ message: "This form has expired" })
      }

      // Record view and increment form views
      await storage.createViewRecord({
        formId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        referrer: req.headers.referer,
      })

      await storage.incrementFormViews(formId)

      // Return form without sensitive data
      const publicForm = {
        id: form.id,
        title: form.title,
        description: form.description,
        elements: form.elements,
        theme: form.theme,
      }

      res.json(publicForm)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching form: " + error.message })
    }
  })

  app.post("/api/public/forms/:id/submit", formSubmitRateLimiter, async (req: Request, res: Response) => {
    try {
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Check if form is published
      if (form.status !== "published") {
        return res.status(403).json({ message: "This form is not currently available" })
      }

      // Check if form is expired
      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        return res.status(403).json({ message: "This form has expired" })
      }

      // Get user info
      const user = await storage.getUser(form.userId)

      if (!user) {
        return res.status(500).json({ message: "Form owner not found" })
      }

      // Check if free plan submission limit reached
      if (user.planType === "free") {
        const submissions = await storage.getSubmissions(formId)
        if (submissions.length >= 100) {
          return res.status(403).json({
            message: "This form has reached its submission limit. Please contact the form owner.",
          })
        }
      }

      // Create submission
      const submission = await storage.createSubmission({
        formId,
        data: req.body,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      })

      // Send notification email if enabled (premium only)
      if (user.planType === "premium" && form.settings?.emailNotifications) {
        await sendFormSubmissionNotification(user.email, form.title, submission)
      }

      // Return success message or redirect
      if (form.settings?.redirectUrl) {
        res.json({
          message: form.settings.successMessage || "Form submitted successfully",
          redirectUrl: form.settings.redirectUrl,
        })
      } else {
        res.json({
          message: form.settings?.successMessage || "Form submitted successfully",
        })
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error submitting form: " + error.message })
    }
  })

  // SUBMISSIONS ROUTES
  app.get("/api/forms/:id/submissions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access submissions for this form" })
      }

      // Get date range if provided
      const { startDate, endDate } = req.query
      let submissions

      if (startDate && endDate) {
        submissions = await storage.getSubmissionsByDateRange(
          formId,
          new Date(startDate as string),
          new Date(endDate as string),
        )
      } else {
        submissions = await storage.getSubmissions(formId)
      }

      res.json(submissions)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching submissions: " + error.message })
    }
  })

  // Add recent submissions endpoint
  app.get("/api/forms/recent-submissions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      // Get all forms for this user
      const forms = await storage.getForms(userId)

      if (!forms || forms.length === 0) {
        return res.json([])
      }

      // Get recent submissions from all user's forms
      const allSubmissions = []
      for (const form of forms) {
        const submissions = await storage.getSubmissions(form.id)
        allSubmissions.push(...submissions)
      }

      // Sort by creation date and return the most recent ones
      const recentSubmissions = allSubmissions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10) // Get last 10 submissions

      res.json(recentSubmissions)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching recent submissions: " + error.message })
    }
  })

  // Add all submissions endpoint for analytics
  app.get("/api/forms/all-submissions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id

      // Get all forms for this user
      const forms = await storage.getForms(userId)

      if (!forms || forms.length === 0) {
        return res.json([])
      }

      // Get all submissions from all user's forms
      const allSubmissions = []
      for (const form of forms) {
        const submissions = await storage.getSubmissions(form.id)
        allSubmissions.push(...submissions)
      }

      res.json(allSubmissions)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching all submissions: " + error.message })
    }
  })

  app.get("/api/submissions/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const submissionId = req.params.id

      const submission = await storage.getSubmission(submissionId)

      if (!submission) {
        return res.status(404).json({ message: "Submission not found" })
      }

      // Get form to check ownership
      const form = await storage.getForm(submission.formId)

      if (!form) {
        return res.status(404).json({ message: "Associated form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access this submission" })
      }

      res.json(submission)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching submission: " + error.message })
    }
  })

  // ANALYTICS ROUTES
  app.get("/api/forms/:id/analytics", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id
      const formId = req.params.id

      const form = await storage.getForm(formId)

      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Ensure user owns the form
      if (form.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to access analytics for this form" })
      }

      // Get user to check plan type
      const user = await storage.getUser(userId)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Get basic analytics
      const submissions = await storage.getSubmissions(formId)
      const views = await storage.getFormViews(formId)

      const basicAnalytics = {
        views: form.views,
        submissions: submissions.length,
        conversionRate: views > 0 ? (submissions.length / views) * 100 : 0,
      }

      // Return advanced analytics for premium users
      if (user.planType === "premium") {
        // Get date range if provided
        const { startDate, endDate } = req.query
        const start = startDate ? new Date(startDate as string) : new Date(form.createdAt)
        const end = endDate ? new Date(endDate as string) : new Date()

        // Get views and submissions by date range
        const viewRecords = await storage.getFormViewsByDateRange(formId, start, end)
        const dateSubmissions = await storage.getSubmissionsByDateRange(formId, start, end)

        // Process advanced analytics
        const deviceInfo: Record<string, number> = {}
        const geoLocations: Record<string, number> = {}
        const referrers: Record<string, number> = {}

        // Process view records for device and geo data
        viewRecords.forEach((view) => {
          // Process device info
          if (view.userAgent) {
            const device = view.userAgent.includes("Mobile") ? "Mobile" : "Desktop"
            deviceInfo[device] = (deviceInfo[device] || 0) + 1
          }

          // Process geo location
          if (view.geoLocation?.country) {
            const country = view.geoLocation.country
            geoLocations[country] = (geoLocations[country] || 0) + 1
          }

          // Process referrers
          if (view.referrer) {
            try {
              const url = new URL(view.referrer)
              const hostname = url.hostname
              referrers[hostname] = (referrers[hostname] || 0) + 1
            } catch (e) {
              // Invalid URL, skip
            }
          }
        })

        const advancedAnalytics = {
          ...basicAnalytics,
          deviceInfo,
          geoLocations,
          referrers,
          dateRange: { start, end },
        }

        return res.json(advancedAnalytics)
      }

      // Return basic analytics for free users
      res.json(basicAnalytics)
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching analytics: " + error.message })
    }
  })

  // STRIPE SUBSCRIPTION ROUTES
  if (stripe) {
    // Payment intent for one-time payments
    app.post("/api/create-payment-intent", authMiddleware, async (req: Request, res: Response) => {
      try {
        const { amount } = req.body

        if (!amount) {
          return res.status(400).json({ message: "Amount is required" })
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to smallest currency unit
          currency: "inr",
          metadata: {
            userId: req.user!.id,
          },
        })

        res.json({ clientSecret: paymentIntent.client_secret })
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message })
      }
    })

    // Create or retrieve subscription
    app.post("/api/get-or-create-subscription", authMiddleware, async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id
        const user = await storage.getUser(userId)

        if (!user) {
          return res.status(404).json({ message: "User not found" })
        }

        // If user already has a subscription, retrieve it
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

          // Check if there's a payment intent to return
          let clientSecret = null
          if (subscription.latest_invoice) {
            const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string)
            // @ts-ignore - Stripe types don't include payment_intent but it exists in the API response
            if (invoice.payment_intent) {
              // @ts-ignore
              const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent as string)
              clientSecret = paymentIntent.client_secret
            }
          }

          return res.json({
            subscriptionId: subscription.id,
            clientSecret,
          })
        }

        // Create a new customer if needed
        let customerId = user.stripeCustomerId

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
          })
          customerId = customer.id
          await storage.updateStripeInfo(userId, customerId)
        }

        // Create a new subscription
        // First create a product and price if they don't exist
        const product = await stripe.products.create({
          name: "FormCraft Premium Subscription",
          description: "Monthly subscription to FormCraft Premium",
        })

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 99900, // 999 INR in paise
          currency: "inr",
          recurring: {
            interval: "month",
          },
        })

        // Create the subscription with the price ID
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: price.id,
            },
          ],
          payment_behavior: "default_incomplete",
          payment_settings: {
            save_default_payment_method: "on_subscription",
          },
          expand: ["latest_invoice.payment_intent"],
        })

        // Update user with subscription info
        await storage.updateStripeInfo(userId, customerId, subscription.id)

        // Get client secret for frontend
        // @ts-ignore - Type definitions don't match actual API response
        const invoice = subscription.latest_invoice
        // @ts-ignore
        const paymentIntent = invoice.payment_intent

        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent.client_secret,
        })
      } catch (error: any) {
        res.status(500).json({ message: "Error creating subscription: " + error.message })
      }
    })

    app.post("/api/create-checkout-session", authMiddleware, async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id
        const user = await storage.getUser(userId)

        if (!user) {
          return res.status(404).json({ message: "User not found" })
        }

        // Create a new customer or use existing one
        let customerId = user.stripeCustomerId

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.username,
          })
          customerId = customer.id
          await storage.updateStripeInfo(userId, customerId)
        }

        // Create checkout session with billing address collection
        // Required for Indian exports compliance
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: "FormCraft Premium Subscription",
                  description: "Monthly subscription to FormCraft Premium",
                },
                unit_amount: 99900, // 999 INR in paise
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${req.headers.origin}/dashboard?payment=success`,
          cancel_url: `${req.headers.origin}/pricing?payment=cancelled`,
          billing_address_collection: "required", // Collect address for India export compliance
          customer_update: {
            address: "auto",
            name: "auto",
          },
          metadata: {
            userId,
          },
        })

        res.json({ sessionId: session.id, url: session.url })
      } catch (error: any) {
        res.status(500).json({ message: "Error creating checkout session: " + error.message })
      }
    })

    app.post("/api/customer-portal", authMiddleware, async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id
        const user = await storage.getUser(userId)

        if (!user) {
          return res.status(404).json({ message: "User not found" })
        }

        if (!user.stripeCustomerId) {
          return res.status(400).json({ message: "No subscription found" })
        }

        // Create customer portal session
        const session = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${req.headers.origin}/dashboard/settings`,
        })

        res.json({ url: session.url })
      } catch (error: any) {
        res.status(500).json({ message: "Error creating customer portal session: " + error.message })
      }
    })

    // Webhook endpoint to handle subscription events
    app.post("/api/webhook", async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

      if (!endpointSecret) {
        return res.status(400).json({ message: "Webhook secret is not configured" })
      }

      let event

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session
          // Update user with subscription details
          if (session.metadata?.userId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            await storage.updateStripeInfo(session.metadata.userId, session.customer as string, subscription.id)
          }
          break
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription
          // Find user by stripeCustomerId and update
          const user = await storage.getUserByEmail(subscription.customer as string)
          if (user) {
            await storage.updateUser(user.id, {
              planType: subscription.status === "active" ? "premium" : "free",
              stripeSubscriptionId: subscription.id,
            })
          }
          break
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription
          // Find user by stripeCustomerId and downgrade
          const user = await storage.getUserByEmail(subscription.customer as string)
          if (user) {
            await storage.updateUser(user.id, {
              planType: "free",
              stripeSubscriptionId: undefined,
            })
          }
          break
        }
      }

      res.json({ received: true })
    })
  }

  return httpServer
}
