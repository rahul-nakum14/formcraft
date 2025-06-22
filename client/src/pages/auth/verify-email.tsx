import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import AuthLayout from '@/components/layouts/AuthLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const VerifyEmail: React.FC = () => {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get token from URL
  const params = new URLSearchParams(location.split('?')[1]);
  const token = params.get('token');
  const email = params.get('email');
  
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);
  
  const verifyToken = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('POST', '/api/auth/verify', { token });
      
      setIsVerified(true);
      
      toast({
        title: 'Email verified',
        description: 'Your email has been successfully verified. You can now log in.',
      });
      
    } catch (error) {
      console.error('Verification error:', error);
      
      setError(error instanceof Error ? error.message : 'Invalid or expired verification token');
      
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Invalid or expired verification token',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Email Verification" 
      description={email ? `Verify your email: ${email}` : "Verify your email address"}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400 animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
          </div>
        ) : isVerified ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <Alert variant="success">
              <AlertTitle>Email Verified!</AlertTitle>
              <AlertDescription>
                Your email has been successfully verified. You can now log in to your account.
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => setLocation('/auth/login')}>
              Go to Login
            </Button>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <Alert variant="destructive">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              The verification link may have expired or is invalid.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLocation('/auth/login')}>
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>
                We've sent a verification link to your email address.
                Please check your inbox and click the link to verify your account.
              </AlertDescription>
            </Alert>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setLocation('/auth/login')}>
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
