import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useStripe as useStripeContext, Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { UserType } from '@/lib/types';

// Initialize Stripe
// if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
//   throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
// }
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// CheckoutForm component
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
      });

      if (error) {
        setMessage(error.message ?? 'An unexpected error occurred.');
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('An unexpected error occurred.');
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {message && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm">
          {message}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/pricing')}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe Now'
          )}
        </Button>
      </div>
    </form>
  );
};

// Main Subscribe page component
const Subscribe = () => {
  const stripeContext = useStripeContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Get current user
  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
  });
  
  // Get premium plan details
  const premiumPlan = PLANS.find(plan => plan.id === 'premium');

  // Create or retrieve subscription on component mount
  useEffect(() => {
    const getSubscription = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already premium
        if (user?.planType === 'premium') {
          setLocation('/dashboard');
          return;
        }
        
        // Use the new endpoint for creating/retrieving subscriptions
        const response = await apiRequest('POST', '/api/get-or-create-subscription');
        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else if (data.url) {
          // If we got a direct URL to Stripe Checkout, redirect to it
          window.location.href = data.url;
        } else {
          setError('Failed to initialize payment.');
        }
      } catch (err) {
        console.error('Error creating subscription:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    
    getSubscription();
  }, [user, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Initializing payment...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Payment Error
            </CardTitle>
            <CardDescription>
              We encountered an issue while setting up your payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation('/pricing')}
            >
              Back to Pricing
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render payment form if we have the client secret
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Upgrade to Premium
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Unlock all features and enjoy unlimited form submissions
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="bg-white dark:bg-gray-800 py-4 px-6 border border-primary-100 dark:border-primary-900 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-medium">Premium Plan</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly subscription</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">₹{premiumPlan?.price || 999}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">per month</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {premiumPlan?.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
