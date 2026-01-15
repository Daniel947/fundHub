import React from 'react';
import {
    BarChart3,
    Briefcase,
    Layers,
    Users,
    Bell,
    LineChart,
    HelpCircle,
    LogOut,
    LayoutDashboard,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useNavigate, useLocation } from 'react-router-dom';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    active?: boolean;
    onClick?: (path: string) => void;
}

const NavItem = ({ icon: Icon, label, path, active, onClick }: NavItemProps) => (
    <button
        onClick={() => onClick?.(path)}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
            active
                ? "bg-white/60 shadow-sm text-fundhub-primary font-semibold backdrop-blur-md"
                : "text-gray-500 hover:bg-white/30 hover:text-fundhub-dark"
        )}
    >
        <Icon className={cn("w-5 h-5", active ? "text-fundhub-primary" : "text-gray-400")} />
        <span className="text-sm">{label}</span>
    </button>
);

const DashboardSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
            {/* Logo */}
            <div
                className="flex items-center gap-2 mb-10 px-2 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="w-10 h-10 bg-gradient-to-br from-fundhub-primary to-fundhub-secondary rounded-xl flex items-center justify-center shadow-lg shadow-fundhub-primary/20">
                    <span className="text-white font-black text-xl italic">F</span>
                </div>
                <span className="text-2xl font-black text-fundhub-dark tracking-tight">FundHub</span>
            </div>

            {/* Main Nav */}
            <nav className="flex-grow space-y-2">
                <NavItem icon={LayoutDashboard} label="Overview" path="/dashboard" active={isActive('/dashboard')} onClick={handleNavigate} />
                <NavItem icon={Briefcase} label="Campaigns" path="/dashboard/campaigns" active={isActive('/dashboard/campaigns')} onClick={handleNavigate} />
                <NavItem icon={Layers} label="Milestones" path="/milestones" active={isActive('/milestones')} onClick={handleNavigate} />
                <NavItem icon={Users} label="Community" path="/community" active={isActive('/community')} onClick={handleNavigate} />
                <NavItem icon={Bell} label="Updates" path="/updates" active={isActive('/updates')} onClick={handleNavigate} />
                <NavItem icon={LineChart} label="Analytics" path="/analytics" active={isActive('/analytics')} onClick={handleNavigate} />
            </nav>

            {/* Bottom Nav */}
            <div className="mt-auto pt-6 border-t border-white/20 space-y-2">
                <NavItem icon={Settings} label="Settings" path="/settings" active={isActive('/settings')} onClick={handleNavigate} />
                <NavItem icon={HelpCircle} label="Help & Support" path="/support" onClick={handleNavigate} />
                <NavItem icon={LogOut} label="Log Out" path="/" onClick={handleNavigate} />
            </div>
        </aside>
    );
};

export default DashboardSidebar;
