import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, ShieldCheck, EyeOff, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminCampaignListProps {
    campaigns: any[];
    loading: boolean;
}

const AdminCampaignList = ({ campaigns, loading }: AdminCampaignListProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-lg" />
                ))}
            </div>
        );
    }

    if (!campaigns || campaigns.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400">No campaigns found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[300px] font-medium text-slate-500">Campaign</TableHead>
                        <TableHead className="font-medium text-slate-500">Creator</TableHead>
                        <TableHead className="font-medium text-slate-500">Status</TableHead>
                        <TableHead className="font-medium text-slate-500">Goal / Pledged</TableHead>
                        <TableHead className="font-medium text-slate-500">Created</TableHead>
                        <TableHead className="text-right font-medium text-slate-500">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((c) => (
                        <TableRow key={c.campaign_id} className="group hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {c.image ? (
                                            <img src={c.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Megaphone className="text-slate-400" size={18} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 line-clamp-1">{c.title}</span>
                                        <span className="text-xs text-slate-400 font-mono lower">{c.campaign_id.substring(0, 10)}...</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-700">{c.creator_name || 'Anonymous'}</span>
                                    <span className="text-xs text-slate-400 font-mono truncate max-w-[120px]">{c.creator}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {c.active ? (
                                    <Badge className="bg-green-50 text-green-700 border-green-100 hover:bg-green-50">Live</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-400 border-slate-200">Paused</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">${Number(c.pledged).toLocaleString()}</span>
                                    <span className="text-xs text-slate-400">of ${Number(c.goal).toLocaleString()}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg">
                                        <ShieldCheck size={18} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 rounded-lg">
                                        <EyeOff size={18} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg">
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default AdminCampaignList;
