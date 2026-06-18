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
        <section id="about" className="bg-white py-12 px-4 md:px-12 lg:px-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            About Young People&apos;s Guild (YPG)
        </h2>

        {/* Combined Mission & Vision Container */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-4 border-yellow-700 rounded-2xl p-4 mb-10 shadow-lg"
        >
            <div className="flex flex-col lg:flex-row gap-8">
            {/* Mission Card (Left) */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="lg:w-1/2 lg:pr-8 border-2 border-blue-50 rounded-2xl "
            >
                <div className="flex flex-col items-center gap-8">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-blue-200">
                    <Image
                    src={missionImage}
                    alt="Mission"
                    fill
                    className="object-cover object-top"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectPosition: 'center top' }}
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4 text-blue-800">Our Mission</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                    {missionText}
                    </p>
                </div>
                </div>
            </motion.div>

            {/* Vision Card (Right) */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="lg:w-1/2 lg:pl-8 border-2 border-blue-50 rounded-2xl"
            >
                <div className="flex flex-col items-center gap-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4 text-blue-800">Our Vision</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                    {visionText}
                    </p>
                </div>
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-blue-200">
                    <Image
                    src={visionImage}
                    alt="Vision"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                </div>
            </motion.div>
            </div>
        </motion.div>

        {/* Bottom Row - Motto & Theme */}
        <div className="flex flex-col md:flex-row gap-6">

            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 border-2 border-yellow-700 rounded-xl p-6 bg-blue-50 text-center shadow-md"
            >
            <h3 className="text-xl font-bold mb-2 text-gray-800">Our Motto</h3>
            <p className="text-lg italic text-blue-900">{motto}</p>
            </motion.div>


            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1 border-2 border-yellow-700 rounded-xl p-6 bg-green-50 text-center shadow-md"
            >
            <h3 className="text-xl font-bold mb-2 text-gray-800">{themeTitle}</h3>
            <p className="text-lg text-green-900">
                {themeText}
            </p>
            </motion.div>
        </div>
        </section>
    );
}