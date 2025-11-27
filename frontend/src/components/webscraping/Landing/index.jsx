import React from "react";
import WebScrapingHero from "./Hero";
import WebScrapingFeatures from "./Features";
import WebScrapingPricing from "./Pricing";
import WebScrapingCTA from "./CTA";

const WebScrapingLanding = () => {
  return (
    <div className="min-h-screen bg-white">
      <WebScrapingHero />
      <WebScrapingFeatures />
      <WebScrapingPricing />

    </div>
  );
};

export default WebScrapingLanding;
