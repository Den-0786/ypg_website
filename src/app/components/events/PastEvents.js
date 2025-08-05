'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PastEvents() {
    const [pastEvents, setPastEvents] = useState([]);

    useEffect(() => {
        // Mock data with more details
        const sampleEvents = [
        {
            id: 1,
            title: '2023 National Youth Retreat',
            venue: 'Aburi Gardens',
            image: '/hero.jpg',
            start_date: '2023-08-01',
            end_date: '2023-08-03',
            attendees: 320,
            description: 'A transformative 3-day retreat focused on spiritual growth'
        },
        {
            id: 2,
            title: 'Youth Evangelism Outreach',
            venue: 'Kokobriko',
            image: '/rita.jpg',
            start_date: '2024-01-20',
            end_date: '2024-01-22',
            attendees: 450,
            description: 'City-wide evangelism campaign with worship concerts'
        },
        {
            id: 3,
            title: 'Annual Bible Quiz Competition',
            venue: 'Presby Church, Ahinsan',
            image: '/mission.jpg',
            start_date: '2024-03-15',
            end_date: '2024-03-15',
            attendees: 200,
            description: 'Inter-congregational Bible knowledge competition'
        },
        {
            id: 4,
            title: 'Leadership Training Workshop',
            venue: 'Presby Conference Center',
            image: '/hero/attendance.jpeg',
            start_date: '2024-04-05',
            end_date: '2024-04-07',
            attendees: 180,
            description: 'Developing the next generation of church leaders'
        },
        {
            id: 5,
            title: 'Youth Worship Night',
            venue: 'Emmanuel Congregation',
            image: '/hero/database.jpeg',
            start_date: '2024-05-10',
            end_date: '2024-05-10',
            attendees: 280,
            description: 'An evening of praise, worship, and spiritual renewal'
        },
        {
            id: 6,
            title: 'Community Service Day',
            venue: 'Local Community Centers',
            image: '/hero/youth.jpeg',
            start_date: '2024-06-15',
            end_date: '2024-06-15',
            attendees: 150,
            description: 'Youth-led community service and outreach activities'
        },
        ];
        console.log('Setting past events with images:', sampleEvents.map(e => e.image));
        setPastEvents(sampleEvents);
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <section id="past-events" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
            >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Past Events</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Relive the powerful moments from our recent events — spiritual retreats, 
                evangelism outreaches, and more.
            </p>
            </motion.div>

            <div className="relative">
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={'auto'}
                centeredSlides={true}
                loop={true}
                pagination={{ clickable: true }}
                breakpoints={{
                320: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    centeredSlides: true
                },
                640: {
                    slidesPerView: 1.2,
                    spaceBetween: 25,
                    centeredSlides: true
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                    centeredSlides: false
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                    centeredSlides: false
                },
                1280: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                    centeredSlides: false
                }
                }}
                className="pb-12"
            >
                {pastEvents.map((event) => (
                <SwiperSlide key={event.id} className="max-w-[360px]">
                    <motion.div
                    whileHover={{ y: -10 }}
                    className="h-full bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                    <div className="relative h-52 sm:h-48 w-full">
                        <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.error(`Failed to load image: ${event.image}`);
                            e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                            console.log(`Successfully loaded image: ${event.image}`);
                        }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                    
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.start_date)}{event.start_date !== event.end_date ? ` - ${formatDate(event.end_date)}` : ''}</span>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                        
                        <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.venue}</span>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-xs sm:text-sm leading-relaxed">{event.description}</p>
                        
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{event.attendees} attendees</span>
                        </div>
                    </div>
                    </motion.div>
                </SwiperSlide>
                ))}
            </Swiper>
            </div>

            <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mt-8"
            >
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md">
                View All Past Events
            </button>
            </motion.div>
        </div>
        </section>
    );
}