import React, { useState } from 'react';
import { MessageSquare, Send, Heart, Reply, Clock, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useCampaignComments } from '@/hooks/useCampaignComments';

interface CommunityTabProps {
    campaignId: string;
    currency: string;
    creator: string;
    network: string;
}

interface CommentItemProps {
    comment: any;
    depth: number;
    isConnected: boolean;
    replyingTo: number | null;
    setReplyingTo: (id: number | null) => void;
    replyContent: string;
    setReplyContent: (content: string) => void;
    handleSubmitComment: (parentId: number | null) => void;
    isSubmitting: boolean;
    formatTimeAgo: (timestamp: string) => string;
}

const CommentItem = ({
    comment,
    depth,
    isConnected,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleSubmitComment,
    isSubmitting,
    formatTimeAgo
}: CommentItemProps) => (
    <div className="relative space-y-4">
        {/* Connector Line for children */}
        {comment.children && comment.children.length > 0 && (
            <div
                className="absolute left-6 md:left-12 top-20 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 to-transparent z-0"
                style={{ marginLeft: '-1px' }}
            />
        )}

        <div
            className={`relative z-10 bg-white/40 backdrop-blur-md rounded-2xl transition-all hover:border-gray-300 ${comment.isCreator
                ? 'border-fundhub-primary/50 bg-gradient-to-br from-fundhub-light/30 to-white/40 shadow-lg shadow-fundhub-primary/10'
                : 'border-gray-200/80'
                } ${depth > 0 ? 'p-4 border-l-4 border-l-fundhub-primary/20' : 'p-6 border-2 shadow-sm'}`}
        >
            {comment.isCreator && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-fundhub-primary/20">
                    <div className="w-1 h-6 bg-gradient-to-b from-fundhub-primary to-fundhub-secondary rounded-full" />
                    <span className="text-xs font-black text-fundhub-primary uppercase tracking-wider">
                        Creator Response
                    </span>
                </div>
            )}
            <div className="flex gap-4">
                {/* Avatar */}
                <Avatar className={`${depth > 0 ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-12 md:h-12'} border-2 shadow-md transition-all ${comment.isCreator ? 'border-fundhub-primary ring-2 ring-fundhub-primary/20' : 'border-white'}`}>
                    <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.authorAddress || 'anonymous'}`} />
                    <AvatarFallback className="bg-gradient-to-br from-fundhub-primary to-fundhub-secondary text-white font-black">
                        {(comment.userName || 'A').charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`${depth > 0 ? 'text-sm' : 'text-base'} font-black text-fundhub-dark`}>
                                {comment.userName || 'Anonymous'}
                            </span>
                            {comment.isCreator && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-fundhub-primary to-fundhub-secondary text-white text-[10px] md:text-xs font-black rounded-full shadow-md">
                                    <img
                                        src="/images/verified-badge.png"
                                        alt="Verified"
                                        className="w-2.5 h-2.5 md:w-3 md:h-3"
                                    />
                                    CREATOR
                                </div>
                            )}
                            <span className="text-[10px] md:text-xs text-gray-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(comment.time)}
                            </span>
                        </div>
                    </div>
                    <p className={`${depth > 0 ? 'text-sm' : 'text-base'} text-gray-700 font-medium leading-relaxed whitespace-pre-wrap break-words mb-3`}>
                        {comment.content}
                    </p>

                    {isConnected && depth < 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                if (replyingTo !== comment.id) setReplyContent('');
                            }}
                            className="h-8 px-0 text-xs font-bold text-fundhub-primary hover:text-fundhub-secondary hover:bg-transparent"
                        >
                            <Reply className="w-3 h-3 mr-1" />
                            Reply
                        </Button>
                    )}

                    {replyingTo === comment.id && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                            <Textarea
                                placeholder="Write your reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                                className="min-h-[80px] bg-white/60 backdrop-blur-sm border-2 border-fundhub-primary/20 focus:border-fundhub-primary rounded-xl resize-none text-sm"
                            />
                            <div className="flex justify-start gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmitComment(comment.id)}
                                    disabled={isSubmitting || !replyContent.trim()}
                                    className="btn-gradient h-9 px-4 rounded-xl font-black text-xs shadow-md"
                                >
                                    Post Reply
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(null)}
                                    className="h-9 px-4 rounded-xl font-bold text-xs"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {comment.children && comment.children.length > 0 && (
            <div className="space-y-4 ml-6 md:ml-12 border-l-2 border-gray-100 pl-4 md:pl-6">
                {comment.children.map((child: any) => (
                    <CommentItem
                        key={child.id}
                        comment={child}
                        depth={depth + 1}
                        isConnected={isConnected}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        handleSubmitComment={handleSubmitComment}
                        isSubmitting={isSubmitting}
                        formatTimeAgo={formatTimeAgo}
                    />
                ))}
            </div>
        )}
    </div>
);

export const CommunityTab = ({ campaignId, currency, creator, network }: CommunityTabProps) => {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();
    const { comments, isLoading, addComment } = useCampaignComments(campaignId, network);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const processedComments = React.useMemo(() => {
        const mapped = comments.map(c => ({
            ...c,
            isCreator: c.authorAddress?.toLowerCase() === creator.toLowerCase()
        }));

        const commentMap = new Map();
        const roots: any[] = [];

        mapped.forEach(comment => {
            commentMap.set(comment.id, { ...comment, children: [] });
        });

        mapped.forEach(comment => {
            if (comment.parentId !== null && comment.parentId !== undefined && commentMap.has(comment.parentId)) {
                commentMap.get(comment.parentId).children.push(commentMap.get(comment.id));
            } else {
                roots.push(commentMap.get(comment.id));
            }
        });

        const sortChronologically = (a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime();
        commentMap.forEach(comment => {
            if (comment.children.length > 0) {
                comment.children.sort(sortChronologically);
            }
        });

        roots.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        return roots;
    }, [comments, creator]);

    const handleSubmitComment = async (parentId: number | null = null) => {
        const content = parentId ? replyContent : newComment;

        if (!isConnected) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to post a comment.",
                variant: "destructive"
            });
            return;
        }

        if (!content.trim()) {
            toast({
                title: "Empty Comment",
                description: "Please write something before posting.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addComment(content, parentId || undefined);
            if (parentId) {
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setNewComment('');
            }
            toast({
                title: parentId ? "Reply Posted!" : "Comment Posted!",
                description: "Your message has been added to the discussion.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to post comment. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-fundhub-primary" />
                    <h3 className="text-lg font-black text-fundhub-dark">Community Activity</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-600 uppercase">Comments</span>
                        </div>
                        <p className="text-2xl font-black text-blue-700">{comments.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl p-4 border border-pink-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="w-4 h-4 text-pink-600" />
                            <span className="text-xs font-bold text-pink-600 uppercase">Supporters</span>
                        </div>
                        <p className="text-2xl font-black text-pink-700">{comments.filter(c => c.authorAddress?.toLowerCase() !== creator.toLowerCase()).length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Reply className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-bold text-purple-600 uppercase">Replies</span>
                        </div>
                        <p className="text-2xl font-black text-purple-700">{comments.filter(c => c.parentId).length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-600 uppercase">Active Today</span>
                        </div>
                        <p className="text-2xl font-black text-green-700">
                            {comments.filter(c => {
                                const commentDate = new Date(c.time);
                                const today = new Date();
                                return commentDate.toDateString() === today.toDateString();
                            }).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/80">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-fundhub-primary" />
                    <h3 className="text-lg font-black text-fundhub-dark">Join the Discussion</h3>
                </div>
                <div className="space-y-4">
                    <Textarea
                        placeholder={isConnected ? "Share your thoughts, ask questions, or show support..." : "Connect your wallet to join the conversation"}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!isConnected || isSubmitting}
                        className="min-h-[120px] bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:border-fundhub-primary rounded-xl resize-none font-medium"
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 font-medium">
                            {isConnected ? `Posting as ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect wallet to post'}
                        </p>
                        <Button
                            onClick={() => handleSubmitComment(null)}
                            disabled={!isConnected || isSubmitting || !newComment.trim()}
                            className="btn-gradient px-6 py-2 rounded-xl font-black text-sm shadow-lg shadow-fundhub-primary/30 hover:shadow-xl transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Post Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-fundhub-dark">
                        Discussion ({comments.length})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border-2 border-gray-200/80 text-center">
                        <div className="w-12 h-12 border-4 border-fundhub-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Loading discussion...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border-2 border-gray-200/80 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold text-lg mb-2">No comments yet</p>
                        <p className="text-gray-400 text-sm">Be the first to start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {processedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                depth={0}
                                isConnected={isConnected}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyContent={replyContent}
                                setReplyContent={setReplyContent}
                                handleSubmitComment={handleSubmitComment}
                                isSubmitting={isSubmitting}
                                formatTimeAgo={formatTimeAgo}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityTab;
