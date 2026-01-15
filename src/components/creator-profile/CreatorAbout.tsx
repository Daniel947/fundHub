import React from 'react';
import { Globe, Twitter, Linkedin, ExternalLink } from 'lucide-react';

interface CreatorAboutProps {
    bio: string;
    focusAreas: string[];
    yearsActive: number;
    socialLinks?: {
        website?: string;
        twitter?: string;
        linkedin?: string;
    };
}

const CreatorAbout = ({ bio, focusAreas, yearsActive, socialLinks }: CreatorAboutProps) => {
    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80 mb-8">
            <h2 className="text-2xl font-black text-fundhub-dark mb-4">About the Creator</h2>

            {/* Bio */}
            <p className="text-gray-700 leading-relaxed mb-6 font-medium">{bio}</p>

            {/* Focus Areas */}
            <div className="mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                    {focusAreas.map((area, i) => (
                        <span
                            key={i}
                            className="px-4 py-2 bg-fundhub-primary/10 text-fundhub-primary rounded-xl font-bold text-sm"
                        >
                            {area}
                        </span>
                    ))}
                </div>
            </div>

            {/* Years Active & Links */}
            <div className="flex flex-wrap items-center gap-6">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Years Active</div>
                    <div className="text-2xl font-black text-fundhub-dark">{yearsActive}</div>
                </div>

                {socialLinks && (
                    <div className="flex gap-3 ml-auto">
                        {socialLinks.website && (
                            <a
                                href={socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <Globe className="w-5 h-5 text-gray-600" />
                            </a>
                        )}
                        {socialLinks.twitter && (
                            <a
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <Twitter className="w-5 h-5 text-gray-600" />
                            </a>
                        )}
                        {socialLinks.linkedin && (
                            <a
                                href={socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <Linkedin className="w-5 h-5 text-gray-600" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorAbout;
