"use client";

import { motion } from "framer-motion";

export default function FeatureCards() {
  const cards = [
    {
      title: "Main Website",
      description:
        "Discover the Presbyterian Young People's Guild community, events, and resources.",
      link: "#main-website",
    },
    {
      title: "Database Management",
      description:
        "Comprehensive member registration and congregation management system.",
      link: "https://ypgdatabasesystem.vercel.app/",
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
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
                {card.description}
              </p>
              {card.title !== "Main Website" && (
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
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
