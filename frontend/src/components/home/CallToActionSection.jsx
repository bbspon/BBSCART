import React from 'react';
import AnimatedSection from './AnimatedSection';

const CallToActionSection = () => {
  return (
    <section className="py-16 bg-[#cf1717] text-white">
      <div className="container mx-auto px-4 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our collections and find the perfect items for your needs.
          </p>
          <a
            href="#"
            className="inline-block bg-white text-[#cf1717] px-8 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CallToActionSection;