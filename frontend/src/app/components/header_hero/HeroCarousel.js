"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Presbyterian Young People's Guild",
      subtitle: "Ahinsan District",
      description:
        "Empowering young people aged 18-30 in faith, leadership, and community service. Join our vibrant community dedicated to spiritual growth and social impact.",
      bgImage: "/hero/youth.jpeg",
      overlayColor: "bg-blue-600/40",
    },
    {
      title: "Database Management System",
      subtitle: "Comprehensive Member Tracking",
      description:
        "Efficiently manage member registrations, track attendance, and generate detailed analytics for your congregation with our advanced database system.",
      bgImage: "/hero/database.jpeg",
      overlayColor: "bg-green-600/40",
    },
    {
      title: "Attendance Taker Website",
      subtitle: "Real-time Attendance Monitoring",
      description:
        "Streamlined attendance logging with instant reports and analytics to keep your congregation connected and engaged.",
      bgImage: "/hero/attendance.jpeg",
      overlayColor: "bg-purple-600/40",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div id="home" className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="h-full flex items-center relative"
            style={{
              backgroundImage: `url(${slide.bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className={`absolute inset-0 ${slide.overlayColor}`}></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start -mt-16 sm:pt-4 lg:items-center lg:pt-0">
                <div className="text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg mb-8 text-blue-50 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
