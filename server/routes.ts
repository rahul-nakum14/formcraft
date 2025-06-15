import type { Express, Request, Response } from "express"
import { createServer, type Server } from "http"
import Stripe from "stripe"
import { storage } from "./storage"
import { authMiddleware } from "./middleware/auth"
import { rateLimiter } from "./middleware/rate-limiter"
import filesRouter from "./routes/files"
import { setupAuth } from "./services/auth"
import { authenticateToken } from "./middleware/auth"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    })
  : null

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app)

  // Add files router
  app.use("/api/files", filesRouter)

  // Auth routes
  setupAuth(app)

  // Apply rate limiting to API routes
  app.use("/api", rateLimiter)

  // User profile route
  app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Don't send password
      const { password, ...userWithoutPassword } = user
      res.json(userWithoutPassword)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  // Dashboard stats route
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const userId = req.userId!

      // Get user's forms
      const forms = await storage.getForms(userId)

      // Calculate total submissions across all forms
      let totalSubmissions = 0
      let totalViews = 0

      for (const form of forms) {
        const submissions = await storage.getSubmissions(form.id)
        totalSubmissions += submissions.length
        totalViews += form.views || 0
      }

      const stats = {
        totalForms: forms.length,
        totalSubmissions,
        totalViews,
        activeForms: forms.filter((f) => f.status === "published").length,
      }

      res.json(stats)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  // Forms routes
  app.get("/api/forms", authenticateToken, async (req, res) => {
    try {
      const forms = await storage.getForms(req.userId!)
      res.json(forms)
    } catch (error) {
      console.error("Error fetching forms:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  app.get("/api/forms/:id", authenticateToken, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      // Check if user owns this form
      if (form.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" })
      }

      res.json(form)
    } catch (error) {
      console.error("Error fetching form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  app.post("/api/forms", authenticateToken, async (req, res) => {
    try {
      const formData = {
        ...req.body,
        userId: req.userId!,
        shareUrl: `${req.protocol}://${req.get("host")}/form/${Math.random().toString(36).substring(2, 15)}`,
      }

      const form = await storage.createForm(formData)
      res.status(201).json(form)
    } catch (error) {
      console.error("Error creating form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  app.put("/api/forms/:id", authenticateToken, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" })
      }

      const updatedForm = await storage.updateForm(req.params.id, req.body)
      res.json(updatedForm)
    } catch (error) {
      console.error("Error updating form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  app.delete("/api/forms/:id", authenticateToken, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" })
      }

      await storage.deleteForm(req.params.id)
      res.json({ message: "Form deleted successfully" })
    } catch (error) {
      console.error("Error deleting form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  // Form submissions routes
  app.get("/api/forms/:id/submissions", authenticateToken, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" })
      }

      const { startDate, endDate } = req.query
      let submissions

      if (startDate && endDate) {
        submissions = await storage.getSubmissionsByDateRange(
          req.params.id,
          new Date(startDate as string),
          new Date(endDate as string),
        )
      } else {
        submissions = await storage.getSubmissions(req.params.id)
      }

      res.json(submissions)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  // Analytics routes
  app.get("/api/forms/:id/analytics", authenticateToken, async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.userId !== req.userId) {
        return res.status(403).json({ message: "Access denied" })
      }

      const { startDate, endDate } = req.query
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = endDate ? new Date(endDate as string) : new Date()

      // Get submissions and views for the date range
      const submissions = await storage.getSubmissionsByDateRange(form.id, start, end)
      const views = await storage.getFormViewsByDateRange(form.id, start, end)

      // Group by date
      const analytics = []
      const currentDate = new Date(start)

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0]
        const daySubmissions = submissions.filter(
          (s) => s.createdAt && s.createdAt.toISOString().split("T")[0] === dateStr,
        ).length
        const dayViews = views.filter((v) => v.timestamp && v.timestamp.toISOString().split("T")[0] === dateStr).length

        analytics.push({
          date: dateStr,
          submissions: daySubmissions,
          views: dayViews,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      res.json(analytics)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  // Public form routes (no auth required)
  app.get("/api/public/forms/:id", async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.status !== "published") {
        return res.status(404).json({ message: "Form not available" })
      }

      // Increment view count
      await storage.incrementFormViews(req.params.id)

      // Create view record
      await storage.createViewRecord({
        formId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referer"),
      })

      res.json(form)
    } catch (error) {
      console.error("Error fetching public form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

  app.post("/api/public/forms/:id/submit", async (req, res) => {
    try {
      const form = await storage.getForm(req.params.id)
      if (!form) {
        return res.status(404).json({ message: "Form not found" })
      }

      if (form.status !== "published") {
        return res.status(400).json({ message: "Form is not accepting submissions" })
      }

      // Create submission
      const submission = await storage.createSubmission({
        formId: req.params.id,
        data: req.body,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      })

      res.status(201).json({
        message: "Form submitted successfully",
        submissionId: submission.id,
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      res.status(500).json({ message: "Internal server error" })
    }
  })

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
