import React from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';

interface Testimonial {
    donor: string;
    comment: string;
    date: string;
    campaign?: string;
}

interface CommunityFeedbackProps {
    testimonials: Testimonial[];
}

const CommunityFeedback = ({ testimonials }: CommunityFeedbackProps) => {
    if (testimonials.length === 0) {
        return (
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-12 border-2 border-gray-200/80 mb-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No testimonials yet</p>
                <p className="text-sm text-gray-500 mt-2">Donor feedback will appear here</p>
            </div>
        );
    }

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-6 h-6 text-fundhub-primary" />
                <h2 className="text-2xl font-black text-fundhub-dark">Community Feedback</h2>
            </div>

            <div className="space-y-4">
                {testimonials.map((testimonial, i) => (
                    <div key={i} className="p-6 bg-white/40 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="font-black text-fundhub-dark">{testimonial.donor}</div>
                                {testimonial.campaign && (
                                    <div className="text-xs text-gray-500">Backed: {testimonial.campaign}</div>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{testimonial.date}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium">{testimonial.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityFeedback;
