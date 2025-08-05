'use client';

import { motion } from 'framer-motion';

export default function FeatureCards() {
  const cards = [
    {
      icon: "🌐",
      title: "Main Website",
      description: "Discover the Presbyterian Young People's Guild community, events, and resources.",
      link: "#main-website",
      color: "bg-blue-500"
    },
    {
      icon: "📊",
      title: "Database Management",
      description: "Comprehensive member registration and congregation management system.",
      link: "#database",
      color: "bg-green-500"
    },
    {
      icon: "📝",
      title: "Attendance System",
      description: "Real-time attendance tracking with analytics and reporting.",
      link: "#attendance",
      color: "bg-purple-500"
    }
  ];
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardItem = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
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
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {card.description}
              </p>
              <motion.a
                href={card.link}
                whileHover={{ x: 5 }}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Learn More
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}