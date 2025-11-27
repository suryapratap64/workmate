import React from "react";
import { Zap, Sparkles, ArrowRight, Bolt, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const WebScrapingHero = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);

  const companies = [
    "LinkedIn",
    "Naukri",
    "Indeed",
    "Internshala",
    "Wellfound",
    "hirist",
    "Instahyre",
    "Cutshort",
    "Y Combinator",
    "Glassdoor",
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate("/webscraping/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="py-6 bg-white relative overflow-hidden">
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-scroll-right {
          animation: scroll-right 25s linear infinite;
        }

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

        .value-prop-card {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .value-prop-card:nth-child(1) { animation-delay: 0.3s; }
        .value-prop-card:nth-child(2) { animation-delay: 0.4s; }
        .value-prop-card:nth-child(3) { animation-delay: 0.5s; }
      `}</style>

      {/* Main Content */}
      <div className="w-full relative z-10">
        {/* Main Heading */}
        <div className="text-center px-4 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900 mb-2">
            <span className="block">Access 10+ Job Platforms</span>
            <span className="block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              in One Place
            </span>
          </h1>
        </div>

        {/* Company Carousel */}
        <div className="mb-4 bg-gray-50 border-b border-gray-200 py-3 px-4">
          <div className="overflow-hidden">
            <div className="flex gap-2 animate-scroll-right">
              {companies.map((company, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <div className="bg-white text-blue-600 text-xs font-bold px-2 py-1.5 rounded border border-blue-200 whitespace-nowrap text-center">
                    {company}
                  </div>
                </div>
              ))}
              {companies.map((company, idx) => (
                <div key={`dup-${idx}`} className="flex-shrink-0">
                  <div className="bg-white text-blue-600 text-xs font-bold px-2 py-1.5 rounded border border-blue-200 whitespace-nowrap text-center">
                    {company}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subheading and Value Props */}
        <div className="px-4">
          <p className="text-sm text-gray-700 text-center mb-4 leading-relaxed">
            Aggregated job listings from LinkedIn, Indeed, Glassdoor, and more.
            Find your perfect match in seconds.
          </p>

          {/* Three Value Props - Simple Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="value-prop-card bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded p-4 hover:shadow-md hover:border-blue-300 transition-all duration-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-xs mb-0.5">
                  10+ Platforms
                </p>
                <p className="text-xs text-gray-600">Aggregated</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
            <div className="value-prop-card bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded p-4 hover:shadow-md hover:border-blue-300 transition-all duration-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-xs mb-0.5">
                  Real-Time
                </p>
                <p className="text-xs text-gray-600">Updates</p>
              </div>
              <Bolt className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
            <div className="value-prop-card bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded p-4 hover:shadow-md hover:border-blue-300 transition-all duration-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-xs mb-0.5">
                  Personalized
                </p>
                <p className="text-xs text-gray-600">Filtering</p>
              </div>
              <Filter className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-2.5">
            <button
              onClick={handleGetStarted}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition-all flex items-center justify-center gap-1.5"
            >
              Start Applying Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/home")}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm font-bold rounded border border-gray-300 transition-all"
            >
              Back to WorkMate
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebScrapingHero;
