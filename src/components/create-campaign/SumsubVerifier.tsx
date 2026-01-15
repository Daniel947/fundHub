import React, { useState, useEffect } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';

interface SumsubVerifierProps {
    externalUserId: string;
    onSuccess: () => void;
    onError: (error: any) => void;
}

const SumsubVerifier: React.FC<SumsubVerifierProps> = ({ externalUserId, onSuccess, onError }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/sumsub-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ externalUserId }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.details?.description || errorData.error || 'Failed to fetch Sumsub token');
                }

                const data = await response.json();
                setAccessToken(data.token);
            } catch (err: any) {
                console.error('Token fetch error:', err);
                setErrorMessage(err.message);
                onError(err);
            } finally {
                setLoading(false);
            }
        };

        if (externalUserId) {
            fetchToken();
        }
    }, [externalUserId, onError]);

    if (loading) {
        return <div className="text-center p-4">Initializing secure verification...</div>;
    }

    if (!accessToken) {
        return (
            <div className="text-red-500 p-6 font-medium text-center space-y-2">
                <p>⚠️ Verification Error</p>
                <p className="text-xs opacity-80">{errorMessage || 'Could not establish secure connection.'}</p>
                <p className="text-[10px] mt-4 text-gray-400">Please check if the Level Name in your Dashboard matches the one in .env</p>
            </div>
        );
    }

    return (
        <div className="sumsub-container rounded-xl overflow-hidden border border-gray-200">
            <SumsubWebSdk
                accessToken={accessToken}
                expirationHandler={() => {
                    // Promise that provides new token
                    return fetch('http://localhost:3001/api/sumsub-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ externalUserId }),
                    }).then(res => res.json()).then(data => data.token);
                }}
                onMessage={(type, payload) => {
                    console.log('Sumsub Message:', type, payload);

                    // Standard way to handle success in the React SDK via messages
                    if (type === 'idCheck.onApplicantStatusChanged' && payload.reviewStatus === 'completed') {
                        if (payload.reviewResult?.reviewAnswer === 'GREEN') {
                            onSuccess();
                        }
                    }

                    // Fallback for some configurations
                    if (type === 'idCheck.onStepCompleted' && payload.idCheckState === 'completed' && payload.reviewResult?.reviewAnswer === 'GREEN') {
                        onSuccess();
                    }
                }}
                onError={(error) => {
                    console.error('Sumsub SDK Error:', error);
                    onError(error);
                }}
            />
        </div>
    );
};

export default SumsubVerifier;
