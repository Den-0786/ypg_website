'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const blogPosts = [
    {
        id: 1,
        title: "YPG Retreat 2025: Spiritual Growth in Action",
        excerpt: "Discover how the recent youth retreat transformed lives and deepened our faith.",
        image: "/hero.jpg",
        date: "May 15, 2025",
        category: "Events"
    },
    {
        id: 2,
        title: "Meet the Executives",
        excerpt: "Get to know the passionate team behind YPG's mission and activities.",
        image: "/rita.jpg",
        date: "April 28, 2025",
        category: "Leadership"
    },
    {
        id: 3,
        title: "Community Outreach Highlights",
        excerpt: "From cleanups to donations, see how YPG is making an impact locally.",
        image: "/mission.jpg",
        date: "June 2, 2025",
        category: "Service"
    },
    {
        id: 4,
        title: "Youth Ministry Workshop Success",
        excerpt: "Learn about our recent workshop that equipped young leaders with essential skills.",
        image: "/hero/attendance.jpeg",
        date: "May 20, 2025",
        category: "Training"
    },
    {
        id: 5,
        title: "Bible Study Insights",
        excerpt: "Deep dive into our weekly Bible study sessions and spiritual discussions.",
        image: "/hero/database.jpeg",
        date: "May 10, 2025",
        category: "Spiritual"
    },
    {
        id: 6,
        title: "Youth Fellowship Night",
        excerpt: "Celebrating unity and friendship through our monthly fellowship gatherings.",
        image: "/hero/youth.jpeg",
        date: "May 5, 2025",
        category: "Fellowship"
    },
    {
        id: 7,
        title: "Mission Trip Preparation",
        excerpt: "Getting ready for our upcoming mission trip to serve communities in need.",
        image: "/cloth and hymn.jpeg",
        date: "April 25, 2025",
        category: "Missions"
    },
    {
        id: 8,
        title: "Prayer Warriors Unite",
        excerpt: "How our prayer ministry is strengthening the spiritual foundation of our youth.",
        image: "/style.jpeg",
        date: "April 15, 2025",
        category: "Prayer"
    },
    {
        id: 9,
        title: "Creative Worship Night",
        excerpt: "Exploring new ways to express our faith through music, art, and creativity.",
        image: "/images.jpeg",
        date: "April 10, 2025",
        category: "Worship"
    }
];

export default function BlogSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;
    const totalPages = Math.ceil(blogPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = blogPosts.slice(startIndex, endIndex);

    const handlePrevious = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            // Scroll to top of blog section
            document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            // Scroll to top of blog section
            document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePageClick = (e, page) => {
        e.preventDefault();
        setCurrentPage(page);
        // Scroll to top of blog section
        document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="blog" className="py-20 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block mb-3 text-sm font-semibold text-blue-600 uppercase tracking-wider">
                        Latest Updates
                    </span>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        From Our <span className="text-blue-600">Blog</span>
                    </h2>
                    <div className="w-20 h-1 bg-blue-500 mx-auto"></div>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {currentPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            whileHover={{ y: -5 }}
                            className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-blue-600 text-white">
                                    {post.category}
                                </span>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                    <span>{post.date}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                                    <a href="#" className="hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </a>
                                </h3>
                                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                <a 
                                    href="#" 
                                    className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors"
                                >
                                    Read more
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex justify-center items-center space-x-4 mt-12"
                    >
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                currentPage === 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    type="button"
                                    key={page}
                                    onClick={(e) => handlePageClick(e, page)}
                                    className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                currentPage === totalPages
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                            }`}
                        >
                            Next
                        </button>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <a
                        href="#"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all hover:from-blue-700 hover:to-blue-600"
                    >
                        View All Articles
                    </a>
                </motion.div>
            </div>
        </section>
    );
}