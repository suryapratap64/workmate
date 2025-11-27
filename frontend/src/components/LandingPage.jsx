import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import Logo from "./ui/Logo";
import { FaBriefcase, FaUser, FaArrowRight } from "react-icons/fa";
import { Sparkles, Zap, Clock } from "lucide-react";

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const getScrollContainer = () => {
      // document.scrollingElement is the element that's actually scrolled in most browsers
      // fallback to document.documentElement or window
      return document.scrollingElement || document.documentElement || window;
    };

    const scrollContainer = getScrollContainer();

    const readScrollTop = () => {
      if (scrollContainer === window)
        return window.scrollY || window.pageYOffset || 0;
      // element (documentElement or scrollingElement)
      return (scrollContainer && scrollContainer.scrollTop) || 0;
    };

    const onScroll = () => {
      const top = readScrollTop();
      setScrolled(top > 8);
      // uncomment to debug scroll value
      // console.log('scroll top:', top);
    };

    // initialize
    onScroll();

    // attach listener
    scrollContainer.addEventListener
      ? scrollContainer.addEventListener("scroll", onScroll, { passive: true })
      : window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (scrollContainer.removeEventListener) {
        scrollContainer.removeEventListener("scroll", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-sm transition-shadow duration-300 ${
          scrolled ? "shadow-md border-b" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex gap-4">
              <Link to="/login">
                <Button
                  className="px-5 py-2  bg-blue-600 text-white font-medium
                            "
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find the perfect match for your
            <span className="text-blue-600">Talent</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with skilled professionals or find amazing opportunities.
            Whether you're hiring or looking for work, WorkMate has you covered.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
          {/* Worker Card */}
          <div className="bg-white  shadow-lg p-8 border-1 border-gray-900 hover:shadow-xl transition-shadow">
            <div className="text-center mb-2">
              <div className=" w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 mx-auto mb-4">
                <FaBriefcase className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                I’m a Freelancer
              </h3>
              <p className="text-gray-600">
                Find amazing opportunities and showcase your skills to clients
                worldwide.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Browse thousands of job opportunities
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Set your own rates and schedule
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Build your professional portfolio
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Get paid securely and on time
              </div>
            </div>

            <Link to="/wsignup">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Join as Freelancer
                <FaArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Client Card */}
          <div className="bg-white  shadow-lg p-8 border-1 border-gray-900 hover:shadow-xl transition-shadow">
            <div className="text-center mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                I'm a Client
              </h3>
              <p className="text-gray-600">
                Hire talented professionals and get your projects done
                efficiently.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Post jobs and find perfect matches
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Review portfolios and ratings
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Manage projects and payments
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                Get quality work delivered on time
              </div>
            </div>

            <Link to="/csignup">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Hire as Client
                <FaArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        {/* <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Why Choose WorkMate?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Escrow protection ensures safe transactions for both parties.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">
                Quick matching and real-time communication for better results.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Verified Professionals
              </h3>
              <p className="text-gray-600">
                All workers are verified with skills and experience validated.
              </p>
            </div>
          </div>
        </div> */}

        {/* CTA Section */}
        {/* <div className="text-center bg-white  shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of professionals and clients already using WorkMate
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/wsignup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Start Working
              </Button>
            </Link>
            <Link to="/csignup">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Start Hiring
              </Button>
            </Link>
          </div>
        </div> */}

        {/* Premium WebScraping Section */}
        <div className="bg-white shadow-lg rounded-xl relative overflow-hidden py-8 px-6 border border-gray-200">
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
              animation: scroll-right 20s linear infinite;
            }
            
            .animate-scroll-left {
              animation: scroll-left 20s linear infinite;
            }
          `}</style>

          {/* Decorative accents */}
          <div className="absolute left-0 top-0 w-32 h-32 bg-blue-50 rounded-full -ml-16 -mt-16"></div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mb-16"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Premium Feature
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Access Jobs from 10+ Top Platforms
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                Never miss an opportunity. Find the latest job postings from all
                major platforms in one place.
              </p>
            </div>

            {/* Platforms Scroll Container */}
            <div className="space-y-3 mb-6 overflow-hidden">
              {/* First Row - Scroll Right */}
              <div className="flex gap-2 animate-scroll-right">
                {[
                  "LinkedIn",
                  "Naukri",
                  "Indeed",
                  "Internshala",
                  "Wellfound",
                  "Hirect",
                  "Instahyre",
                  "Cutshort",
                  "Y Combinator",
                  "Glassdoor",
                ].map((platform, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-blue-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {[
                  "LinkedIn",
                  "Naukri",
                  "Indeed",
                  "Internshala",
                  "Wellfound",
                  "Hirect",
                  "Instahyre",
                  "Cutshort",
                  "Y Combinator",
                  "Glassdoor",
                ].map((platform, idx) => (
                  <div key={`dup-${idx}`} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-blue-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
              </div>

              {/* Second Row - Scroll Left */}
              <div className="flex gap-2 animate-scroll-left">
                {[
                  "Glassdoor",
                  "Y Combinator",
                  "Cutshort",
                  "Instahyre",
                  "Hirect",
                  "Wellfound",
                  "Internshala",
                  "Indeed",
                  "Naukri",
                  "LinkedIn",
                ].map((platform, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-green-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {[
                  "Glassdoor",
                  "Y Combinator",
                  "Cutshort",
                  "Instahyre",
                  "Hirect",
                  "Wellfound",
                  "Internshala",
                  "Indeed",
                  "Naukri",
                  "LinkedIn",
                ].map((platform, idx) => (
                  <div key={`dup-${idx}`} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-green-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
              </div>

              {/* Third Row - Scroll Right with offset */}
              <div
                className="flex gap-2 animate-scroll-right"
                style={{ animationDelay: "-10s" }}
              >
                {[
                  "LinkedIn",
                  "Naukri",
                  "Indeed",
                  "Internshala",
                  "Wellfound",
                  "Hirect",
                  "Instahyre",
                  "Cutshort",
                  "Y Combinator",
                  "Glassdoor",
                ].map((platform, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-purple-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {[
                  "LinkedIn",
                  "Naukri",
                  "Indeed",
                  "Internshala",
                  "Wellfound",
                  "Hirect",
                  "Instahyre",
                  "Cutshort",
                  "Y Combinator",
                  "Glassdoor",
                ].map((platform, idx) => (
                  <div key={`dup-${idx}`} className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 text-xs sm:text-sm font-bold px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 hover:shadow-md border border-purple-200 cursor-pointer transform hover:scale-105 active:scale-95 whitespace-nowrap w-32 text-center">
                      {platform}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                <Zap className="w-4 h-4 flex-shrink-0 text-blue-600" />
                <span>Updated every 2 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-blue-600" />
                <span>Advanced AI filtering</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs sm:text-sm">
                <FaArrowRight className="w-4 h-4 flex-shrink-0 text-blue-600" />
                <span>One-click apply</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link to="/webscraping">
                <button className="group px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md hover:shadow-lg">
                  <span>Explore Premium Feature</span>
                  <Zap className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
