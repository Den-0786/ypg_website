'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getBaseUrl } from '../../../utils/baseUrl';

export default function AboutSection() {
    const [visionMission, setVisionMission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisionMission = async () => {
            try {
                const baseUrl = getBaseUrl();
                const response = await fetch(`${baseUrl}/api/vision-mission/`);
                const data = await response.json();
                if (data.success) {
                    setVisionMission(data.data);
                }
            } catch (error) {
                console.error('Error fetching vision/mission:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisionMission();
    }, []);

    // Default values if API fails
    const missionText = visionMission?.mission_text || "To nurture the spiritual, moral, and social growth of young people within the Presbyterian Church by engaging them in activities that strengthen their faith and equip them for leadership and service.";
    const visionText = visionMission?.vision_text || "To raise a generation of spiritually grounded and socially responsible youth who actively contribute to the growth of the church and the transformation of society.";
    const motto = visionMission?.motto || "YPG! Service All The Way, You! Practice Godliness";
    const themeTitle = visionMission?.theme_title || "2025 Theme";
    const themeText = visionMission?.theme_text || "Celebrating our Heritage, Persisting in Mission, Embracing our Missionary Legacy as Youth (Colossians 1:58)";
    const missionImage = visionMission?.mission_image_url || "/mission-vision/pres.jpg";
    const visionImage = visionMission?.vision_image_url || "/mission-vision/priscy.jpg";

    return (
        <section id="about" className="bg-gray-50 py-20 lg:py-28 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <span className="inline-block text-gold-500 font-bold uppercase tracking-widest text-sm mb-3">
                        Who We Are
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-navy-950">
                        About Young Peoples&apos; Guild (YPG)
                    </h2>
                </motion.div>

                {/* Row 1: Image Left, Text Right */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-xl shadow-lg overflow-hidden mb-12"
                >
                    <div className="relative h-72 lg:h-auto min-h-[300px]">
                        <Image
                            src={missionImage}
                            alt="Mission"
                            fill
                            className="object-cover object-top"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                    <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-navy-950 mb-4">Our Mission</h3>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                            {missionText}
                        </p>
                        <div className="border-l-4 border-gold-500 pl-4">
                            <p className="text-navy-950 font-semibold italic">&ldquo;{motto}&rdquo;</p>
                        </div>
                    </div>
                </motion.div>

                {/* Row 2: Text Left, Image Right */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-xl shadow-lg overflow-hidden mb-12"
                >
                    <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-navy-950 mb-4">Our Vision</h3>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-6">
                            {visionText}
                        </p>
                        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-bold text-gold-600 uppercase tracking-wide mb-1">{themeTitle}</h4>
                            <p className="text-navy-950 font-medium text-sm">{themeText}</p>
                        </div>
                    </div>
                    <div className="relative h-72 lg:h-auto min-h-[300px] order-1 lg:order-2">
                        <Image
                            src={visionImage}
                            alt="Vision"
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}