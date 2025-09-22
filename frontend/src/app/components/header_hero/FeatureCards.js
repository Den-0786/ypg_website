"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
    <div className="relative -mt-24 px-4 sm:px-6 z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start"
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={cardItem}
              whileHover={{ y: -10 }}
              className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 p-3 sm:p-6 border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {card.title === "YPG Anthem" && isAnthemExpanded
                  ? card.fullDescription.split("\n").map((line, index) => (
                      <span key={index}>
                        {line}
                        {index <
                          card.fullDescription.split("\n").length - 1 && <br />}
                      </span>
                    ))
                  : card.description}
              </p>
              {card.title === "YPG Anthem" ? (
                <button
                  onClick={() => setIsAnthemExpanded(!isAnthemExpanded)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
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
                  rel={
                    card.link.startsWith("http") ? "noopener noreferrer" : ""
                  }
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {card.title === "Database Management"
                    ? "Access Database"
                    : card.title === "Attendance System"
                      ? "Open System"
                      : "Learn More"}
                </motion.a>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
