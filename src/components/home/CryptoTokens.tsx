
import React from 'react';

const CryptoTokens = () => {
  const tokens = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      image: '/images/eth.png',
      description: 'The leading smart contract platform for decentralized applications'
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      image: '/images/btc.png',
      description: 'The original cryptocurrency and digital store of value'
    },
    {
      name: 'USDC',
      symbol: 'USDC',
      image: '/images/usdc.png',
      description: 'A fully-collateralized US dollar stablecoin'
    },
    {
      name: 'Tether',
      symbol: 'USDT',
      image: '/images/usdt.png',
      description: 'The most widely used stablecoin in the crypto ecosystem'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Multi-Currency Support</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            FundHub accepts a wide range of cryptocurrencies for donations, making it easy to contribute regardless of your preferred digital currency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {tokens.map((token) => (
            <div key={token.symbol} className="relative group overflow-hidden h-full">
              <div className="card-hover bg-white rounded-xl border border-gray-100 p-6 transition-all h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 overflow-hidden shadow-sm">
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 opacity-60"></div>
                  </div>
                </div>

                <h3 className="font-bold text-lg">{token.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="font-mono font-bold mr-1">{token.symbol}</span>
                </div>
                <p className="text-sm text-gray-600 flex-grow">{token.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            More currencies are being added regularly to increase accessibility
          </p>
        </div>
      </div>
    </section>
  );
};

export default CryptoTokens;
