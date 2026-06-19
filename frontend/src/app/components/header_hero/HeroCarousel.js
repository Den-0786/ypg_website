"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      eyebrow: "Welcome to YPG",
      title: "Presbyterian Young Peoples' Guild",
      subtitle: "Ahinsan District",
      description:
        "Empowering young people aged 18-30 in faith, leadership, and community service. Join our vibrant community dedicated to spiritual growth and social impact.",
      cta: "Join Our Community",
      ctaLink: "#contact",
      bgImage: "/hero/youth.jpeg",
    },
    {
      eyebrow: "Our Tools",
      title: "Member Database System",
      subtitle: "Comprehensive Member Tracking",
      description:
        "Efficiently manage member registrations, track attendance, and generate detailed analytics for your congregation with our advanced database system.",
      cta: "Access Database",
      ctaLink: "https://ypgdatabasesystem.vercel.app/",
      bgImage: "/hero/database.jpeg",
    },
    {
      eyebrow: "Digital Solutions",
      title: "Attendance Tracking",
      subtitle: "Real-time Attendance Monitoring",
      description:
        "Streamlined attendance logging with instant reports and analytics to keep your congregation connected and engaged.",
      cta: "Open System",
      ctaLink: "https://ypg-markify.vercel.app/",
      bgImage: "/hero/attendance.jpeg",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section id="home" className="relative min-h-[600px] h-[85vh] md:h-screen bg-navy-950 overflow-hidden flex items-center">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-blue-950 to-navy-950 opacity-90" />

      {/* Diagonal gold slash decoration */}
      <div className="absolute top-0 right-[45%] w-1.5 h-full bg-gold-500 origin-top-left -skew-x-12 opacity-80 hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 bg-gold-500 text-navy-950 text-xs font-bold uppercase tracking-widest mb-6">
                  {slide.eyebrow}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-4">
                  {slide.title}
                </h1>
                <h2 className="text-xl md:text-2xl lg:text-3xl text-gold-300 font-bold mb-6">
                  {slide.subtitle}
                </h2>
                <p className="text-base md:text-lg text-blue-100 mb-8 leading-relaxed max-w-lg">
                  {slide.description}
                </p>
                <a
                  href={slide.ctaLink}
                  target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                  rel={slide.ctaLink.startsWith("http") ? "noopener noreferrer" : ""}
                  className="inline-flex items-center px-8 py-3.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-sm uppercase tracking-wide transition-colors duration-300"
                >
                  {slide.cta}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hero image with geometric cut */}
          <div className="hidden lg:block relative h-[400px] xl:h-[520px]">
            <div
              className="absolute inset-0 shadow-2xl"
              style={{
                clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
              }}
            >
              <Image
                src={slide.bgImage}
                alt={slide.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-navy-950/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-gold-500"
                : "w-3 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
