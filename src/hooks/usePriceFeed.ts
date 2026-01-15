import { useState, useEffect } from 'react';

export interface PriceData {
    [key: string]: {
        usd: number;
    };
}

const COINGECKO_IDS: Record<string, string> = {
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'SONIC': 'sonic-3',
    'S': 'sonic-3',
    'USDT': 'tether',
    'USDC': 'usd-coin'
};

export const usePriceFeed = () => {
    const [prices, setPrices] = useState<PriceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = async () => {
        try {
            const ids = Object.values(COINGECKO_IDS).join(',');
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
            );

            if (!response.ok) throw new Error('Failed to fetch prices');

            const data = await response.json();

            // Map common symbols to the fetched data
            const mappedPrices: PriceData = {};
            Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
                mappedPrices[symbol] = { usd: data[id]?.usd || (symbol.startsWith('USD') ? 1 : 0) };
            });

            // Special fallback for Sonic if not found
            if (mappedPrices['SONIC'].usd === 0) mappedPrices['SONIC'].usd = 0.5;
            if (mappedPrices['S'].usd === 0) mappedPrices['S'].usd = 0.5;
            if (mappedPrices['ETH'].usd === 0) mappedPrices['ETH'].usd = 2500;
            if (mappedPrices['BTC'].usd === 0) mappedPrices['BTC'].usd = 65000;

            setPrices(mappedPrices);
            setError(null);
        } catch (err) {
            console.error('Price fetch error:', err);
            setError('Could not update prices');
            // Fallback mock prices if API fails
            setPrices({
                'ETH': { usd: 2500 },
                'BTC': { usd: 65000 },
                'SONIC': { usd: 0.5 },
                'S': { usd: 0.5 },
                'USDT': { usd: 1 },
                'USDC': { usd: 1 }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const convertToUSD = (amount: number | string, currency: string): string => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(value) || !prices) return '0.00';

        const upperCurrency = currency.toUpperCase();
        const price = prices[upperCurrency]?.usd || 0;

        return (value * price).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return { prices, isLoading, error, convertToUSD };
};
