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
  const [expandedCard, setExpandedCard] = useState(null);

  const cards = [
    {
      title: "Database Management",
      shortDesc: "Member registration & congregation management.",
      fullDesc:
        "Comprehensive member registration and congregation management system for tracking all YPG activities.",
      link: "https://ypgdatabasesystem.vercel.app/",
      linkText: "Access Database",
    },
    {
      title: "YPG Anthem",
      shortDesc: "To know His will, and to do it, this is the purpose of YPG.",
      fullDesc:
        "To know His will, and to do it, this is the purpose of YPG. God be our help, God bless our church under His banner may all youth unite. 2X\n\nRally round His banner its bids you one and all, with soul, with mind and body to serve the King of Kings, Join hands with YPG all youth within the church, to know His will and to do it. 2X",
      link: "#main-website",
      linkText: "Read Full Anthem",
    },
    {
      title: "Attendance System",
      shortDesc: "Real-time attendance tracking & reporting.",
      fullDesc:
        "Real-time attendance tracking with analytics and reporting to keep your congregation connected and engaged.",
      link: "https://ypg-markify.vercel.app/",
      linkText: "Open System",
    },
  ];

  return (
    <div className="relative z-10 -mt-24 sm:-mt-28 lg:-mt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card, index) => {
            const Icon = icons[card.title] || ArrowRight;
            const isExpanded = expandedCard === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setExpandedCard(index)}
                onMouseLeave={() => setExpandedCard(null)}
                className="bg-navy-950 border-t-3 border-gold-500 shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ borderTopWidth: "3px" }}
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-9 h-9 bg-gold-500/10 flex items-center justify-center flex-shrink-0 rounded">
                      <Icon className="w-4.5 h-4.5 text-gold-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-blue-100/70 text-xs leading-relaxed line-clamp-2">
                    {isExpanded ? (
                      card.fullDesc.split("\n").map((line, idx) => (
                        <span key={idx}>
                          {line}
                          {idx < card.fullDesc.split("\n").length - 1 && <br />}
                        </span>
                      ))
                    ) : (
                      card.shortDesc
                    )}
                  </p>

                  <motion.a
                    href={card.link}
                    target={card.link.startsWith("http") ? "_blank" : "_self"}
                    rel={card.link.startsWith("http") ? "noopener noreferrer" : ""}
                    className="inline-flex items-center text-gold-400 hover:text-gold-300 text-[11px] font-bold uppercase tracking-wide mt-3"
                    whileHover={{ x: 3 }}
                  >
                    {card.linkText}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
