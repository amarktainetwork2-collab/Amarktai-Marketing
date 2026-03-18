import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Globe,
  Share2,
  BarChart3,
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Wrench,
  Users,
  FileText,
  UsersRound,
  ChevronDown,
  Building2,
  Plus,
  Key,
  CheckSquare,
} from 'lucide-react';
import { useState } from 'react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkPubKey && clerkPubKey.startsWith('pk_');

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  group: string;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, group: 'main' },
  { name: 'Web Apps', href: '/dashboard/webapps', icon: Globe, group: 'main' },
  { name: 'Platforms', href: '/dashboard/platforms', icon: Share2, group: 'main' },
  { name: 'Content Studio', href: '/dashboard/content', icon: Sparkles, group: 'create' },
  { name: 'Review & Approve', href: '/dashboard/approval', icon: CheckSquare, badge: 5, group: 'create' },
  { name: 'Scheduler', href: '/dashboard/scheduler', icon: Clock, group: 'create' },
  { name: 'Blog Generator', href: '/dashboard/blog', icon: FileText, group: 'create' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, group: 'insights' },
  { name: 'Leads', href: '/dashboard/leads', icon: Users, group: 'insights' },
  { name: 'Engagement', href: '/dashboard/engagement', icon: MessageSquare, group: 'insights' },
  { name: 'Communities', href: '/dashboard/groups', icon: UsersRound, group: 'insights' },
  { name: 'Power Tools', href: '/dashboard/tools', icon: Wrench, group: 'system' },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Key, group: 'system' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, group: 'system' },
  { name: 'Admin', href: '/dashboard/admin', icon: ShieldCheck, group: 'system' },
];

const navGroups = [
  { key: 'main', label: 'Platform' },
  { key: 'create', label: 'Create' },
  { key: 'insights', label: 'Insights' },
  { key: 'system', label: 'System' },
];

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
    <div className="relative px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button
        className="w-full flex items-center justify-between text-sm font-medium py-1.5 px-2 rounded-lg transition-colors hover:bg-white/5 text-slate-300"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="truncate">{active}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-2 right-2 mt-1 rounded-xl z-50 overflow-hidden"
          style={{
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
          }}
        >
          {workspaces.map((ws) => (
            <button
              key={ws}
              className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: ws === active ? '#2563FF' : '#CBD5E1' }}
              onClick={() => switchTo(ws)}
            >
              {ws}
            </button>
          ))}
          <button
            className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/5"
            style={{ color: '#22D3EE', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            onClick={addWorkspace}
          >
            <Plus className="w-3.5 h-3.5" /> Add Workspace
          </button>
        </div>
      )}
    </div>
  );
}

function UserArea() {
  const { user } = useUser();
  if (!isValidClerkKey) return null;
  return (
    <div
      className="flex items-center gap-3 p-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <UserButton afterSignOutUrl="/" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Account'}
        </p>
        <p className="text-xs text-slate-500">Amarktai Pro</p>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navigation.find((n) => n.href === location.pathname)?.name || 'Overview';

  return (
    <div className="min-h-screen" style={{ background: '#06070A' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#0B0F14',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563FF 0%, #22D3EE 100%)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">Amarktai</span>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => {
            const items = navigation.filter((n) => n.group === group.key);
            return (
              <div key={group.key} className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-1.5" style={{ color: '#475569' }}>
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className="flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm"
                          style={{
                            background: isActive ? 'rgba(37,99,255,0.15)' : 'transparent',
                            color: isActive ? '#4F7DFF' : '#94A3B8',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                              (e.currentTarget as HTMLAnchorElement).style.color = '#CBD5E1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                              (e.currentTarget as HTMLAnchorElement).style.color = '#94A3B8';
                            }
                          }}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon
                              className="w-4 h-4 shrink-0"
                              style={{ color: isActive ? '#2563FF' : 'inherit' }}
                            />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(37,99,255,0.2)', color: '#4F7DFF' }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User area */}
        <UserArea />
      </aside>

      {/* Main content */}
      <div className="lg:ml-60">
        {/* Header */}
        <header
          className="sticky top-0 z-30 px-4 sm:px-6"
          style={{
            background: 'rgba(6,7,10,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base font-semibold text-slate-100">{currentPage}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#EF4444' }}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
