/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Youtube, Music, Download } from 'lucide-react';

const galleryImages = [
    // General/District Images
    { src: '/hero.jpg', caption: 'Our talented and gifted youth leaders from across the district' },
    { src: '/mission.jpg', caption: 'District youth fellowship gathering - united in faith' },
    { src: '/hero/youth.jpeg', caption: 'Annual youth camp participants - growing together' },
    { src: '/hero/attendance.jpeg', caption: 'Youth choir performance - praising with one voice' },
    { src: '/hero/database.jpeg', caption: 'Youth Sunday service - serving with dedication' },
    { src: '/mission-vision/pres.jpg', caption: 'Bible study session - deepening our knowledge' },
    { src: '/mission-vision/priscy.jpg', caption: 'Praise and worship night - lifting voices in harmony' },
    { src: '/jy.jpeg', caption: 'Youth leaders conference - building tomorrow\'s leaders' },
    
    // Emmanuel Congregation
    { src: '/cloth and hymn.jpeg', caption: 'Meet our guilders from Emmanuel Congregation Ahinsan' },
    { src: '/style.jpeg', caption: 'Youth Sunday service at Emmanuel Congregation' },
    { src: '/images.jpeg', caption: 'Emmanuel choir practice - voices of praise' },
    
    // Peniel Congregation
    { src: '/images (1).jpeg', caption: 'Meet our guilders from Peniel Congregation Esreso No1' },
    { src: '/t-shirt.jpeg', caption: 'Peniel youth Bible study - growing in wisdom' },
    
    // Christ Congregation
    { src: '/rita.jpg', caption: 'Meet our guilders from Christ Congregation Ahinsan Estate' },
    { src: '/figma.png', caption: 'Christ congregation youth outing - fellowship in action' },
    
    // Mizpah Congregation
    { src: '/hero.jpg', caption: 'Meet our guilders from Mizpah Congregation Odagya No1' },
    { src: '/mission.jpg', caption: 'Mizpah youth evangelism - spreading the gospel' },
    
    // Ebenezer Congregation
    { src: '/hero/youth.jpeg', caption: 'Meet our guilders from Ebenezer Congregation Dompaose Aprabo' },
    { src: '/hero/attendance.jpeg', caption: 'Ebenezer youth choir - melodies of worship' },
    
    // Favour Congregation
    { src: '/hero/database.jpeg', caption: 'Meet our guilders from Favour Congregation Esreso No2' },
    { src: '/mission-vision/pres.jpg', caption: 'Favour youth prayer meeting - seeking God\'s face' },
    
    // Liberty Congregation
    { src: '/mission-vision/priscy.jpg', caption: 'Meet our guilders from Liberty Congregation High Tension' },
    { src: '/jy.jpeg', caption: 'Liberty youth fellowship - freedom in Christ' },
    
    // NOM Congregation
    { src: '/cloth and hymn.jpeg', caption: 'Meet our guilders from NOM Congregation' },
    { src: '/style.jpeg', caption: 'NOM youth activities - serving with passion' },
    
    // Odagya No2 Congregation
    { src: '/images.jpeg', caption: 'Meet our guilders from Odagya No2 Congregation' },
    { src: '/images (1).jpeg', caption: 'Odagya No2 youth service - community in worship' },
    
    // Kokobriko Congregation
    { src: '/t-shirt.jpeg', caption: 'Meet our guilders from Kokobriko Congregation' },
    { src: '/rita.jpg', caption: 'Kokobriko youth meeting - building relationships' },
    
    // Reason Congregation
    { src: '/figma.png', caption: 'Meet our guilders from Reason Congregation' },
    { src: '/hero.jpg', caption: 'Reason youth program - purposeful ministry' },
];

const videos = [
        { 
        src: '/videos/camp2023.mp4', 
        thumbnail: '/video-thumbnails/camp2023.jpg',
        title: 'Youth Camp 2023 Highlights',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=camp2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456789' }
        ]
        },
        { 
        src: '/videos/conference.mp4', 
        thumbnail: '/video-thumbnails/conference.jpg',
        title: 'Annual Youth Conference',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=conference2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456790' }
        ]
        },
        { 
        src: '/videos/choir.mp4', 
        thumbnail: '/video-thumbnails/choir.jpg',
        title: 'Mass Choir Performance',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=masschoir' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456791' }
        ]
        },
        { 
        src: '/videos/outreach.mp4', 
        thumbnail: '/video-thumbnails/outreach.jpg',
        title: 'Community Outreach Program',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=outreach2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456792' }
        ]
    },
    { 
        src: '/videos/prayer.mp4', 
        thumbnail: '/video-thumbnails/prayer.jpg',
        title: 'Youth Prayer Meeting',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=prayer2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456793' }
        ]
    },
    { 
        src: '/videos/bible-study.mp4', 
        thumbnail: '/video-thumbnails/bible-study.jpg',
        title: 'Bible Study Session',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=biblestudy2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456794' }
        ]
    },
    { 
        src: '/videos/evangelism.mp4', 
        thumbnail: '/video-thumbnails/evangelism.jpg',
        title: 'Street Evangelism',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=evangelism2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456795' }
        ]
    },
    { 
        src: '/videos/fellowship.mp4', 
        thumbnail: '/video-thumbnails/fellowship.jpg',
        title: 'Youth Fellowship Night',
        links: [
            { platform: 'youtube', url: 'https://youtube.com/watch?v=fellowship2023' },
            { platform: 'tiktok', url: 'https://tiktok.com/@ypg/video/723456796' }
        ]
    }
];

    export default function GallerySection() {
    const [contentType, setContentType] = useState('photos');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const visibleCount = 4;

    const getCurrentContent = () => {
        return contentType === 'photos' ? galleryImages : videos;
    };

    const currentContent = getCurrentContent();

    const next = () => {
        setCurrentIndex(prev => (prev + visibleCount >= currentContent.length ? 0 : prev + visibleCount));
    };

    const prev = () => {
        setCurrentIndex(prev => (prev - visibleCount < 0 ? currentContent.length - visibleCount : prev - visibleCount));
    };

    const visibleItems = currentContent.slice(currentIndex, currentIndex + visibleCount);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(() => {
            next();
        }, 5000); // Change slides every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, currentIndex, currentContent.length]);

    const handleDownload = (item) => {
        const link = document.createElement('a');
        link.href = contentType === 'photos' ? item.src : item.src;
        link.download = contentType === 'photos' ? `gallery-${item.caption?.replace(/[^a-zA-Z0-9]/g, '-')}.jpg` : `${item.title?.replace(/[^a-zA-Z0-9]/g, '-')}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section id="gallery" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-800">Our Gallery</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
                Explore moments from our fellowship, congregations, and events
            </p>
            </div>

            <div className="flex justify-center mb-8 gap-4">
            <button
                onClick={() => {
                setContentType('photos');
                setCurrentIndex(0);
                }}
                className={`px-6 py-2 rounded-full ${contentType === 'photos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} shadow-md transition`}
            >
                Pictures
            </button>
            <button
                onClick={() => {
                setContentType('videos');
                setCurrentIndex(0);
                }}
                className={`px-6 py-2 rounded-full ${contentType === 'videos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} shadow-md transition`}
            >
                Videos
            </button>
            </div>

            <div className="relative">
            <div className="flex justify-between items-center mb-4">
                <button
                            onClick={() => {
                                prev();
                                setIsAutoPlaying(false);
                            }}
                className="p-2 bg-white border rounded-full shadow hover:bg-blue-100 transition"
                aria-label="Previous"
                >
                <ChevronLeft size={24} />
                </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                className={`px-3 py-1 text-xs rounded ${isAutoPlaying ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}
                            >
                                {isAutoPlaying ? 'Pause' : 'Play'}
                            </button>
                        </div>

                <button
                            onClick={() => {
                                next();
                                setIsAutoPlaying(false);
                            }}
                className="p-2 bg-white border rounded-full shadow hover:bg-blue-100 transition"
                aria-label="Next"
                >
                <ChevronRight size={24} />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleItems.map((item, index) => (
                <motion.div
                                key={`${contentType}-${currentIndex}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="rounded-lg overflow-hidden shadow-md bg-white group"
                >
                                <div className="relative h-64">
                    <Image
                                        src={contentType === 'photos' ? item.src : item.thumbnail}
                                        alt={contentType === 'photos' ? item.caption : item.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw"
                        loading="lazy"
                    />
                                    
                    {contentType === 'videos' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition">
                        <Play size={48} className="text-white" />
                        </div>
                    )}
                                    
                                    {/* Download button */}
                                    <button
                                        onClick={() => handleDownload(item)}
                                        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                                        title="Download"
                                    >
                                        <Download size={16} className="text-gray-700" />
                                    </button>
                                    
                                    {/* Gradient overlay for better text visibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    
                                    {/* Text overlay positioned at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                                            <p className="text-gray-800 text-xs font-medium leading-tight">
                                                {contentType === 'photos' ? item.caption : item.title}
                                            </p>
                                        </div>
                                    </div>
                    </div>
                                
                    {contentType === 'videos' && item.links && (
                                    <div className="p-3">
                        <div className="flex gap-2 mt-2">
                        {item.links.map((link, i) => (
                            <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                                                    className="text-xs px-2 py-1 bg-gray-100 rounded flex items-center gap-1 hover:bg-gray-200 transition"
                            >
                            {link.platform === 'youtube' ? (
                                <>
                                                            <Youtube size={12} className="text-red-600" />
                                <span>YouTube</span>
                                </>
                            ) : (
                                <>
                                                            <Music size={12} className="text-black" />
                                <span>TikTok</span>
                                </>
                            )}
                            </a>
                        ))}
                                        </div>
                        </div>
                    )}
                </motion.div>
                ))}
            </div>
            </div>
        </div>
        </section>
    );
}