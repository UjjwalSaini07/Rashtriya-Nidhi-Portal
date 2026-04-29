'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <img
            src="/RnpLogo.png"
            alt="Rashtriya Nidhi Portal"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Rashtriya Nidhi Portal
          </h1>
          <p className="text-gray-600">Government of India</p>
        </div>

        <div className="mb-8">
          <h2 className="text-8xl font-bold text-gray-300 mb-4">
            404
          </h2>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Page Not Found
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            The page you're looking for doesn't exist in our portal.
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200/50 rounded-xl p-4 mx-auto max-w-md shadow-md">
            <blockquote className="text-base font-semibold text-gray-700 italic mb-1">
              "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
            </blockquote>
            <cite className="text-xs text-gray-500">
              — May all be happy, may all be healthy
            </cite>
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
              📧 support@rashtriyaniidhi.gov.in
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
            © 2026 Rashtriya Nidhi Portal - Government of India
          </p>
        </div>
      </div>
    </div>
  );
}