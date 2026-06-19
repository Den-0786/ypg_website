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
        <section id="about" className="bg-navy-950 py-20 lg:py-28 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                        About Young Peoples&apos; Guild (YPG)
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Mission Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        whileHover={{ y: -6 }}
                        className="bg-navy-900 border-t-4 border-gold-500 p-6 sm:p-8 shadow-xl transition-all duration-300"
                    >
                        <div className="relative h-64 mb-6 overflow-hidden border border-gold-500/30">
                            <Image
                                src={missionImage}
                                alt="Mission"
                                fill
                                className="object-cover object-top"
                                style={{ objectPosition: 'center top' }}
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {missionText}
                        </p>
                    </motion.div>

                    {/* Vision Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        whileHover={{ y: -6 }}
                        className="bg-navy-900 border-t-4 border-gold-500 p-6 sm:p-8 shadow-xl transition-all duration-300"
                    >
                        <div className="relative h-64 mb-6 overflow-hidden border border-gold-500/30">
                            <Image
                                src={visionImage}
                                alt="Vision"
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {visionText}
                        </p>
                    </motion.div>
                </div>

                {/* Motto & Theme */}
                <div className="grid md:grid-cols-2 gap-6 mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-gold-500 p-6 text-center shadow-md"
                    >
                        <h3 className="text-xl font-bold text-navy-950 mb-2">Our Motto</h3>
                        <p className="text-lg font-semibold text-navy-950">{motto}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-navy-900 border-2 border-gold-500 p-6 text-center shadow-md"
                    >
                        <h3 className="text-xl font-bold text-gold-500 mb-2">{themeTitle}</h3>
                        <p className="text-lg text-white">{themeText}</p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}