"use client";

import { useState, useEffect } from "react";
import HeroCarousel from "./components/header_hero/HeroCarousel";
import FeatureCards from "./components/header_hero/FeatureCards";
import NavigationBar from "./components/header_hero/NavigationBar";
import AboutSection from "./components/about/AboutSection";
import EventSection from "./components/events/UpcomingEvents";
import PastEvents from "./components/events/PastEvents";
import TeamSection from "./components/team/TeamSection";
import YStoreSection from "./components/store/YStore";
import TestimonialsSection from "./components/testimonials/Testimonials";
import MinistriesSection from "./components/ministries/Ministries";
import JoinUsSection from "./components/joinus/JoinUs";
import GallerySection from "./components/ygallery/YGallery";
import BlogSection from "./components/blog/BlogSection";
import ContactSection from "./components/contact/ContactSection";
import Footer from "./components/footer/Footer";
import DonateSection from "./components/donations/DonateSection";
import QuizList from "./components/quiz/QuizList";
import QuizResults from "./components/quiz/QuizResults";
import CongregationLeaderboard from "./components/quiz/CongregationLeaderboard";
import CongregationalExecutives from "./components/congregations/Congregations";
import CouncilSection from "./components/council/CouncilSection";
import PastExecutives from "./components/past-executives/PastExecutives";
import WelfareSection from "./components/welfare/WelfareSection";
import AdvertisementSection from "./components/advertisements/AdvertisementSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="pt-20">
        <HeroCarousel />
        <FeatureCards />
        <AboutSection />
        <EventSection />
        <PastEvents />
        <QuizList />
        <QuizResults />
        <CongregationLeaderboard />
        <TeamSection />
        <YStoreSection />
        <CongregationalExecutives />
        <TestimonialsSection />
        <PastExecutives />
        <MinistriesSection />
        <CouncilSection />
        <WelfareSection />
        <AdvertisementSection />
        <JoinUsSection />
        <GallerySection />
        <BlogSection />
        <DonateSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  );
}
