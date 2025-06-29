import { Switch, Route } from "wouter";
import AuthGuard from "@/components/AuthGuard";
import NotFound from "@/pages/not-found";

// Auth Pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import VerifyEmail from "@/pages/auth/verify-email";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";

// Main Pages
import Landing from "@/pages/landing";
import Pricing from "@/pages/pricing";
import Subscribe from "@/pages/subscribe";
import PublicForm from "@/pages/form/[id]";

// Dashboard Pages
import Dashboard from "@/pages/dashboard";
import Forms from "@/pages/dashboard/forms";
import FormBuilder from "@/pages/dashboard/form-builder";
import FormSubmissions from "@/pages/dashboard/form-submissions";
import Analytics from "@/pages/dashboard/analytics";
import Settings from "@/pages/dashboard/settings";

function App() {
  return (
    <Switch>
      {/* Public routes - not requiring authentication */}
      <Route path="/" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      <Route path="/form/:id" component={PublicForm} />
      
      {/* Protected routes - requiring authentication */}
      <Route path="/subscribe">
        <AuthGuard>
          <Subscribe />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard/forms">
        <AuthGuard>
          <Forms />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard/forms/new">
        <AuthGuard>
          <FormBuilder />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard/forms/:id/edit">
        <AuthGuard>
          <FormBuilder />
        </AuthGuard>
      </Route>
      
      <Route path="/dashboard/forms/:id/submissions">
        <AuthGuard>
          <FormSubmissions />
        </AuthGuard>
      </Route>
      
      {/* <Route path="/dashboard/analytics">
        <AuthGuard>
          <Analytics />
        </AuthGuard>
      </Route> */}
      
      <Route path="/dashboard/settings">
        <AuthGuard>
          <Settings />
        </AuthGuard>
      </Route>
      
      {/* Fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
