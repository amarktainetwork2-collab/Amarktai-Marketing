import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Globe,
  Share2,
  BarChart3,
  Settings,
  Menu,
  X,
  Rocket,
  Bell,
  Clock,
  Sparkles,
  Zap,
  LogOut,
  User,
  Key,
  MessageSquare,
  ShieldCheck,
  Wrench,
  Users,
  FileText,
  UsersRound,
  ChevronDown,
  Building2,
  Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemoAuth } from '@/App';

// Check if we have a valid Clerk key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Web Apps', href: '/dashboard/webapps', icon: Globe },
  { name: 'Platforms', href: '/dashboard/platforms', icon: Share2 },
  { name: 'Content Studio', href: '/dashboard/content', icon: Sparkles },
  { name: 'Review & Optimize', href: '/dashboard/approval', icon: Zap, badge: 5 },
  { name: 'Smart Scheduler', href: '/dashboard/scheduler', icon: Clock },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Blog Generator', href: '/dashboard/blog', icon: FileText },
  { name: 'Communities', href: '/dashboard/groups', icon: UsersRound },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Key },
  { name: 'Engagement', href: '/dashboard/engagement', icon: MessageSquare },
  { name: 'Power Tools', href: '/dashboard/tools', icon: Wrench },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Admin', href: '/dashboard/admin', icon: ShieldCheck },
];

/** Workspace switcher — reads/writes to localStorage for demo; wired to API in production. */
function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('amarktai_workspaces') || '["Default Brand"]');
    } catch {
      return ['Default Brand'];
    }
  });
  const [active, setActive] = useState<string>(
    () => localStorage.getItem('amarktai_active_workspace') || 'Default Brand'
  );
  const [open, setOpen] = useState(false);

  const switchTo = (name: string) => {
    setActive(name);
    localStorage.setItem('amarktai_active_workspace', name);
    setOpen(false);
  };

  const addWorkspace = () => {
    const name = prompt('New workspace name:');
    if (name?.trim()) {
      const updated = [...workspaces, name.trim()];
      setWorkspaces(updated);
      localStorage.setItem('amarktai_workspaces', JSON.stringify(updated));
      switchTo(name.trim());
    }
    setOpen(false);
  };

  return (
    <div className="relative px-4 py-2 border-b">
      <button
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 py-1"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">{active}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 mx-2">
          {workspaces.map((ws) => (
            <button
              key={ws}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${ws === active ? 'text-violet-700 font-semibold' : 'text-gray-700'}`}
              onClick={() => switchTo(ws)}
            >
              {ws}
            </button>
          ))}
          <button
            className="w-full text-left px-3 py-2 text-sm text-violet-600 hover:bg-violet-50 flex items-center gap-2 border-t"
            onClick={addWorkspace}
          >
            <Plus className="w-4 h-4" /> Add Workspace
          </button>
        </div>
      )}
    </div>
  );
}

/** AI badge shown in the header — branded as "AI" in blue (#0000FF) per spec. */
function AIBadge() {
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border"
      style={{ color: '#0000FF', borderColor: '#0000FF', background: '#eff6ff' }}
    >
      <Sparkles className="w-3 h-3" style={{ color: '#0000FF' }} />
      AI Powered
    </span>
  );
}

function DemoUserProfile() {
  const { logout } = useDemoAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Demo User</p>
        <p className="text-xs text-gray-500">Pro Plan</p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ClerkUserProfile() {
  const { user } = useUser();

  return (
    <div className="flex items-center space-x-3">
      <UserButton afterSignOutUrl="/" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {user?.fullName || user?.primaryEmailAddress?.emailAddress}
        </p>
        <p className="text-xs text-gray-500">Pro Plan</p>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Amarktai
              </span>
            </Link>
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Multi-business Workspace Switcher */}
          <WorkspaceSwitcher />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center">
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-violet-600' : ''}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* AI branding footer */}
          <div className="px-4 py-2 border-t border-b text-center">
            <p className="text-xs font-semibold" style={{ color: '#0000FF' }}>
              AI — Amarktai Network © 2026
            </p>
          </div>

          {/* User Profile */}
          <div className="p-4">
            {isValidClerkKey ? <ClerkUserProfile /> : <DemoUserProfile />}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold">
                {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <AIBadge />
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
