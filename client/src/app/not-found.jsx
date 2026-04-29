'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <div className="relative inline-block">
            <img
              src="/RnpLogo.png"
              alt="Rashtriya Nidhi Portal"
              className="w-24 h-24 mx-auto mb-4 drop-shadow-lg transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-150 animate-pulse opacity-50"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-3 transition-all duration-700 delay-200 leading-tight">
            Rashtriya Nidhi Portal
          </h1>
          <p className="text-lg text-indigo-600 font-medium transition-all duration-700 delay-300 leading-relaxed">
            Government of India
          </p>
        </div>

        {/* 404 with Glitch Effect */}
        <div className="relative mb-12">
          <h2 className="text-8xl md:text-9xl lg:text-[10rem] font-black text-blue-200 select-none glitch-text transition-all duration-700 delay-400 leading-none">
            404
          </h2>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-4 border-blue-300 rounded-full animate-spin opacity-20 transition-all duration-1000 delay-500"></div>
            <div className="absolute w-32 h-32 border-2 border-indigo-300 rounded-full animate-ping opacity-15 transition-all duration-1000 delay-700"></div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 transition-all duration-700 delay-600 leading-tight">
            Page Not Found
          </h3>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto transition-all duration-700 delay-700">
            The page you're looking for doesn't exist in our portal.
            Let's get you back on track.
          </p>

          {/* Sanskrit Shloka */}
          <div className="bg-gradient-to-r from-orange-50 via-blue-50 to-green-50 border border-orange-200/60 rounded-2xl p-6 mx-auto max-w-lg shadow-lg backdrop-blur-sm transition-all duration-700 delay-800 hover:shadow-xl hover:scale-105">
            <div className="text-center">
              <blockquote className="text-xl md:text-2xl font-bold text-gray-700 italic mb-3 text-orange-700 leading-relaxed">
                "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
              </blockquote>
              <cite className="text-sm md:text-base text-gray-500 font-medium">
                — May all be happy, may all be healthy
              </cite>
              <div className="mt-4 flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 via-white to-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            href="/"
            className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all duration-300"
          >
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300"
          >
            Go Back
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Need help? Contact support</p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@rashtriyaniidhi.gov.in"
              className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
            >
              support@rashtriyaniidhi.gov.in
            </a>
            <span className="text-gray-400">|</span>
            <a
              href="tel:1800-XXX-XXXX"
              className="text-green-600 hover:text-green-700 transition-colors text-sm"
            >
              📞 1800-XXX-XXXX
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © 2026 Rashtriya Nidhi Portal - Government of India - UjjwalS - All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}