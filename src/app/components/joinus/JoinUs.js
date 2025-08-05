'use client';

import { motion } from 'framer-motion';

export default function JoinUsSection() {
    return (
        <section id="join" className="relative py-20 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
            >
                <span className="text-sm font-semibold tracking-wider text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full uppercase">
                Your Journey Starts Here
                </span>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
            >
                Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Youth Fellowship</span>
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
                Be part of a vibrant community where faith meets friendship, purpose meets passion, and growth happens together.
            </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
                {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                ),
                title: "Vibrant Community",
                description: "Connect with passionate young believers who'll become your spiritual family and lifelong friends.",
                color: "bg-blue-100 text-blue-600"
                },
                {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                ),
                title: "Spiritual Growth",
                description: "Deepen your faith through Bible studies, prayer sessions, and transformative teachings.",
                color: "bg-purple-100 text-purple-600"
                },
                {
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                ),
                title: "Purposeful Service",
                description: "Discover your gifts and make an impact through meaningful ministries and outreach programs.",
                color: "bg-indigo-100 text-indigo-600"
                }
            ].map((item, index) => (
                <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
                >
                <div className="p-6">
                    <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                    {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                </div>
                </motion.div>
            ))}
            </div>

            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-16"
            >
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
                >
                <a
                    href="#contact"
                    className="relative inline-flex items-center justify-center overflow-hidden group"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"></span>
                    <span className="relative flex items-center px-8 py-3.5 text-white font-medium rounded-full group-hover:bg-opacity-0 transition-all duration-300">
                    Become a Member
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    </span>
                </a>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-500 text-sm mt-6"
            >
                Open to all youth between the ages of 18-30. - just make the heart ready to grow!
            </motion.p>
            </motion.div>
        </div>
        </section>
    );
}