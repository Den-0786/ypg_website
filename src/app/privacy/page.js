"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition mb-4"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-blue-100">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              1. Information We Collect
            </h2>
            <p className="text-gray-600 mb-6">
              We collect information you provide directly to us, such as when
              you contact us, register for events, or make donations. This may
              include your name, email address, phone number, and other contact
              information.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Send you updates about events and activities</li>
              <li>Process donations and registrations</li>
              <li>Respond to your inquiries and requests</li>
              <li>Improve our website and services</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              3. Information Sharing
            </h2>
            <p className="text-gray-600 mb-6">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties without your consent, except as
              described in this policy or as required by law.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              4. Data Security
            </h2>
            <p className="text-gray-600 mb-6">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              5. Cookies and Tracking
            </h2>
            <p className="text-gray-600 mb-6">
              Our website may use cookies and similar technologies to enhance
              your browsing experience and analyze website traffic.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              6. Your Rights
            </h2>
            <p className="text-gray-600 mb-6">
              You have the right to access, update, or delete your personal
              information. You may also opt out of receiving communications from
              us at any time.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              7. Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-6">
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>

            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">
                Contact Us
              </h3>
              <p className="text-blue-700">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <p className="text-blue-700 mt-2">
                Email: ahinsandistrictypg@gmail.com
                <br />
                Phone: +233 531427671
                <br />
                Address: PCG, Emmanuel Congregation Ahinsan - Kumasi P.O.Box AH 8224
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



