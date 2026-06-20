"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Database, Music, Users, ArrowRight } from "lucide-react";

const icons = {
  "Database Management": Database,
  "YPG Anthem": Music,
  "Attendance System": Users,
};

export default function FeatureCards() {
  const [isAnthemExpanded, setIsAnthemExpanded] = useState(false);

  const cards = [
    {
      title: "Database Management",
      description:
        "Comprehensive member registration and congregation management system.",
      link: "https://ypgdatabasesystem.vercel.app/",
    },
    {
      title: "YPG Anthem",
      description:
        "To know His will, and to do it, this is the purpose of YPG. God be our help, God bless our church under His banner may all youth unite. 2X",
      fullDescription:
        "To know His will, and to do it, this is the purpose of YPG. God be our help, God bless our church under His banner may all youth unite.2X\n\nRally round His banner its bids you one and all, with soul, with mind and body to serve the King of Kings, Join hands with YPG all youth within the church, to know His will and to do it. 2X",
      link: "#main-website",
    },
    {
      title: "Attendance System",
      description:
        "Real-time attendance tracking with analytics and reporting.",
      link: "https://ypg-markify.vercel.app/",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardItem = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <span className="inline-block text-gold-600 font-bold uppercase tracking-widest text-sm mb-2">
            What We Are Offering
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-navy-950">
            To Our Community
          </h2>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-6 md:overflow-visible pb-4"
        >
          {cards.map((card, index) => {
            const Icon = icons[card.title] || ArrowRight;
            return (
              <motion.div
                key={index}
                variants={cardItem}
                whileHover={{ y: -8 }}
                className="bg-navy-950 p-6 sm:p-8 min-w-full snap-start md:min-w-0 border-t-4 border-gold-500 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gold-500/10 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-gold-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-blue-100/80 text-sm leading-relaxed mb-5">
                  {card.title === "YPG Anthem" && isAnthemExpanded
                    ? card.fullDescription.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx < card.fullDescription.split("\n").length - 1 && <br />}
                        </span>
                      ))
                    : card.description}
                </p>
                {card.title === "YPG Anthem" ? (
                  <button
                    onClick={() => setIsAnthemExpanded(!isAnthemExpanded)}
                    className="inline-flex items-center text-gold-400 hover:text-gold-300 text-sm font-bold uppercase tracking-wide"
                  >
                    {isAnthemExpanded ? "Read Less" : "Read More"}
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform ${
                        isAnthemExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                ) : card.title !== "Main Website" ? (
                  <motion.a
                    href={card.link}
                    target={card.link.startsWith("http") ? "_blank" : "_self"}
                    rel={card.link.startsWith("http") ? "noopener noreferrer" : ""}
                    whileHover={{ x: 5 }}
                    className="inline-flex items-center text-gold-400 hover:text-gold-300 text-sm font-bold uppercase tracking-wide"
                  >
                    {card.title === "Database Management"
                      ? "Access Database"
                      : card.title === "Attendance System"
                        ? "Open System"
                        : "Learn More"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.a>
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
