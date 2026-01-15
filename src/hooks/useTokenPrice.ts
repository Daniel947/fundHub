import { useState, useEffect } from 'react';
import axios from 'axios';

export interface TokenPrices {
    sonic: number;
    ethereum: number;
    isLoading: boolean;
}

export const useTokenPrice = () => {
    const [prices, setPrices] = useState<TokenPrices>({
        sonic: 0.65, // Default fallback price for S
        ethereum: 3500, // Default fallback price for ETH
        isLoading: true
    });

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                // Fetching ETH and FTM (proxy for Sonic) from CoinGecko
                const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,fantom&vs_currencies=usd');

                setPrices({
                    ethereum: response.data.ethereum.usd,
                    sonic: response.data.fantom.usd, // Sonic is essentially S/FTM evolution
                    isLoading: false
                });
            } catch (err) {
                console.error('Error fetching prices:', err);
                setPrices(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return prices;
};
