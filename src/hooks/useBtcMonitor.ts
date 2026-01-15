import { useState, useEffect } from 'react';
import axios from 'axios';

interface BtcStatus {
    address: string;
    totalBtc: number;
    unconfirmedBtc: number;
    utxoCount: number;
    hasPending: boolean;
}

export const useBtcMonitor = (address: string | null | undefined) => {
    const [status, setStatus] = useState<BtcStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address) return;

        const checkStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/btc/monitor/${address}`);
                setStatus(response.data);
                setError(null);
            } catch (err: any) {
                console.error('BTC Monitor Error:', err.message);
                setError('Failed to monitor address');
            }
        };

        // Initial check
        setIsLoading(true);
        checkStatus().finally(() => setIsLoading(false));

        // Poll every 10 seconds
        const interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, [address]);

    return {
        status,
        isLoading,
        error,
        pendingAmount: status?.unconfirmedBtc || 0,
        hasPending: status?.hasPending || false
    };
};
