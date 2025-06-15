import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  FileCheck, 
  ChevronRight, 
  BarChart, 
  Mail, 
  CloudLightning, 
  Shield, 
  Zap, 
  Clock, 
  Check, 
  LayoutDashboard 
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { CircleUser, Moon, Sun } from 'lucide-react';
import { features } from '@/lib/constants';

const Landing: React.FC = () => {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

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
              
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <a href="#features" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Features
                </a>
                {/* <a href="#pricing" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Pricing
                </a> */}
                <a href="#testimonials" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Testimonials
                </a>
              </nav>
            </div>
        
            <div className="flex items-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                  Introducing FormCraft
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900 dark:text-white">Create beautiful forms</span>
                  <span className="block text-primary-600 dark:text-primary-400">in minutes, not hours</span>
                </span>
              </h1>
              
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Build custom forms with our intuitive drag-and-drop builder. Collect submissions, 
                analyze results, and grow your business with FormCraft's powerful form solution.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
                  <Button
                    size="lg"
                    onClick={() => setLocation('/auth/register')}
                    className="py-3 px-6"
                  >
                    Get Started Free
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setLocation('/pricing')}
                    className="py-3 px-6"
                  >
                    View Pricing
                  </Button> */}
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  No credit card required for free plan. Upgrade anytime.
                </p>
              </div>
            </div>
            
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full lg:max-w-md">
                <div className="rounded-2xl shadow-xl overflow-hidden bg-white">
                  <img
                    className="w-full"
                    src="/src/assets/form-builder-hero.svg"
                    alt="Form Builder Interface"
                  />
                  {/* Highlight dots */}
                  <div className="absolute top-1/4 right-0 w-20 h-20 bg-primary-400 rounded-full filter blur-3xl opacity-20"></div>
                  <div className="absolute bottom-1/3 left-0 w-20 h-20 bg-pink-400 rounded-full filter blur-3xl opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-800 py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h2 className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Features</h2>
      <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
        Everything you need to succeed
      </p>
      <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
        Powerful features to help you build forms, collect responses, and analyze data.
      </p>
    </div>

    <div className="mt-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="pt-6">
              <div className="h-full flex flex-col justify-between bg-white dark:bg-gray-900 rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div>
                    <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                      <Icon className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-5 text-base text-gray-500 dark:text-gray-400 min-h-[72px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</section>



      {/* Pricing Section */}
      <section id="pricing" className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Pricing</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Simple, transparent pricing
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
              Start for free, upgrade when you need more features.
            </p>
          </div> */}

          {/* Pricing landing Page */}
          {/* <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8"> */}
            {/* Free Plan */}
            {/* <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Free</h2>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Perfect for getting started and small projects.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹0</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                </p>
                <Button 
                  className="mt-8 w-full"
                  onClick={() => setLocation('/auth/register')}
                >
                  Sign up for free
                </Button>
              </div>
              <div className="pt-6 pb-8 px-6">
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
                </ul>
              </div>
            </div> */}

            {/* Premium Plan */}
            {/* <div className="border border-primary-500 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Premium</h2>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Everything you need for professional form management.</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹999</span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">/month</span>
                </p>
                <Button 
                  className="mt-8 w-full"
                  onClick={() => setLocation('/pricing')}
                >
                  Upgrade to Premium
                </Button>
              </div>
              <div className="pt-6 pb-8 px-6">
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
                  <li className="flex space-x-3">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Form expiration settings</span>
                  </li>
                </ul>
              </div>
            </div> */}
          {/* </div> */}
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="bg-white dark:bg-gray-900 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="col-span-6">
              <h2 className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Powerful Analytics</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                Gain insights from your form data
              </p>
              <p className="mt-5 text-lg text-gray-500 dark:text-gray-400">
                Track form submissions, analyze conversion rates, and understand user behavior with our 
                comprehensive analytics dashboard. Make data-driven decisions to improve your forms and grow your business.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Real-time dashboard</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      See form performance metrics as they happen with instant updates.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Detailed reports</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Export detailed reports to share with your team or clients.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">User behavior insights</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Understand how users interact with your forms to optimize conversion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-6 mt-12 lg:mt-0">
              <div className="relative mx-auto rounded-lg shadow-xl overflow-hidden">
                <img
                  className="w-full"
                  src="/src/assets/analytics-dashboard.svg"
                  alt="Analytics Dashboard"
                />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-400 rounded-full filter blur-3xl opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 dark:bg-gray-800 py-16 relative overflow-hidden">
        <div className="absolute top-0 w-full">
          <img src="/src/assets/wave-pattern.svg" alt="" className="w-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 dark:text-primary-400 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Trusted by creators worldwide
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-400">
              Don't just take our word for it — hear what our users have to say.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start">
                  <div className="inline-flex flex-shrink-0 border-2 border-primary-500 rounded-full">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/women/32.jpg" alt="Testimonial author" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Anisha Patel</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Manager</p>
                  </div>
                </div>
                <p className="mt-6 text-base text-gray-500 dark:text-gray-400">
                  "FormCraft has simplified our lead generation process. The analytics provide valuable insights that have helped us optimize our campaigns. Within 3 months, we saw a 40% increase in conversions!"
                </p>
                <div className="mt-6 flex">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start">
                  <div className="inline-flex flex-shrink-0 border-2 border-primary-500 rounded-full">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/men/45.jpg" alt="Testimonial author" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Carlos Diaz</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Freelance Developer</p>
                  </div>
                </div>
                <p className="mt-6 text-base text-gray-500 dark:text-gray-400">
                  "I've used many form builders, but FormCraft stands out with its intuitive UI and powerful features. My clients love the forms I create with it, and I can set up complex forms in half the time it used to take me."
                </p>
                <div className="mt-6 flex">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start">
                  <div className="inline-flex flex-shrink-0 border-2 border-primary-500 rounded-full">
                    <img className="h-12 w-12 rounded-full" src="https://randomuser.me/api/portraits/women/68.jpg" alt="Testimonial author" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Jamie Lewis</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</p>
                  </div>
                </div>
                <p className="mt-6 text-base text-gray-500 dark:text-gray-400">
                  "FormCraft has transformed how we collect customer feedback. Setting up forms is quick, and the analytics help us make data-driven decisions. It's been a game-changer for our customer service team."
                </p>
                <div className="mt-6 flex">
                  <div className="flex">
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} className={`h-5 w-5 ${i < 4 ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-primary-800">
  <div className="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
    <div>
      <h2 className="text-3xl font-extrabold tracking-tight dark:text-white text-black sm:text-4xl">
        <span className="block">Ready to get started?</span>
        <span className="block text-primary-200">Create your first form today.</span>
      </h2>
      <p className="mt-4 text-lg leading-6 dark:text-indigo-100 text-indigo-900">
        Start for free, no credit card required. Upgrade to premium when you need more power.
      </p>
    </div>
    <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
    <Button
  className="w-full sm:w-auto px-6 py-3 text-base font-semibold rounded-xl transition-all duration-200
             border bg-white text-primary-700 border-primary-500 shadow-md hover:bg-primary-50 hover:shadow-lg

             dark:bg-transparent dark:text-white dark:border-white/20 dark:hover:border-white/60 
             dark:hover:bg-white/10 dark:shadow-lg dark:hover:shadow-xl"
  onClick={() => setLocation('/auth/register')}
>
  Sign up free
</Button>



    </div>
  </div>
</section>



      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold">FormCraft</h2>
              <p className="mt-4 text-gray-400">
                Build beautiful forms in minutes, not hours. The ultimate form builder for professionals.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm text-center">
              &copy; {new Date().getFullYear()} FormCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
