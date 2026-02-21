import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    FileEdit,
    Settings,
    HelpCircle,
    Search,
    Bell,
    LayoutGrid,
    Menu,
    X,
    Workflow,
    LogOut,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mainNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-requests', label: 'My Requests', icon: FileText },
    { to: '/my-approvals', label: 'My Approvals', icon: CheckCircle2 },
    { to: '/requests', label: 'All Requests', icon: FileText },
    { to: '/drafts', label: 'Drafts', icon: FileEdit },
];

const accountNav = [
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/support', label: 'Support', icon: HelpCircle },
];

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, tenantSlug, logout } = useAuth();

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'U';

    const filteredNav = mainNav.filter(item => {
        if (item.label === 'My Approvals' && user?.role === 'member') {
            return false;
        }
        return true;
    });

    // Hide 'Approvals' as it's been replaced, but keeping it in App.jsx for backward compatibility if needed

    return (
        <div className="min-h-screen bg-bg flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-border flex flex-col transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
                        <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-navy tracking-tight">Workflow</span>
                    {/* Close button (mobile) */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto lg:hidden text-textmuted hover:text-textprimary cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Menu */}
                <nav className="flex-1 px-3 pt-6 space-y-1">
                    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-textmuted">
                        Main Menu
                    </p>
                    {filteredNav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-textsecondary hover:bg-bg hover:text-textprimary'
                                }`
                            }
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            {label}
                        </NavLink>
                    ))}

                    {/* Account Section */}
                    <p className="px-3 mt-8 mb-2 text-[10px] font-bold uppercase tracking-widest text-textmuted">
                        Account
                    </p>
                    {accountNav.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-textsecondary hover:bg-bg hover:text-textprimary'
                                }`
                            }
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info */}
                <div className="px-4 py-4 border-t border-border">
                    <p className="text-[10px] font-medium text-textmuted mb-1">Logged in as</p>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-textprimary leading-tight truncate">{user?.email || 'User'}</p>
                            <p className="text-[11px] text-textmuted leading-tight truncate">{tenantSlug || 'Tenant'}</p>
                        </div>
                        <button
                            onClick={logout}
                            title="Sign out"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-textmuted hover:text-danger transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-border px-4 lg:px-6 py-3 flex items-center gap-4">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-textprimary cursor-pointer"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <div className="flex-1 max-w-lg relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textmuted" />
                        <input
                            type="text"
                            placeholder="Search workflows or requests..."
                            className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-textprimary placeholder:text-textmuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg hover:bg-bg text-textsecondary transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-bg text-textsecondary transition-colors cursor-pointer">
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-sidebar text-white text-xs font-bold flex items-center justify-center ml-1 cursor-pointer">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
