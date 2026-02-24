import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Toaster } from '@/components/ui/sonner';
import { Suspense, lazy, createContext, useContext, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('@/app/page'));
const LoginPage = lazy(() => import('@/app/login/page'));
const RegisterPage = lazy(() => import('@/app/register/page'));
const DashboardLayout = lazy(() => import('@/components/layout/DashboardLayout'));
const DashboardPage = lazy(() => import('@/app/dashboard/page'));
const WebAppsPage = lazy(() => import('@/app/webapps/page'));
const NewWebAppPage = lazy(() => import('@/app/webapps/new/page'));
const EditWebAppPage = lazy(() => import('@/app/webapps/edit/page'));
const PlatformsPage = lazy(() => import('@/app/platforms/page'));
const ContentPage = lazy(() => import('@/app/content/page'));
const ApprovalPage = lazy(() => import('@/app/approval/page'));
const SchedulerPage = lazy(() => import('@/app/scheduler/page'));
const AnalyticsPage = lazy(() => import('@/app/analytics/page'));
const SettingsPage = lazy(() => import('@/app/settings/page'));
const IntegrationsPage = lazy(() => import('@/app/integrations/page'));
const EngagementPage = lazy(() => import('@/app/engagement/page'));
const AdminPage = lazy(() => import('@/app/admin/page'));
const ToolsPage = lazy(() => import('@/app/tools/page'));
const LeadsPage = lazy(() => import('@/app/leads/page'));
const BlogPage = lazy(() => import('@/app/blog/page'));
const GroupsPage = lazy(() => import('@/app/groups/page'));

// Demo auth context
interface DemoAuthContextType {
  isDemoMode: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  isDemoMode: false,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useDemoAuth = () => useContext(DemoAuthContext);

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// Check if we have a valid Clerk key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

// Demo Auth Provider
function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <DemoAuthContext.Provider value={{
      isDemoMode: true,
      isAuthenticated,
      login: () => setIsAuthenticated(true),
      logout: () => setIsAuthenticated(false),
    }}>
      {children}
    </DemoAuthContext.Provider>
  );
}

// Demo route wrapper
function DemoRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useDemoAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const location = useLocation();
  
  if (isValidClerkKey) {
    // Use Clerk authentication
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <DashboardLayout />
              </SignedIn>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="webapps" element={<WebAppsPage />} />
            <Route path="webapps/new" element={<NewWebAppPage />} />
            <Route path="webapps/edit/:id" element={<EditWebAppPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="approval" element={<ApprovalPage />} />
            <Route path="scheduler" element={<SchedulerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="engagement" element={<EngagementPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route
            path="*"
            element={
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            }
          />
        </Routes>
      </Suspense>
    );
  }
  
  // Use demo authentication
  return (
    <DemoAuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <DemoRoute>
                <DashboardLayout />
              </DemoRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="webapps" element={<WebAppsPage />} />
            <Route path="webapps/new" element={<NewWebAppPage />} />
            <Route path="webapps/edit/:id" element={<EditWebAppPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="approval" element={<ApprovalPage />} />
            <Route path="scheduler" element={<SchedulerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="engagement" element={<EngagementPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </DemoAuthProvider>
  );
}

function App() {
  if (isValidClerkKey) {
    return (
      <ClerkProvider 
        publishableKey={clerkPubKey}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700',
            footerActionLink: 'text-violet-600 hover:text-violet-700',
          }
        }}
      >
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </ClerkProvider>
    );
  }
  
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
