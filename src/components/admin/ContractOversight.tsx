import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Link,
    Database,
    ArrowRightLeft,
    Lock,
    Unlock,
    AlertCircle,
    Server
} from 'lucide-react';

const ContractOversight = () => {
    const contracts = [
        { name: 'CampaignManager (Sonic)', address: '0x992B...F122', status: 'Healthy', events: 1422 },
        { name: 'FundEscrow (Sonic)', address: '0x88A1...E990', status: 'Healthy', events: 852 },
        { name: 'CampaignManager (Sepolia)', address: '0x33B2...C110', status: 'Maintenance', events: 128 },
        { name: 'FundEscrow (Sepolia)', address: '0x11D9...A445', status: 'Healthy', events: 54 }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total TVL', value: '$842,000', icon: Lock, color: 'text-indigo-600' },
                    { label: 'Released (24h)', value: '$12,400', icon: Unlock, color: 'text-green-600' },
                    { label: 'Oracle Synced', value: '100%', icon: Database, color: 'text-blue-600' },
                    { label: 'Indexer Latency', value: '12ms', icon: Server, color: 'text-purple-600' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</CardTitle>
                            <stat.icon size={16} className={stat.color} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle>On-Chain Registry</CardTitle>
                            <CardDescription>Direct monitoring of core protocol deployments.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-y border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contract</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Address</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Load</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {contracts.map((c, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-900">{c.name}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-400">{c.address}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={c.status === 'Healthy' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}>
                                                        {c.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (c.events / 1500) * 100)}%` }} />
                                                        </div>
                                                        <span className="text-xs text-slate-500">{c.events} tx</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="border-none shadow-sm bg-white h-full">
                        <CardHeader>
                            <CardTitle>Financial Integrity</CardTitle>
                            <CardDescription>Real-time reconciliation alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <Activity className="text-green-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Normal Operations</p>
                                        <p className="text-xs text-slate-500 mt-1">Escrow balances match off-chain indexer records. Drift: 0.00%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 font-mono">WARNING: RPC LAG</p>
                                        <p className="text-xs text-slate-500 mt-1 italic">Sonic Blaze node sync delayed by 4 blocks. Indexer catching up...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">Gas Utilization (Avg)</span>
                                    <span className="font-bold">42 Gwei</span>
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: '65%' }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContractOversight;
