import nodemailer from "nodemailer"
import type { FormSubmission } from "@shared/schema"

// Configure email transporter
const setupTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com"
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10)
  const user = process.env.SMTP_USER || "hanonymous371@gmail.com"
  const pass = process.env.SMTP_PASS || "dqhp wtwk flae shmv"

  if (!user || !pass) {
    console.warn("Email credentials not configured. Email sending will not work.")
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

// Send verification email
export const sendVerificationEmail = async (to: string, token: string): Promise<boolean> => {
  const transporter = setupTransporter()
  if (!transporter) return false

  const appUrl = process.env.APP_URL || "http://localhost:5000"
  const verificationUrl = `${appUrl}/verify-email?token=${token}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FormCraft" <no-reply@formcraft.app>',
      to,
      subject: "Verify your FormCraft account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your FormCraft account</h2>
          <p>Thank you for registering with FormCraft! Please click the link below to verify your email address:</p>
          <p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account with FormCraft, please ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (to: string, token: string): Promise<boolean> => {
  const transporter = setupTransporter()
  if (!transporter) return false

  const appUrl = process.env.APP_URL || "http://localhost:5000"
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FormCraft" <no-reply@formcraft.app>',
      to,
      subject: "Reset your FormCraft password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your FormCraft password</h2>
          <p>You requested a password reset for your FormCraft account. Please click the link below to reset your password:</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}

// Send form submission notification
export const sendFormSubmissionNotification = async (
  to: string,
  formTitle: string,
  submission: FormSubmission,
): Promise<boolean> => {
  const transporter = setupTransporter()
  if (!transporter) return false

  const appUrl = process.env.APP_URL || "http://localhost:5000"
  const viewUrl = `${appUrl}/dashboard/forms/${submission.formId}/submissions`

  // Generate HTML for submission data with better formatting
  const submissionDataHtml = Object.entries(submission.data)
    .map(([key, value]) => {
      let displayValue = ""

      // Handle different types of values
      if (
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "size" in value
      ) {
        // File upload
        displayValue = `📎 ${(value as { name: string; size: number }).name} (${Math.round((value as { size: number }).size / 1024)}KB)`;
      } else {
        displayValue = JSON.stringify(value);
      }

      return `
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 600; background-color: #f9fafb; vertical-align: top;">${key}</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; word-break: break-word; max-width: 300px;">${displayValue}</td>
        </tr>
      `
    })
    .join("")

  // Format submission metadata
  const submissionDate = new Date(submission.createdAt).toLocaleString()
  const ipAddress = submission.ipAddress || "Unknown"
  const userAgent = submission.userAgent || "Unknown"
  const location = submission.geoLocation?.country
    ? `${submission.geoLocation.city || "Unknown"}, ${submission.geoLocation.country}`
    : "Unknown"

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FormCraft" <no-reply@formcraft.app>',
      to,
      subject: `🔔 New submission: ${formTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">New Form Submission</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${formTitle}</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Submission Details</h3>
              <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                ${submissionDataHtml}
              </table>
            </div>
            
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h4 style="margin: 0 0 12px 0; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Submission Info</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px;">
                <div><strong>Date:</strong> ${submissionDate}</div>
                <div><strong>IP Address:</strong> ${ipAddress}</div>
                <div><strong>Location:</strong> ${location}</div>
                <div style="grid-column: 1 / -1;"><strong>User Agent:</strong> ${userAgent}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${viewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                View All Submissions
              </a>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              This email was sent by FormCraft. You're receiving this because you enabled email notifications for this form.
            </p>
          </div>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error("Error sending submission notification:", error)
    return false
  }
}
