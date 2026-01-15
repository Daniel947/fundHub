import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldAlert,
    AlertTriangle,
    Zap,
    Eye,
    MoreVertical,
    TrendingUp,
    Fingerprint
} from 'lucide-react';

interface RiskMonitoringProps {
    campaigns: any[];
}

const RiskMonitoring = ({ campaigns }: RiskMonitoringProps) => {
    // Mock high-risk data based on existing campaigns
    const flagged = campaigns.slice(0, 3).map((c, i) => ({
        ...c,
        riskScore: [88, 72, 65][i] || 45,
        alerts: ['Suspicious funding pattern', 'Identity mismatch', 'High velocity withdrawals'][i % 3]
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Risk Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-500" />
                            CRITICAL ALERTS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-slate-400 mt-1">Requiring immediate response</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" />
                            AI PREDICTIONS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">4</div>
                        <p className="text-xs text-slate-400 mt-1">High-probability fraud vectors</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            <Fingerprint size={16} className="text-indigo-500" />
                            VERIFICATION LOAD
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">28</div>
                        <p className="text-xs text-slate-400 mt-1">Pending KYC/AML reviews</p>
                    </CardContent>
                </Card>
            </div>

            {/* Risk Alerts Table */}
            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Priority Oversight Queue</CardTitle>
                            <CardDescription>Campaigns flagged by the risk engine for manual review.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl">View All Alerts</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {flagged.map((c) => (
                            <div key={c.campaign_id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${c.riskScore > 80 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{c.title}</span>
                                            <Badge variant="outline" className={`${c.riskScore > 80 ? 'text-red-600 border-red-200' : 'text-amber-600 border-amber-200'}`}>
                                                Risk: {c.riskScore}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-0.5">{c.alerts}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="ghost" className="rounded-lg h-9">
                                        <Eye size={16} className="mr-2" />
                                        Examine
                                    </Button>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9">
                                        Pause
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Score Distribution Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-base">Trust Network Graph</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-t border-slate-50 text-slate-400 text-xs italic">
                        Visualization of connections between creators and known high-risk addresses...
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-base">Identity Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center border-t border-slate-50 text-slate-400 text-xs italic">
                        Real-time Sumsub/KYC verification success rates and dropout points...
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RiskMonitoring;
