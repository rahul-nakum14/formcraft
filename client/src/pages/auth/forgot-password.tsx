import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true);
      
      await apiRequest('POST', '/api/auth/forgot-password', {
        email: data.email,
      });
      
      setIsSubmitted(true);
      
      toast({
        title: 'Reset link sent',
        description: 'If your email is registered, you will receive a password reset link.',
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Show a success message even on error for security reasons
      // This way attackers can't determine if an email exists in the system
      setIsSubmitted(true);
      
      toast({
        title: 'Reset link sent',
        description: 'If your email is registered, you will receive a password reset link.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Reset your password" 
      description="Enter your email address and we'll send you a password reset link"
    >
      {isSubmitted ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <Mail className="h-16 w-16 text-primary-600 dark:text-primary-400" />
          </div>
          <Alert>
            <AlertTitle>Check your email</AlertTitle>
            <AlertDescription>
              We've sent a password reset link to your email address.
              Please check your inbox and follow the instructions to reset your password.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button variant="outline" onClick={() => setLocation('/auth/login')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        type="email" 
                        {...field} 
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <Link href="/auth/login">
              <a className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </a>
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
