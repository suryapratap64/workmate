import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const WebScrapingCTA = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.worker);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        {/* Main CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12 text-center mb-8 shadow-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Apply First?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who are getting hired faster with
            WorkMate Premium. Access 10+ platforms, apply in seconds, and land
            your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => navigate(user ? "/webscraping/home" : "/login")}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg hover:bg-white/30 transition-all duration-300 border-2 border-white"
            >
              Back to WorkMate
            </button>
          </div>

          <p className="text-blue-100 text-sm">
            💎 30 free jobs • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">100% Safe</h3>
            <p className="text-sm text-gray-600">
              Verified jobs from legitimate companies only. No scams.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Access</h3>
            <p className="text-sm text-gray-600">
              Start applying to jobs within seconds of signing up.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md text-center">
            <div className="flex justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Money Back</h3>
            <p className="text-sm text-gray-600">
              30-day guarantee. Not satisfied? Full refund, no questions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebScrapingCTA;
