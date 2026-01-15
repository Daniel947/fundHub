import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Coins, ShieldAlert, BarChart3, Search, Filter, Activity, Scale, History, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from 'axios';

// Admin page components
import AdminStats from '../components/admin/AdminStats';
import AdminCampaignList from '../components/admin/AdminCampaignList';
import TokenManager from '../components/admin/TokenManager';
import RiskMonitoring from '../components/admin/RiskMonitoring';
import DisputeCenter from '../components/admin/DisputeCenter';
import ContractOversight from '../components/admin/ContractOversight';
import AuditLogs from '../components/admin/AuditLogs';

const Admin = () => {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [stats, setStats] = useState<any>({
        pledged: [],
        counts: { totalCampaigns: 0, activeCampaigns: 0, totalBackers: 0 },
        campaigns: []
    });
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminRole, setAdminRole] = useState<'super' | 'moderator' | 'auditor'>('super');
    const [systemHealth, setSystemHealth] = useState<'normal' | 'alert' | 'critical'>('normal');
    const [fetchError, setFetchError] = useState<boolean>(false);

    useEffect(() => {
        // In a real app, we'd check against a list or a contract role.
        // For this demo, let's assume the current user is admin if they provide a specific header or matches a config.
        const checkAdminStatus = async () => {
            try {
                // Fetch independently so one failure doesn't break the whole dashboard
                const [statsRes, campaignsRes, logsRes] = await Promise.allSettled([
                    axios.get('http://localhost:3001/api/admin/stats', { headers: { 'x-admin-address': address } }),
                    axios.get('http://localhost:3001/api/admin/campaigns', { headers: { 'x-admin-address': address } }),
                    axios.get('http://localhost:3001/api/admin/audit-logs', { headers: { 'x-admin-address': address } })
                ]);

                if (statsRes.status === 'fulfilled') {
                    setStats(prev => ({ ...prev, ...statsRes.value.data }));
                    setIsAdmin(true);
                } else if (statsRes.reason?.response?.status === 403) {
                    setIsAdmin(false);
                    return;
                } else {
                    console.error("Stats fetch failed:", statsRes.reason);
                    setFetchError(true);
                }

                if (campaignsRes.status === 'fulfilled') {
                    setStats(prev => ({ ...prev, campaigns: campaignsRes.value.data }));
                    setIsAdmin(true);
                }

                if (logsRes.status === 'fulfilled') {
                    setAuditLogs(logsRes.value.data);
                }

            } catch (err: any) {
                console.error("Critical error checking admin status:", err);
                setFetchError(true);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected && address) {
            checkAdminStatus();
        } else if (!isConnected) {
            setLoading(false);
        }
    }, [address, isConnected]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isAdmin === false) {
        return <Navigate to="/" replace />;
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'tokens', label: 'Tokens', icon: Coins },
        { id: 'disputes', label: 'Disputes', icon: Scale },
        { id: 'security', label: 'Security', icon: ShieldAlert },
        { id: 'analytics', label: 'Global Analytics', icon: BarChart3 },
        { id: 'audit', label: 'System Audit', icon: History },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <ShieldAlert size={18} />
                        </div>
                        <span>Admin<span className="text-primary">Hub</span></span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-slate-900 rounded-2xl p-4 text-white">
                        <p className="text-xs text-slate-400 mb-1">Signed in as</p>
                        <p className="text-sm font-mono truncate">{address}</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <h1 className="text-2xl font-black capitalize tracking-tight text-slate-900">{activeTab}</h1>
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                            <div className={`w-2 h-2 rounded-full ${systemHealth === 'normal' ? 'bg-emerald-500 animate-pulse' :
                                systemHealth === 'alert' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                SYSTEM: {systemHealth}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                            {(['super', 'moderator', 'auditor'] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setAdminRole(role)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${adminRole === role ? 'bg-white shadow-sm text-primary' : 'text-slate-500'
                                        }`}
                                >
                                    {role.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                placeholder="Universal Search..."
                                className="pl-10 bg-slate-100 border-none focus-visible:ring-primary/20 rounded-xl h-10 text-sm"
                            />
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {activeTab === 'overview' && (
                        <>
                            <AdminStats stats={stats} loading={loading} error={fetchError} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="border-none shadow-sm bg-white">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Global Platform Health</CardTitle>
                                                <CardDescription>Live health metrics across all active nodes</CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 italic">
                                                <Zap size={14} />
                                                LIVE DATA: SYNCED
                                            </div>
                                        </CardHeader>
                                        <CardContent className="h-[400px]">
                                            <div className="h-full flex flex-col justify-center space-y-8">
                                                <div className="space-y-4 px-10">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Campaign Success Rate</span>
                                                        <span className="text-2xl font-black text-slate-900">
                                                            {stats?.counts ? Math.round((stats.counts.activeCampaigns / (stats.counts.totalCampaigns || 1)) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats?.counts ? (stats.counts.activeCampaigns / (stats.counts.totalCampaigns || 1)) * 100 : 0}%` }} />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8 px-10 border-t border-slate-50 pt-8">
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-400 font-bold uppercase">Escrow Utilization</p>
                                                        <p className="text-xl font-bold">Safe (98.2%)</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-slate-400 font-bold uppercase">Avg Transaction Peer</p>
                                                        <p className="text-xl font-bold">128.4ms</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                    <Card className="border-none shadow-sm bg-white">
                                        <CardHeader>
                                            <CardTitle>Network Distribution</CardTitle>
                                            <CardDescription>Funds by ecosystem</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {(() => {
                                                const totalRaised = stats?.pledged?.reduce((acc: number, curr: any) => acc + Number(curr.raised), 0) || 1;
                                                const sonicRaised = stats?.pledged?.filter((p: any) => p.network === 'sonic').reduce((acc: number, curr: any) => acc + Number(curr.raised), 0) || 0;
                                                const ethRaised = stats?.pledged?.filter((p: any) => p.network === 'ethereum').reduce((acc: number, curr: any) => acc + Number(curr.raised), 0) || 0;

                                                const sonicPerc = Math.round((sonicRaised / totalRaised) * 100);
                                                const ethPerc = 100 - sonicPerc;

                                                return (
                                                    <>
                                                        <div className="h-[200px] flex items-center justify-center">
                                                            <div className="relative w-40 h-40">
                                                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4" />
                                                                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="4" strokeDasharray={`${sonicPerc} 100`} />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                                    <span className="text-2xl font-black">{sonicPerc}%</span>
                                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Sonic</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-sm bg-primary" />
                                                                    <span className="text-slate-500 font-medium">Sonic Blaze</span>
                                                                </div>
                                                                <span className="font-black text-slate-900">{sonicPerc}%</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-sm bg-slate-200" />
                                                                    <span className="text-slate-500 font-medium">Ethereum Sepolia</span>
                                                                </div>
                                                                <span className="font-black text-slate-900">{ethPerc}%</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'campaigns' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Active Modern Moderation</h2>
                                    <p className="text-sm text-slate-500">Track and manage all campaigns across the ecosystem.</p>
                                </div>
                                <Button className="rounded-xl gap-2">
                                    <BarChart3 size={18} />
                                    Generate Report
                                </Button>
                            </div>
                            <AdminCampaignList campaigns={stats?.campaigns || []} loading={loading} />
                        </div>
                    )}

                    {activeTab === 'tokens' && <TokenManager />}

                    {activeTab === 'security' && (
                        <RiskMonitoring campaigns={stats?.campaigns || []} />
                    )}

                    {activeTab === 'analytics' && (
                        <ContractOversight />
                    )}

                    {activeTab === 'disputes' && <DisputeCenter />}
                    {activeTab === 'audit' && (
                        <AuditLogs logs={auditLogs} loading={loading} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
