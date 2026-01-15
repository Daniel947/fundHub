
import React from 'react';
import Layout from '@/components/layout/Layout';
import WizardLayout from '@/components/create-campaign/WizardLayout';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

const CreateCampaign = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-fundhub-light/30 py-16">
        <div className="container mx-auto px-4">
          {/* Premium Header Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-fundhub-primary/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-fundhub-primary" />
              <span className="text-xs font-black text-fundhub-primary uppercase tracking-widest">
                Campaign Builder
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-fundhub-dark mb-6 tracking-tight">
              Launch Your Vision
            </h1>

            <p className="text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8">
              Create a transparent, blockchain-powered campaign with programmable trust and milestone-based funding.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border-2 border-gray-200/80">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-gray-700">Escrow Protected</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border-2 border-gray-200/80">
                <Zap className="w-4 h-4 text-fundhub-primary" />
                <span className="text-sm font-bold text-gray-700">Instant Deployment</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border-2 border-gray-200/80">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-gray-700">Multi-Chain Support</span>
              </div>
            </div>
          </div>

          <WizardLayout />
        </div>
      </div>
    </Layout>
  );
};

export default CreateCampaign;
