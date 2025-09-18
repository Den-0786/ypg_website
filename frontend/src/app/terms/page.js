"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-blue-100">Last updated: {new Date().toLocaleDateString()}</p>
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
            <h2 className="text-3xl font-bold text-gray-800 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using the Ahinsan District YPG website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">2. Use License</h2>
            <p className="text-gray-600 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on Ahinsan District YPG&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">3. Disclaimer</h2>
            <p className="text-gray-600 mb-6">
              The materials on Ahinsan District YPG&apos;s website are provided on an &apos;as is&apos; basis. Ahinsan District YPG makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">4. Limitations</h2>
            <p className="text-gray-600 mb-6">
              In no event shall Ahinsan District YPG or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if Ahinsan District YPG or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">5. Accuracy of Materials</h2>
            <p className="text-gray-600 mb-6">
              The materials appearing on Ahinsan District YPG&apos;s website could include technical, typographical, or photographic errors. Ahinsan District YPG does not warrant that any of the materials on its website are accurate, complete, or current. Ahinsan District YPG may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">6. Links</h2>
            <p className="text-gray-600 mb-6">
              Ahinsan District YPG has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Ahinsan District YPG of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">7. Modifications</h2>
            <p className="text-gray-600 mb-6">
              Ahinsan District YPG may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
            </p>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">8. Governing Law</h2>
            <p className="text-gray-600 mb-6">
              These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-3">Contact Information</h3>
              <p className="text-blue-700">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-blue-700 mt-2">
                Email: ahinsandistrictypg@gmail.com<br />
                Phone: +233 531427671<br />
                Address: PCG, Emmanuel Congregation Ahinsan - Kumasi P.O Box AH 8224
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}








