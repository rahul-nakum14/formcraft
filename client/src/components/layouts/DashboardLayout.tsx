import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  Plus,
  CreditCard,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserType } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
  });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.invalidateQueries();
      setLocation('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLocation('/auth/login');
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location === '/dashboard') {
      return true;
    }
    return location.startsWith(path) && path !== '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <a className="text-2xl font-bold text-primary-600 dark:text-primary-400">FormCraft</a>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden sm:flex sm:space-x-8 ml-8">
              <Link href="/dashboard">
                <a
                  className={`${
                    isActive('/dashboard')
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/dashboard/forms">
                <a
                  className={`${
                    isActive('/dashboard/forms')
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Forms
                </a>
              </Link>
              <Link href="/dashboard/analytics">
                <a
                  className={`${
                    isActive('/dashboard/analytics')
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Analytics
                </a>
              </Link>
              <Link href="/dashboard/settings">
                <a
                  className={`${
                    isActive('/dashboard/settings')
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Settings
                </a>
              </Link>
            </nav>

            {/* Theme & Profile */}
            <div className="flex items-center ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full">
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      {user?.username?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <Separator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <a className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings/subscription">
                      <a className="flex items-center cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscriptidddon</span>
                      </a>
                    </Link>
                  </DropdownMenuItem> */}
                  <Separator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="ml-3 sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1">
              <Link href="/dashboard">
                <a
                  className={`${
                    isActive('/dashboard')
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/dashboard/forms">
                <a
                  className={`${
                    isActive('/dashboard/forms')
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                >
                  Forms
                </a>
              </Link>
              <Link href="/dashboard/analytics">
                <a
                  className={`${
                    isActive('/dashboard/analytics')
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                >
                  Analytics
                </a>
              </Link>
              <Link href="/dashboard/settings">
                <a
                  className={`${
                    isActive('/dashboard/settings')
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-l-4 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                >
                  Settings
                </a>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Free Plan Banner */}
      {/* {user?.planType === 'free' && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-medium">Free Plan:</span> Upgrade to Premium for unlimited forms and features
              </p>
              <Link href="/pricing">
                <a className="text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 px-2 py-1 rounded">
                  Upgrade
                </a>
              </Link>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} FormCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
