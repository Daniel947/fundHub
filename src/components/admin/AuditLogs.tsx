import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    History,
    User,
    Shield,
    ExternalLink,
    Clock,
    ArrowRight,
    Terminal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogsProps {
    logs: any[];
    loading: boolean;
}

const AuditLogs = ({ logs, loading }: AuditLogsProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-20 w-full bg-slate-100 animate-pulse rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Audit logs</h2>
                    <p className="text-slate-500">Immutable record of every administrative action performed on the platform.</p>
                </div>
                <div className="bg-slate-900 rounded-xl px-4 py-2 flex items-center gap-2 text-white border border-slate-800 shadow-xl">
                    <Terminal size={14} className="text-emerald-400" />
                    <span className="text-xs font-mono font-bold">SECURE LOGGING ACTIVE</span>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {logs.length === 0 ? (
                            <div className="p-20 text-center text-slate-400">
                                <History size={48} className="mx-auto mb-4 opacity-10" />
                                <p>No administrative activity recorded yet.</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg h-fit group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                <Shield size={18} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">Admin Action: {log.action.toUpperCase()}</span>
                                                    <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                        {log.target_type}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <User size={14} />
                                                    <span className="font-mono text-xs">{log.admin_address.substring(0, 10)}...</span>
                                                    <ArrowRight size={14} className="opacity-20" />
                                                    <span className="text-slate-400 font-mono text-xs">Target: {log.target_id.substring(0, 10)}...</span>
                                                </div>
                                                {log.details?.reason && (
                                                    <p className="text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg mt-2 inline-block">
                                                        "{log.details.reason}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink size={14} className="text-slate-400" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900">
                    Load Archive logs
                </Button>
            </div>
        </div>
    );
};

export default AuditLogs;
