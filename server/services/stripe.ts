import Stripe from "stripe";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-04-30.basil",
    })
  : null;

// Create or retrieve a customer
export const getOrCreateCustomer = async (email: string, name: string, customerId?: string) => {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  if (customerId) {
    return await stripe.customers.retrieve(customerId);
  }

  return await stripe.customers.create({
    email,
    name,
  });
};

// Create a subscription
export const createSubscription = async (customerId: string, priceId: string) => {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
};

// Cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return await stripe.subscriptions.cancel(subscriptionId);
};

// Create a checkout session
export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: { [key: string]: string }
) => {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

// Create a billing portal session
export const createBillingPortalSession = async (customerId: string, returnUrl: string) => {
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

export default stripe;
