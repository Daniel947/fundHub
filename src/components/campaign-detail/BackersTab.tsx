import { formatUnits } from 'viem';
import { ExternalLink, User, Coins } from 'lucide-react';
import { getTokenBySymbol } from '@/lib/tokens';

interface Backer {
    address: string;
    amount: string;
    txid?: string;
    time?: number;
}

interface BackersTabProps {
    campaignId: string;
    currency: string;
    network: 'sonic' | 'ethereum' | 'btc';
    backers: Backer[];
}

const BackerRow = ({
    backer,
    network,
    currency
}: {
    backer: Backer;
    network: 'sonic' | 'ethereum' | 'btc';
    currency: string;
}) => {
    const isEth = network === 'ethereum';
    const isBtc = network === 'btc';

    let explorerUrl = '';
    if (isBtc) {
        explorerUrl = 'https://blockstream.info/testnet/address/';
    } else {
        explorerUrl = isEth ? 'https://sepolia.etherscan.io/address/' : 'https://testnet.sonicscan.org/address/';
    }

    // Amount formatting
    let displayAmount = '0.00';
    try {
        if (isBtc) {
            // BTC amount is already in decimal string format ("0.001")
            displayAmount = parseFloat(backer.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
        } else {
            const tokenInfo = getTokenBySymbol(currency, network as any);
            const decimals = tokenInfo?.decimals || 18;
            const amount = formatUnits(BigInt(backer.amount), decimals);
            displayAmount = parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
        }
    } catch (e) {
        console.error("Formatting error:", e);
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white/50 hover:bg-white/80 transition-all rounded-xl border border-gray-100 group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fundhub-primary/20 to-purple-500/20 flex items-center justify-center text-fundhub-primary">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <a
                        href={`${explorerUrl}${backer.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm font-bold text-gray-700 hover:text-fundhub-primary flex items-center gap-1 transition-colors"
                    >
                        {backer.address.slice(0, 6)}...{backer.address.slice(-4)}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <p className="text-[10px] text-gray-400 font-medium">Verified Backer</p>
                </div>
            </div>

            <div className="text-right">
                <div className="font-bold text-fundhub-dark flex items-center justify-end gap-1">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    {displayAmount} {currency}
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Contributed</p>
            </div>
        </div>
    );
};

export const BackersTab = ({ currency, network, backers }: BackersTabProps) => {
    if (!backers || backers.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-1">No Backers Yet</h3>
                <p className="text-gray-500 text-sm">Be the first to support this campaign!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="text-xl font-black text-fundhub-dark">
                    Community Support
                    <span className="ml-2 text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {backers.length}
                    </span>
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {backers.map((backer) => (
                    <BackerRow
                        key={backer.address}
                        backer={backer}
                        network={network}
                        currency={currency}
                    />
                ))}
            </div>
        </div>
    );
};
