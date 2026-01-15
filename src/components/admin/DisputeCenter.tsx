import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    Scale,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    ExternalLink
} from 'lucide-react';

const DisputeCenter = () => {
    const disputes = [
        {
            id: 'DISP-7721',
            campaign: 'Green Grid Solar',
            type: 'Milestone Conflict',
            requester: '0x33A1...B288',
            amount: '1.5 ETH',
            status: 'Under Review',
            timeLeft: '14h 22m',
            description: 'Backer claims milestone 2 goals (prototype delivery) were not met as described in the whitepaper.'
        },
        {
            id: 'DISP-7722',
            campaign: 'Sonic Speed Racing',
            type: 'Refund Request',
            requester: '0x99B2...C110',
            amount: '500 USDT',
            status: 'Awaiting Evidence',
            timeLeft: '42h 05m',
            description: 'Duplicate transaction claim due to network congestion during initial donation.'
        }
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dispute Resolution</h2>
                    <p className="text-slate-500">Impartial oversight for community conflicts and financial reconciliations.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl gap-2">
                        <Scale size={18} />
                        Dispute Guidelines
                    </Button>
                    <Button className="rounded-xl gap-2">
                        <CheckCircle2 size={18} />
                        Bulk Finalize
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {disputes.map((d) => (
                    <Card key={d.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className={`w-2 md:w-1 bg-indigo-500`} />
                            <div className="flex-1 p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{d.id}</span>
                                            <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100">
                                                {d.type}
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            {d.campaign}
                                            <ExternalLink size={14} className="text-slate-400" />
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">Escrow Value</p>
                                            <p className="font-bold text-slate-900">{d.amount}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">Resolution SLA</p>
                                            <div className="flex items-center gap-1.5 font-semibold text-amber-600">
                                                <Clock size={14} />
                                                {d.timeLeft}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                                    <p className="text-sm text-slate-600 leading-relaxed italic">{d.description}</p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">3 evidence files attached</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="rounded-lg text-slate-500">
                                            <FileText size={16} className="mr-2" />
                                            View Cases
                                        </Button>
                                        <Button variant="ghost" size="sm" className="rounded-lg text-slate-500">
                                            <MessageSquare size={16} className="mr-2" />
                                            Communicate
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-lg border-red-200 text-red-600 hover:bg-red-50">
                                            <XCircle size={16} className="mr-2" />
                                            Reject
                                        </Button>
                                        <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700 text-white">
                                            <CheckCircle2 size={16} className="mr-2" />
                                            Approve Refund
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default DisputeCenter;
