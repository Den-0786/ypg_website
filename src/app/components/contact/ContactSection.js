'use client'
import { Send, Phone, MessageSquare, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactSection() {
    return (
        <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
            >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Get in <span className="text-blue-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Have questions, suggestions, or want to join our group? We&apos;d love to hear from you!
            </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.form 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block mb-2 font-medium text-gray-700">Full Name</label>
                    <input 
                    type="text" 
                    placeholder="Your name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-medium text-gray-700">Email Address</label>
                    <input 
                    type="email" 
                    placeholder="you@example.com" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block mb-2 font-medium text-gray-700">Subject</label>
                    <input 
                    type="text" 
                    placeholder="Subject" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block mb-2 font-medium text-gray-700">Message</label>
                    <textarea 
                    rows="5" 
                    placeholder="Write your message here..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    ></textarea>
                </div>

                <div className="md:col-span-2">
                    <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md"
                    >
                    <Send size={18} /> Send Message
                    </motion.button>
                </div>
                </div>
            </motion.form>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-8"
            >
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h3>
                
                <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <MapPin size={20} />
                    </div>
                    <div>
                    <h4 className="font-semibold text-gray-800">Location</h4>
                    <p className="text-gray-600">Presbyterian Church Of Ghana, Ahinsan Kumasi</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <Phone size={20} />
                    </div>
                    <div>
                    <h4 className="font-semibold text-gray-800">Phone</h4>
                    <a 
                        href="tel:+233501234567" 
                        className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                        +233 50 123 4567
                    </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <MessageSquare size={20} />
                    </div>
                    <div>
                    <h4 className="font-semibold text-gray-800">WhatsApp</h4>
                    <a 
                        href="https://wa.me/233501234567" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition"
                    >
                        <MessageSquare size={16} /> Chat Now
                    </a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <Mail size={20} />
                    </div>
                    <div>
                    <h4 className="font-semibold text-gray-800">Email</h4>
                    <a 
                        href="mailto:ypg@example.com" 
                        className="text-blue-600 hover:underline"
                    >
                        ypg@example.com
                    </a>
                    </div>
                </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Connect With Us</h4>
                <div className="flex gap-4">
                    <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    </a>
                    <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    </a>
                    <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    </a>
                </div>
                </div>
            </motion.div>
            </div>
        </div>
        </section>
    );
}