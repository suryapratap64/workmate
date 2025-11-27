import React from "react";
import {
  CheckCircle,
  Zap,
  Filter,
  Zap as Bolt,
  Globe,
  Target,
} from "lucide-react";

const WebScrapingFeatures = () => {
  const features = [
    {
      icon: <Bolt className="w-8 h-8" />,
      title: "Lightning-Fast Updates",
      description:
        "New jobs appear in your feed every 2 minutes. Be the first to apply before others even see them.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Filter className="w-8 h-8" />,
      title: "Most Advanced Personalized Matching",
      description:
        "Our smart algorithm learns your preferences and automatically matches jobs that perfectly align with your skills, experience, and career goals.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Job Recommendations",
      description:
        "Get personalized job suggestions based on your profile. Find opportunities you wouldn't discover otherwise.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Location Search",
      description:
        "Search jobs across multiple locations or remote opportunities. No geographic boundaries to your job search.",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "One-Click Apply",
      description:
        "Apply to multiple jobs instantly with direct links. Save time and increase your chances.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Apply First Hired First",
      description:
        "Be the first to see and apply to new job postings. Our real-time updates ensure you apply before other candidates, giving you a competitive advantage.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <section className="py-6 bg-white">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .feature-card {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        .feature-card:nth-child(5) { animation-delay: 0.5s; }
        .feature-card:nth-child(6) { animation-delay: 0.6s; }
      `}</style>
      <div className="w-full px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Powerful Features
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Everything you need to find and apply to your dream job faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-white rounded border border-gray-200 p-3.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-xs leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits List */}
        <div className="bg-gray-50 rounded border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">
            Premium Includes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              "Access to 10+ top job platforms",
              "Jobs updated every 2 minutes",
              "Unlimited personalized filtering",
              "Multi-location search",
              "Advanced filtering & search",
              "One-click apply to jobs",
              "Apply first get hired first",
              "Priority support",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-xs">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebScrapingFeatures;
