import { PlanType } from "@/lib/types";
import { BarChart, CloudLightning, FileCheck, LayoutDashboard, Mail, Shield } from "lucide-react";

// Plan types and features
export const PLANS: PlanType[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "Up to 3 forms",
      "100 submissions per month",
      "Basic analytics",
      "Form expiration settings",
    ],
    limits: {
      forms: 3,
      submissions: 100,
      isPremium: false,
    },
  },
  {
    id: "premium",
    name: "Premium",
    price: 999, // ₹999 per month
    features: [
      "Unlimited forms",
      "Unlimited submissions",
      "Advanced analytics",
      "Email notifications",
      "CAPTCHA support",
      "Custom success message",
      "Custom redirect URL",
      "Form expiration settings",
    ],
    limits: {
      forms: Infinity,
      submissions: Infinity,
      isPremium: true,
    },
  },
];

// Form element types
export const ELEMENT_TYPES = [
  {
    type: "text",
    label: "Text Input",
    icon: "font",
    category: "basic",
  },
  {
    type: "email",
    label: "Email",
    icon: "envelope",
    category: "basic",
  },
  {
    type: "phone",
    label: "Phone",
    icon: "phone",
    category: "basic",
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: "paragraph",
    category: "basic",
  },
  {
    type: "dropdown",
    label: "Dropdown",
    icon: "caretDown",
    category: "selection",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: "checkSquare",
    category: "selection",
  },
  {
    type: "radio",
    label: "Radio",
    icon: "dotCircle",
    category: "selection",
  },
  {
    type: "file",
    label: "File Upload",
    icon: "fileUpload",
    category: "advanced",
  },
];

// Form templates
export const FORM_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Form",
    description: "Start from scratch",
    elements: [],
  },
  {
    id: "contact",
    name: "Contact Form",
    description: "Basic contact information",
    elements: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "John Doe",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "john@example.com",
        required: true,
      },
      {
        id: "message",
        type: "textarea",
        label: "Message",
        placeholder: "Your message here...",
        required: true,
      },
    ],
  },
  {
    id: "feedback",
    name: "Feedback Form",
    description: "Customer feedback",
    elements: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "John Doe",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "john@example.com",
        required: true,
      },
      {
        id: "rating",
        type: "radio",
        label: "How would you rate your experience?",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor", "Very Poor"],
      },
      {
        id: "feedback",
        type: "textarea",
        label: "Additional Comments",
        placeholder: "Please share any additional feedback here...",
        required: false,
      },
    ],
  },
  {
    id: "registration",
    name: "Event Registration",
    description: "Event signup form",
    elements: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "John Doe",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "john@example.com",
        required: true,
      },
      {
        id: "phone",
        type: "phone",
        label: "Phone Number",
        placeholder: "+1 (555) 000-0000",
        required: false,
      },
      {
        id: "ticketType",
        type: "dropdown",
        label: "Ticket Type",
        placeholder: "Select ticket type",
        required: true,
        options: ["General Admission", "VIP", "Early Bird", "Student"],
      },
      {
        id: "dietaryRestrictions",
        type: "checkbox",
        label: "Do you have any dietary restrictions?",
        required: false,
      },
    ],
  },
];

// Default form theme
export const DEFAULT_FORM_THEME = {
  primaryColor: "#6366f1",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  pageBackgroundColor: "#f8fafc", // Add default page background color

};

// Default form settings
export const DEFAULT_FORM_SETTINGS = {
  successMessage: "Thank you for your submission!",
  redirectUrl: "",
  captchaEnabled: false,
  emailNotifications: false,
  notificationEmails: [],
};


export const features = [
  {
    icon: LayoutDashboard,
    title: 'Drag & Drop Builder',
    description: 'Build forms visually with our intuitive drag-and-drop interface. No coding required.',
  },
  {
    icon: FileCheck,
    title: 'Smart Forms',
    description: 'Create forms with text fields, dropdowns, file uploads, and more. Validate inputs automatically.',
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Track form performance with real-time analytics. Monitor views, submissions, and conversion rates.',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    description: 'Get notified instantly when someone submits your form. Send confirmation emails to respondents.',
  },
  {
    icon: CloudLightning,
    title: 'Easy Integration',
    description: 'Embed forms on your website with a simple code snippet or share via direct link.',
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Data encryption, and GDPR-compliant form collection.',
  },
];
