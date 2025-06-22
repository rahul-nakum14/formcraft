import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const { toast } = useToast();
  
  // Get token from URL
  const params = new URLSearchParams(location.split('?')[1]);
  const token = params.get('token');
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        title: 'Invalid request',
        description: 'Reset token is missing. Please request a new password reset link.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await apiRequest('POST', '/api/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      
      setIsReset(true);
      
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      toast({
        title: 'Password reset failed',
        description: error instanceof Error ? error.message : 'Invalid or expired reset token',
        variant: 'destructive',
      });
      
      // Redirect to forgot password page after a delay
      setTimeout(() => {
        setLocation('/auth/forgot-password');
      }, 3000);
      
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!token) {
    return (
      <AuthLayout title="Invalid Reset Link">
        <Alert variant="destructive">
          <AlertTitle>Invalid Reset Link</AlertTitle>
          <AlertDescription>
            The password reset link is invalid or has expired. Please request a new password reset link.
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={() => setLocation('/auth/forgot-password')}>
            Request New Link
          </Button>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout 
      title="Reset your password" 
      description="Create a new password for your account"
    >
      {isReset ? (
        <div className="space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <Alert>
            <AlertTitle>Password Reset Successful</AlertTitle>
            <AlertDescription>
              Your password has been successfully reset. You can now log in with your new password.
            </AlertDescription>
          </Alert>
          <Button className="w-full" onClick={() => setLocation('/auth/login')}>
            Go to Login
          </Button>
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        {...field}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
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

export default ResetPassword;
