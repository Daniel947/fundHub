import React from 'react';
import { Award, ExternalLink } from 'lucide-react';

interface Credential {
    type: 'NGO' | 'Certification' | 'Partnership';
    name: string;
    issuer: string;
    date?: string;
    logo?: string;
    url?: string;
}

interface CredentialsProps {
    credentials: Credential[];
}

const Credentials = ({ credentials }: CredentialsProps) => {
    if (credentials.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border-2 border-gray-200/80 mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-fundhub-primary" />
                <h2 className="text-2xl font-black text-fundhub-dark">Credentials & Partnerships</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {credentials.map((credential, i) => (
                    <div key={i} className="p-6 bg-white/40 rounded-xl border-2 border-gray-200/80 hover:border-gray-300 transition-all">
                        <div className="flex items-start gap-4">
                            {credential.logo ? (
                                <img src={credential.logo} alt={credential.name} className="w-12 h-12 object-contain" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-fundhub-primary/10 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-fundhub-primary" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="text-xs font-black text-fundhub-primary uppercase mb-1">{credential.type}</div>
                                <div className="font-black text-fundhub-dark mb-1">{credential.name}</div>
                                <div className="text-sm text-gray-600">{credential.issuer}</div>
                                {credential.date && (
                                    <div className="text-xs text-gray-400 mt-1">{credential.date}</div>
                                )}
                                {credential.url && (
                                    <a
                                        href={credential.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-fundhub-primary hover:underline flex items-center gap-1 mt-2"
                                    >
                                        Verify <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Credentials;
