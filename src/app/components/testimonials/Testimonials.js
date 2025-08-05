/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

const testimonials = [
    {
        name: 'Martha Owusu',
        role: 'YPG President, Bethel Congregation',
        image: '/rita.jpg',
        quote: "Joining the youth group helped me grow spiritually and find a second family. I'm proud to serve and make a difference.",
        highlight: "Second family"
    },
    {
        name: 'Kwame Asare',
        role: 'Member, Emmanuel Congregation',
        image: '/mission-vision/pres.jpg',
        quote: "The events, teachings, and friendships I've built here have shaped my life. I encourage everyone to join.",
        highlight: "Shaped my life"
    },
    {
        name: 'Grace Mensah',
        role: 'Choir Lead, Zion Congregation',
        image: '/mission-vision/priscy.jpg',
        quote: "Every youth deserves a place like this — full of love, leadership, and purpose. God bless the movement!",
        highlight: "Love & purpose"
    },
];

export default function TestimonialsSection() {
    const [showContactModal, setShowContactModal] = useState(false);

    return (
        <section id="testimonials" className="relative py-24 px-4 md:px-8 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-blue-400 mix-blend-multiply filter blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-purple-400 mix-blend-multiply filter blur-xl"></div>
            </div>
            
            <div className="max-w-6xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Real Stories, <span className="text-blue-600">Real Impact</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Hear from youth just like you about their experiences in our community
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <img
                                        src={t.image}
                                        alt={t.name}
                                        className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-md"
                                    />
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-900">{t.name}</h4>
                                        <p className="text-sm text-blue-600">{t.role}</p>
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <span className="absolute top-0 left-0 text-4xl text-blue-100 font-serif">&quot;</span>
                                    <p className="pl-6 text-gray-700 relative z-10">
                                        {t.quote.split(t.highlight).map((part, i) => (
                                            <span key={i}>
                                                {part}
                                                {i === 0 && <span className="font-bold text-blue-600">{t.highlight}</span>}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                                
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="flex space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <div className="text-blue-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 15l5.19-5.19a2 2 0 0 0 0-2.82l-5.19-5.19a2 2 0 0 0-2.83 0l-5.2 5.19a2 2 0 0 0 0 2.82l5.19 5.19a2 2 0 0 0 2.83 0z"></path>
                                            <path d="M14 9l5.19-5.19a2 2 0 0 0 0-2.82l-5.19-5.19a2 2 0 0 0-2.83 0l-5.2 5.19a2 2 0 0 0 0 2.82l5.19 5.19a2 2 0 0 0 2.83 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                <div className="mt-16 text-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all"
                        onClick={() => setShowContactModal(true)}
                    >
                        Share Your Story
                    </motion.button>
                </div>
                
                {/* Contact Modal */}
                <Transition.Root show={showContactModal} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={setShowContactModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                        </Transition.Child>
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                                            Share Your Testimonial
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-gray-600 mb-4">
                                                We&apos;d love to hear your story! Please contact our admin team to share your testimony.
                                            </p>
                                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                                <h4 className="font-bold text-gray-900 mb-2">Contact Information:</h4>
                                                <p className="text-gray-700">Email: <a href="mailto:youth@presbyterian.org" className="text-blue-600 hover:underline">youth@presbyterian.org</a></p>
                                                <p className="text-gray-700">Phone: +1 (555) 123-4567</p>
                                            </div>
                                            <p className="text-gray-600">
                                                When contacting us, please include:
                                            </p>
                                            <ul className="list-disc list-inside text-gray-600 mt-2 ml-4">
                                                <li>Your full name</li>
                                                <li>Your congregation</li>
                                                <li>Your testimony</li>
                                                <li>A photo (optional)</li>
                                            </ul>
                                        </div>
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                onClick={() => setShowContactModal(false)}
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            </div>
        </section>
    );
}