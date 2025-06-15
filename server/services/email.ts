import nodemailer from "nodemailer";
import { FormSubmission } from "@shared/schema";

// Configure email transporter
const setupTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "hanonymous371@gmail.com";
  const pass = process.env.SMTP_PASS || "dqhp wtwk flae shmv";

  if (!user || !pass) {
    console.warn("Email credentials not configured. Email sending will not work.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (
  to: string,
  token: string
): Promise<boolean> => {
  const transporter = setupTransporter();
  if (!transporter) return false;

  const appUrl = process.env.APP_URL || "http://localhost:5000";
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;

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
    });
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<boolean> => {
  const transporter = setupTransporter();
  if (!transporter) return false;

  const appUrl = process.env.APP_URL || "http://localhost:5000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

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
    });
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// Send form submission notification
export const sendFormSubmissionNotification = async (
  to: string,
  formTitle: string,
  submission: FormSubmission
): Promise<boolean> => {
  const transporter = setupTransporter();
  if (!transporter) return false;

  const appUrl = process.env.APP_URL || "http://localhost:5000";
  const viewUrl = `${appUrl}/dashboard/forms/${submission.formId}/submissions/${submission.id}`;

  // Generate HTML for submission data
  const submissionDataHtml = Object.entries(submission.data)
    .map(([key, value]) => {
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
        </tr>
      `;
    })
    .join("");

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"FormCraft" <no-reply@formcraft.app>',
      to,
      subject: `New submission: ${formTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New form submission received</h2>
          <p>You have received a new submission for your form: <strong>${formTitle}</strong></p>
          
          <h3>Submission Details:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd; background-color: #f2f2f2;">Field</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd; background-color: #f2f2f2;">Value</th>
            </tr>
            ${submissionDataHtml}
          </table>
          
          <p>
            <a href="${viewUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 4px;">
              View Submission
            </a>
          </p>
          
          <p style="font-size: 12px; color: #666;">
            Received on ${new Date(submission.createdAt).toLocaleString()}
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending submission notification:", error);
    return false;
  }
};
