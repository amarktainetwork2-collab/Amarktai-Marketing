import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from '@/components/ui/sonner';
import { Suspense, lazy, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const LandingPage = lazy(() => import('@/app/page'));
const AboutPage = lazy(() => import('@/app/about/page'));
const PricingPage = lazy(() => import('@/app/pricing/page'));
const ContactPage = lazy(() => import('@/app/contact/page'));
const PrivacyPage = lazy(() => import('@/app/privacy/page'));
const TermsPage = lazy(() => import('@/app/terms/page'));
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
const FeaturesPage = lazy(() => import('@/app/features/page'));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#06070A' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2563FF' }} />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            isValidClerkKey ? (
              <ProtectedRoute><DashboardLayout /></ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  const content = (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <Toaster position="top-right" richColors theme="dark" />
    </BrowserRouter>
  );

  if (isValidClerkKey) {
    return (
      <ClerkProvider
        publishableKey={clerkPubKey}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            footerActionLink: 'text-blue-400 hover:text-blue-300',
            card: 'bg-[#0B0F14] border border-white/10',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-400',
            formFieldLabel: 'text-slate-300',
            formFieldInput: 'bg-[#111827] border-white/10 text-white',
            identityPreviewText: 'text-slate-300',
            dividerLine: 'bg-white/10',
            dividerText: 'text-slate-500',
            socialButtonsBlockButton: 'bg-[#111827] border-white/10 text-white hover:bg-[#1a2332]',
          },
          variables: {
            colorPrimary: '#2563FF',
            colorBackground: '#0B0F14',
            colorText: '#F8FAFC',
            colorTextSecondary: '#94A3B8',
            colorInputBackground: '#111827',
            colorInputText: '#F8FAFC',
            borderRadius: '0.75rem',
          },
        }}
      >
        {content}
      </ClerkProvider>
    );
  }

  return content;
}

export default App;
