import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { UserType } from '@/lib/types';

const Pricing: React.FC = () => {
  const [, setLocation] = useLocation();

  // Get current user to check subscription status
  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
  });

  const isLoggedIn = !!user;
  const isPremium = user?.planType === 'premium';

  // Handle subscribe button click
  const handleSubscribe = () => {
    if (!isLoggedIn) {
      setLocation('/auth/login');
    } else if (!isPremium) {
      setLocation('/subscribe');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">FormCraft</h1>
              </div>
            </div>
            
            <div className="flex items-center">
              {isLoggedIn ? (
                <Button 
                  onClick={() => setLocation('/dashboard')}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
                    onClick={() => setLocation('/auth/login')}
                  >
                    Log in
                  </Button>
                  <Button 
                    className="ml-4"
                    onClick={() => setLocation('/auth/register')}
                  >
                    Sign up free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Pricing</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Choose the perfect plan for your needs
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
              Simple, transparent pricing with no hidden fees.
            </p>
          </div>

          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
            {/* Free Plan */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 flex flex-col">
              <div className="p-6">
                <h2 className="text-2xl font-medium text-gray-900 dark:text-white">Free</h2>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Perfect for getting started and small projects.
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹0</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                </p>
                <div className="mt-8">
                  {!isLoggedIn ? (
                    <Button 
                      className="w-full"
                      onClick={() => setLocation('/auth/register')}
                    >
                      Sign up for free
                    </Button>
                  ) : user?.planType === 'free' ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => setLocation('/dashboard')}
                    >
                      Downgrade to Free
                    </Button>
                  )}
                </div>
              </div>
              <div className="pt-6 pb-8 px-6 flex-1">
                <h3 className="text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wide">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Up to 3 forms</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">100 form submissions</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Basic analytics</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Form expiration settings</span>
                  </li>
                  <li className="flex space-x-3">
                    <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email notifications</span>
                  </li>
                  <li className="flex space-x-3">
                    <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">CAPTCHA support</span>
                  </li>
                  <li className="flex space-x-3">
                    <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Custom success message</span>
                  </li>
                  <li className="flex space-x-3">
                    <X className="flex-shrink-0 h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Custom redirect URL</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="border border-primary-500 rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-gray-700 flex flex-col bg-white dark:bg-gray-800">
              <div className="relative">
                <div className="absolute top-0 inset-x-0 transform translate-y-px">
                  <div className="flex justify-center transform -translate-y-1/2">
                    <span className="inline-flex rounded-full bg-primary-600 px-4 py-1 text-sm font-semibold text-white">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-medium text-gray-900 dark:text-white">Premium</h2>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Everything you need for professional form management.
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹999</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                  </p>
                  <div className="mt-8">
                    {!isLoggedIn ? (
                      <Button 
                        className="w-full"
                        onClick={handleSubscribe}
                      >
                        Upgrade to Premium
                      </Button>
                    ) : user?.planType === 'premium' ? (
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={handleSubscribe}
                      >
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-6 pb-8 px-6 flex-1">
                <h3 className="text-xs font-medium text-gray-900 dark:text-white uppercase tracking-wide">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Unlimited forms</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Unlimited submissions</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Advanced analytics</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Form expiration settings</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Email notifications</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">CAPTCHA support</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Custom success message</span>
                  </li>
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Custom redirect URL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200 dark:divide-gray-700">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center sm:text-4xl">
              Frequently asked questions
            </h2>
            <dl className="mt-6 space-y-6 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="pt-6">
                <dt className="text-lg">
                  <span className="font-medium text-gray-900 dark:text-white">What happens if I exceed my form or submission limit?</span>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  For free plan users, you will be notified when you reach your limit and will need to upgrade to continue collecting submissions or creating new forms.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Can I export my form data?</span>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Yes, you can export your form submissions to CSV format with both free and premium plans.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg">
                  <span className="font-medium text-gray-900 dark:text-white">How does the form embedding work?</span>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  We provide an embed code (JavaScript snippet or iframe) that you can add to your website to display the form directly on your page.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Is there a discount for annual billing?</span>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Currently, we only offer monthly billing. We're working on annual plans with discounts for the future.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg">
                  <span className="font-medium text-gray-900 dark:text-white">Can I change plans later?</span>
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new features will be available immediately. When downgrading, the changes will take effect at the end of your billing cycle.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                About
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Blog
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Jobs
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Press
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Privacy
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Terms
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                Contact
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-500 dark:text-gray-400">
            &copy; 2023 FormCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
