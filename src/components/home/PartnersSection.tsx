
import React from 'react';

const partners = [
  { name: "KRNL", logo: "/images/krnl_v2.jpg", width: "w-32" },
  { name: "SonicLabs", logo: "/images/sonic.png", width: "w-36" },
];

const PartnersSection = () => {
  // Duplicate the array to ensure we have enough items to scroll smoothly
  const items = [...partners, ...partners, ...partners, ...partners, ...partners];

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-400">Trusted By Industry Leaders</h3>
      </div>

      <div className="flex overflow-hidden relative w-full">
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-gray-50 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-gray-50 to-transparent"></div>

        <div className="flex animate-marquee pause-on-hover items-center">
          {/* First Set */}
          <div className="flex gap-20 shrink-0 pr-20 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {items.map((partner, index) => (
              <div key={`set1-${index}`} className="flex justify-center items-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className={`${partner.width} object-contain hover:scale-105 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>

          {/* Second Set (Duplicate for seamless loop) */}
          <div className="flex gap-20 shrink-0 pr-20 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {items.map((partner, index) => (
              <div key={`set2-${index}`} className="flex justify-center items-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className={`${partner.width} object-contain hover:scale-105 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


export default PartnersSection;
