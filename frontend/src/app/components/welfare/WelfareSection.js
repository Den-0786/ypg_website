"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Heart,
  Users,
  Shield,
  FileText,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

export default function WelfareSection() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const welfareCommittee = [
    {
      name: "Sarah Addo",
      position: "Welfare Coordinator",
      phone: "+233 24 123 4567",
      email: "welfare@ahinsanypg.com",
      image: "/placeholder-team.jpg",
    },
    {
      name: "Kwame Mensah",
      position: "Assistant Coordinator",
      phone: "+233 20 987 6543",
      email: "assistant@ahinsanypg.com",
      image: "/placeholder-team.jpg",
    },
    {
      name: "Grace Osei",
      position: "Treasurer",
      phone: "+233 26 456 7890",
      email: "treasurer@ahinsanypg.com",
      image: "/placeholder-team.jpg",
    },
  ];

  const faqs = [
    {
      question: "What is the YPG Welfare Program?",
      answer:
        "The YPG Welfare Program is a support system designed to help guilders in times of need. It's a community-based initiative where members contribute monthly to create a fund that provides assistance to fellow guilders during difficult times.",
    },
    {
      question: "Who can join the welfare program?",
      answer:
        "All active guilders of the Ahinsan District YPG are eligible to join the welfare program. You must be a registered member of your congregation's YPG to participate.",
    },
    {
      question: "How much is the monthly contribution?",
      answer:
        "The monthly contribution amount is set by the welfare committee and may vary. Please contact your branch representative for the current contribution amount and payment schedule.",
    },
    {
      question: "How do I register for the welfare program?",
      answer:
        "To register, simply contact your congregation's guild representative or YPG president. They will provide you with the registration form and guide you through the process.",
    },
    {
      question: "What types of support does the welfare provide?",
      answer:
        "The welfare program provides various forms of support including medical assistance, educational support, emergency relief, and other forms of aid as determined by the welfare committee based on individual circumstances.",
    },
    {
      question: "How do I apply for welfare support when needed?",
      answer:
        "When you need support, contact any member of the welfare committee directly. They will guide you through the application process and assess your situation appropriately.",
    },
    {
      question: "Is my contribution secure and properly managed?",
      answer:
        "Yes, all contributions are properly managed by the welfare committee. You will receive a receipt for every payment, and the funds are handled with transparency and accountability.",
    },
    {
      question: "Can I see how the welfare funds are being used?",
      answer:
        "While we don't display financial details publicly, you can see examples of how the welfare program has helped guilders through photos and videos in our gallery section.",
    },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Community Support",
      description:
        "Be part of a caring community that supports each other in times of need",
    },
    {
      icon: Shield,
      title: "Financial Security",
      description:
        "Access to emergency funds when you or your family face difficult situations",
    },
    {
      icon: Users,
      title: "Network of Care",
      description:
        "Connect with fellow guilders who understand and support your journey",
    },
    {
      icon: FileText,
      title: "Transparent Process",
      description:
        "Clear guidelines and proper documentation for all welfare activities",
    },
  ];

  return (
    <section
      id="welfare"
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-transparent to-purple-100/20"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            YPG Welfare Program
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Supporting each other in faith and fellowship. Join our welfare
            program to be part of a caring community that stands together in
            times of need.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Registration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 mb-20 text-white"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Become part of our welfare community and experience the power of
              collective support.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 className="text-xl font-semibold mb-4">How to Register</h4>
              <p className="text-blue-100 mb-4">
                For registration, contact your congregation guild representative
                or YPG president in your congregation for full details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-blue-100">
                  <FileText className="w-5 h-5" />
                  <span>Simple registration form</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Shield className="w-5 h-5" />
                  <span>Monthly contributions</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <Users className="w-5 h-5" />
                  <span>Community support</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Welfare Committee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Welfare Committee
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Meet our dedicated team of leaders who manage the welfare program
              with care and transparency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {welfareCommittee.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {member.name}
                  </h4>
                  <p className="text-blue-600 font-medium mb-4">
                    {member.position}
                  </p>
                  <div className="space-y-2">
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{member.phone}</span>
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{member.email}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about the YPG Welfare Program.
            </p>
            <button
              onClick={() => setShowFaqModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ChevronDown className="w-5 h-5" />
              View All Questions
            </button>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Need More Information?</h3>
            <p className="text-blue-100 mb-6">
              Contact any member of our welfare committee or your branch
              representative for detailed information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition"
              >
                Contact Us
              </a>
              <a
                href="#gallery"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transition"
              >
                View Gallery
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FAQ Modal */}
      <AnimatePresence>
        {showFaqModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFaqModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-blue-100 mt-1">
                      Everything you need to know about the YPG Welfare Program
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFaqModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === index ? null : index)
                        }
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition"
                      >
                        <h4 className="text-lg font-semibold text-gray-800 pr-4">
                          {faq.question}
                        </h4>
                        {openFaq === index ? (
                          <ChevronUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6"
                        >
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Still have questions? Contact our welfare committee for more
                    information.
                  </p>
                  <button
                    onClick={() => setShowFaqModal(false)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
