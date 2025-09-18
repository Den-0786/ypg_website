"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showFaqModal, setShowFaqModal] = useState(false);

  const faqs = [
    {
      question: "What is the Presbyterian Young People's Guild (YPG)?",
      answer:
        "The YPG is a youth ministry organization within the Presbyterian Church of Ghana that focuses on nurturing the spiritual, moral, and social growth of young people aged 18-30. We engage in activities that strengthen faith and equip members for leadership and service.",
    },
    {
      question: "Who can join the YPG?",
      answer:
        "The YPG is open to all young people between the ages of 18-30 who are members of the Presbyterian Church of Ghana. You don't need to be a member of a specific congregation to join - we welcome youth from all Presbyterian congregations in the Ahinsan District.",
    },
    {
      question: "How do I become a member?",
      answer:
        "To become a member, simply attend any of our weekly meetings, speak to a ministry leader, complete a simple registration form, and start attending practices or meetings. You can also register your interest through our website or contact us directly.",
    },
    {
      question: "What activities does the YPG organize?",
      answer:
        "We organize various activities including Bible studies, prayer sessions, evangelism outreaches, community service projects, leadership training, ministry programs (choir, drama, dance, media), social events, and spiritual retreats. We also participate in district and national YPG activities.",
    },
    {
      question: "When and where do you meet?",
      answer:
        "We meet weekly at various times and locations across the Ahinsan District. Each congregation has its own meeting schedule. For specific meeting times and locations, please contact your local congregation's YPG president or check our events calendar on the website.",
    },
    {
      question: "Is there a membership fee?",
      answer:
        "Yes, we have monthly dues that vary from congregation to congregation. Each local YPG sets their own monthly contribution amount based on their specific needs and circumstances. We also encourage voluntary contributions to support our activities and programs. Some specific events or activities may have additional fees to cover costs.",
    },
    {
      question: "What ministries are available?",
      answer:
        "We have several ministries including Y-Singers Choir, Y-Jama Troop (drama), Choreography (dance), Evangelism Team, and Media Ministry. Each ministry focuses on different aspects of service and allows members to develop their God-given talents.",
    },
    {
      question: "How can I get involved in leadership?",
      answer:
        "Leadership opportunities are available at both local congregation and district levels. We provide leadership training programs and encourage members to take on various roles. Speak to your local YPG president or district executives about available positions and requirements.",
    },
    {
      question: "What is the welfare program?",
      answer:
        "Our welfare program is a support system where members contribute monthly to create a fund that provides assistance to fellow guilders during difficult times. It includes medical assistance, educational support, emergency relief, and other forms of aid as needed.",
    },
    {
      question: "How can I contact the YPG?",
      answer:
        "You can contact us through our website, email us at ahinsandistrictypg@gmail.com, call us at +233 531427671, or visit us at PCG Emmanuel Congregation in Ahinsan, Kumasi. You can also reach out to your local congregation's YPG president.",
    },
    {
      question: "Do you have online activities?",
      answer:
        "Yes! We have online Bible studies, virtual prayer meetings, social media engagement, and digital content through our media ministry. We also use online platforms for announcements, event updates, and staying connected with members.",
    },
    {
      question: "What is the YPG's mission and vision?",
      answer:
        "Our mission is to nurture the spiritual, moral, and social growth of young people within the Presbyterian Church by engaging them in activities that strengthen their faith and equip them for leadership and service. Our vision is to raise a generation of spiritually grounded and socially responsible youth who actively contribute to the growth of the church and transformation of society.",
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowFaqModal(true)}
        className="hover:text-blue-200 transition"
      >
        FAQ
      </button>

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">?</span>
                    <h2 className="text-2xl font-bold">
                      Frequently Asked Questions
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowFaqModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
                <p className="text-blue-100 mt-2">
                  Find answers to common questions about the YPG
                </p>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenFaq(openFaq === index ? null : index)
                        }
                        className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-800 pr-4">
                          {faq.question}
                        </span>
                        {openFaq === index ? (
                          <span className="w-5 h-5 text-blue-600 flex-shrink-0">
                            ▲
                          </span>
                        ) : (
                          <span className="w-5 h-5 text-gray-400 flex-shrink-0">
                            ▼
                          </span>
                        )}
                      </button>
                      <AnimatePresence>
                        {openFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white text-gray-700 border-t border-gray-200">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Still have questions? We'd love to help!
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a
                      href="mailto:ahinsandistrictypg@gmail.com"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Email Us
                    </a>
                    <a
                      href="tel:+233531427671"
                      className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
