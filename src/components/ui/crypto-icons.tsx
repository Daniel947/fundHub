import React from 'react';

export const BTCLogo = ({ className }: { className?: string }) => (
    <img src="/images/btc.png" alt="BTC" className={className} />
);

export const ETHLogo = ({ className }: { className?: string }) => (
    <img src="/images/eth.png" alt="ETH" className={className} />
);

export const USDCLogo = ({ className }: { className?: string }) => (
    <img src="/images/usdc.png" alt="USDC" className={className} />
);

export const USDTLogo = ({ className }: { className?: string }) => (
    <img src="/images/usdt.png" alt="USDT" className={className} />
);

// Note: Using the specific Sonic logo provided by the user
export const SONICLogo = ({ className }: { className?: string }) => (
    <img src="/images/sonic.png" alt="SONIC" className={className} />
);
