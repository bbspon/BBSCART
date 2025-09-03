// LegalAndBlogPage.jsx — Final Full React Frontend Code for DROP BLOCK 010 + 011 (With Inline Legal Pages)

import React, { useState } from "react";

const legalContent = {
  "terms": {
    title: "Terms & Conditions",
    content: "These Terms & Conditions govern the use of BBSCART services... (full terms content here)."
  },
  "privacy": {
    title: "Privacy Policy",
    content: "We respect your privacy and ensure data protection... (full privacy policy here)."
  },
  "disclaimer": {
    title: "Medical / Legal Disclaimer",
    content: "All health-related advice on this site is for informational purposes only..."
  },
  "refund": {
    title: "Return & Refund Policy",
    content: "You may request a refund within 7 days under these conditions..."
  },
  "cancel": {
    title: "Cancellation Policy",
    content: "Cancellations are allowed before order dispatch or within 24 hours..."
  }
};

export default function LegalAndBlogPage() {
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const blogPosts = [
    {
      title: "Why Preventive Health Saves You Lakhs",
      date: "July 2025",
      author: "Dr. Ashwin Kumar",
      tags: ["Health", "Prevention"],
      image: "/img/blog/preventive.jpg",
      summary: "Discover how early health plans with BBSCART can reduce long-term medical costs.",
      url: "/blog/preventive-health",
    },
    {
      title: "How THIA Jewellery Made Real Gold Affordable",
      date: "June 2025",
      author: "BBSCART Editorial",
      tags: ["Jewellery", "Finance"],
      image: "/img/blog/thia-gold.jpg",
      summary: "Learn how customers are buying BIS gold with flexible installments using BBSCART.",
      url: "/blog/thia-gold-plan",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">🔐 Legal & Trust Center</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">📄 Policies</h2>
          <ul className="list-disc list-inside text-blue-600 space-y-2 cursor-pointer">
            <li onClick={() => setSelectedPolicy("terms")}>Terms & Conditions</li>
            <li onClick={() => setSelectedPolicy("privacy")}>Privacy Policy</li>
            <li onClick={() => setSelectedPolicy("disclaimer")}>Medical / Legal Disclaimer</li>
            <li onClick={() => setSelectedPolicy("refund")}>Return & Refund Policy</li>
            <li onClick={() => setSelectedPolicy("cancel")}>Cancellation Policy</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">🔒 Trust & Security</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>🔐 SSL & AES-256 Encrypted Transactions</li>
            <li>📜 GDPR & HIPAA (Health Data) Compliant</li>
            <li>🛡 Verified Vendors & BIS Certification</li>
            <li>📊 Legal logs of user consents & timestamps</li>
            <li>✅ PCI-DSS Compliant Payment Gateways</li>
          </ul>
        </div>
      </div>

      {selectedPolicy && (
        <div className="bg-gray-100 p-6 rounded-lg mb-10">
          <h3 className="text-2xl font-semibold mb-2">📘 {legalContent[selectedPolicy].title}</h3>
          <p className="text-gray-700 whitespace-pre-line">{legalContent[selectedPolicy].content}</p>
        </div>
      )}

   <div className="grid grid-cols-2 gap-4 mb-8">
  <img src="/img/hero/thia1.png" alt="SSL" className="w-full h-auto rounded shadow" />
  <img src="/img/hero/thia1.png" alt="BIS Certified" className="w-full h-auto rounded shadow" />
  <img src="/img/hero/thia1.png" alt="GDPR" className="w-full h-auto rounded shadow" />
  <img src="/img/hero/thia1.png" alt="HIPAA" className="w-full h-auto rounded shadow" />
</div>


      <h1 className="text-3xl font-bold mb-4">📰 BBSCART Blog & Updates</h1>

      <p className="text-gray-600 mb-6 max-w-3xl">
        Stay updated with the latest health tips, product announcements, and inspiring customer stories from across the BBSCART ecosystem.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {blogPosts.map((post, idx) => (
          <div key={idx} className="bg-white shadow rounded-lg overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-2">
                By {post.author} • {post.date}
              </p>
              <p className="text-gray-700 mb-3">{post.summary}</p>
              <div className="flex gap-2 text-sm text-white">
                {post.tags.map((tag, i) => (
                  <span key={i} className="bg-blue-500 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <a href={post.url} className="block text-blue-600 mt-4 hover:underline">
                Read More →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-5 bg-gray-50 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">🔍 SEO Summary</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Dynamic meta titles + descriptions for all pages</li>
          <li>JSON-LD schema for Blog, Product, FAQ</li>
          <li>Sitemap.xml and Robots.txt auto-generated</li>
          <li>Open Graph + Twitter Cards configured</li>
        </ul>
        <p className="text-sm text-gray-500 mt-2">
          SEO enhancements are managed in the Admin CMS or via the `seo.config.js` file.
        </p>
      </div>
    </div>
  );
}
