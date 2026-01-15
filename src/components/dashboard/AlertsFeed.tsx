import React from 'react';
import { ArrowUpRight, MessageSquare, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CreatorActivity } from '@/hooks/useCreatorDashboard';
import { cn } from '@/lib/utils';

interface AlertsFeedProps {
    activities: CreatorActivity[];
}

const AlertItem = ({
    icon: Icon,
    colorClass,
    bgClass,
    title,
    time,
    isLast
}: {
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    title: string;
    time: string;
    isLast?: boolean;
}) => (
    <div className={cn(
        "flex gap-4 p-4 transition-all duration-300 hover:bg-white/40",
        !isLast && "border-b border-white/20"
    )}>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", bgClass)}>
            <Icon className={cn("w-5 h-5", colorClass)} />
        </div>
        <div className="flex-grow space-y-1">
            <p className="text-xs font-bold text-fundhub-dark leading-snug line-clamp-2">
                {title}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">{time}</p>
        </div>
    </div>
);

const AlertsFeed = ({ activities }: AlertsFeedProps) => {
    // Map activities to the visual style
    const alerts = activities.slice(0, 8).map((activity, index) => {
        let icon = Info;
        let colorClass = 'text-blue-500';
        let bgClass = 'bg-blue-50';
        let title = '';

        const args = activity.args || {};

        if (activity.eventName === 'FundsLocked') {
            icon = ArrowUpRight;
            colorClass = 'text-green-500';
            bgClass = 'bg-green-50';
            title = `New contribution of ${args.amount ? 'funds' : ''} received for your campaign.`;
        } else if (activity.eventName === 'CampaignCreated') {
            icon = Info;
            colorClass = 'text-blue-500';
            bgClass = 'bg-blue-50';
            title = `Project "${args.title || 'Unknown'}" successfully launched on ${activity.network.toUpperCase()}.`;
        } else if (activity.eventName === 'MilestoneReleased') {
            icon = CheckCircle2;
            colorClass = 'text-fundhub-primary';
            bgClass = 'bg-fundhub-primary/10';
            const mIndex = parseInt(args.milestoneIndex) + 1;
            title = `Milestone #${mIndex} funds have been released to your wallet. 🚀`;
        } else if (activity.eventName === 'WithdrawSurplus') {
            icon = ArrowUpRight;
            colorClass = 'text-indigo-500';
            bgClass = 'bg-indigo-50';
            title = `Surplus funds successfully withdrawn from your completed campaign. 💰`;
        } else {
            icon = Info;
            colorClass = 'text-gray-500';
            bgClass = 'bg-gray-50';
            title = `Action recorded on ${activity.network.toUpperCase()}: ${activity.eventName}`;
        }

        return {
            icon,
            colorClass,
            bgClass,
            title,
            time: formatDistanceToNow(new Date(activity.time), { addSuffix: true }),
        };
    });

    const displayAlerts = alerts;

    return (
        <section className="bg-white/40 backdrop-blur-md rounded-[2rem] flex flex-col h-full overflow-hidden border-2 border-gray-200/80">
            <div className="p-6 border-b border-white/20">
                <h3 className="text-lg font-black text-fundhub-dark">Alerts</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recent Alerts</p>
            </div>

            <div className="flex-grow overflow-y-auto">
                {displayAlerts.map((alert, i) => (
                    <AlertItem
                        key={i}
                        {...alert}
                        isLast={i === displayAlerts.length - 1}
                    />
                ))}
            </div>

            <button className="p-4 text-xs font-black text-gray-400 hover:text-fundhub-primary transition-colors flex items-center justify-center gap-2 border-t border-white/20">
                View All Alerts
                <ChevronRight className="w-4 h-4" />
            </button>
        </section>
    );
};

export default AlertsFeed;
