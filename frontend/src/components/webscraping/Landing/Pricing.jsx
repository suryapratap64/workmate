import React from "react";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const WebScrapingPricing = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);

  const tiers = [
    {
      name: "Hourly",
      price: "₹2",
      period: "/hour",
      description: "Perfect for quick searches",
      features: [
        "Access for 1 hour",
        "10+ job platforms",
        "Personalized filtering",
        "Unlimited job apply",
        "Real-time updates",
      ],
      cta: "Buy Now",
      highlight: false,
      route: user ? "/webscraping/checkout?plan=hourly" : "/login",
    },
    {
      name: "Daily",
      price: "₹14",
      period: "/day",
      description: "Best for active job seekers",
      features: [
        "24-hour full access",
        "10+ job platforms",
        "Unlimited personalized filtering",
        "Unlimited job apply",
        "Real-time job updates",
        "Multiple location search",
        "Smart recommendations",
      ],
      cta: "Subscribe Now",
      highlight: true,
      route: user ? "/webscraping/checkout?plan=daily" : "/login",
    },
    {
      name: "Monthly",
      price: "₹150",
      period: "/month",
      description: "Best value for serious seekers",
      features: [
        "30-day full access",
        "10+ job platforms",
        "Unlimited personalized filtering",
        "Unlimited job apply",
        "Real-time job updates",
        "Multiple location search",
        "Smart recommendations",
        "Priority support",
      ],
      cta: "Subscribe Now",
      highlight: false,
      route: user ? "/webscraping/checkout?plan=monthly" : "/login",
    },
  ];

  const handleCTA = (route) => {
    navigate(route);
  };

  return (
    <section className="py-6 bg-white">
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 25s linear infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 25s linear infinite;
        }
      `}</style>

      <div className="w-full px-4">
        {/* Main Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
            Simple Pricing
          </h2>
          <p className="text-sm text-gray-600">
            Choose the plan that works for you. Access all 10+ platforms.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded border border-gray-200 p-3.5">
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">
              Apply First
            </h4>
            <p className="text-gray-600 text-xs">
              Get instant access to latest jobs and apply before others.
            </p>
          </div>
          <div className="bg-gray-50 rounded border border-gray-200 p-3.5">
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">
              Get Hired Fast
            </h4>
            <p className="text-gray-600 text-xs">
              Apply to multiple jobs faster with our unified platform.
            </p>
          </div>
          <div className="bg-gray-50 rounded border border-gray-200 p-3.5">
            <h4 className="font-bold text-gray-900 text-sm mb-1.5">
              Find All Jobs
            </h4>
            <p className="text-gray-600 text-xs">
              See every job in one place, instantly curated for you.
            </p>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded border transition-all ${
                tier.highlight
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Highlight Badge */}
              {tier.highlight && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                  MOST POPULAR ⭐
                </div>
              )}

              <div className="p-4">
                {/* Plan Name */}
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {tier.name}
                </h3>
                <p className="text-gray-600 text-xs mb-2.5">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mb-3.5">
                  <span className="text-2xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-600 text-xs font-medium">
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleCTA(tier.route)}
                  className={`w-full py-2 px-3 rounded text-sm font-bold transition-all flex items-center justify-center gap-1.5 mb-3.5 ${
                    tier.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-3 h-3" />
                </button>

                {/* Features List */}
                <div className="space-y-2 border-t border-gray-200 pt-3.5">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded border border-gray-200 p-4 mb-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">FAQ</h3>
          <div className="space-y-2.5">
            {[
              {
                q: "Can I change my plan anytime?",
                a: "Yes, upgrade or downgrade anytime with no penalties.",
              },
              {
                q: "Do you have a refund policy?",
                a: "Yes, 30-day money-back guarantee if not satisfied.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, no lock-in contracts.",
              },
              {
                q: "Which payment methods do you accept?",
                a: "All major credit cards, PayPal, and bank transfers.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="pb-2.5 border-b border-gray-300 last:border-b-0"
              >
                <h4 className="font-bold text-gray-900 text-xs mb-0.5">
                  {faq.q}
                </h4>
                <p className="text-gray-600 text-xs">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            Ready to apply first and get hired first?
          </h3>
          <button
            onClick={() =>
              handleCTA(user ? "/webscraping/checkout?plan=daily" : "/login")
            }
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-all"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WebScrapingPricing;
