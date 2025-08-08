'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSet, setCurrentSet] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team');
        const data = await response.json();
        
        if (data.success) {
          setTeamMembers(data.teamMembers);
        } else {
          setError(data.error || 'Failed to fetch team members');
        }
      } catch (err) {
        setError('Failed to fetch team members');
        console.error('Error fetching team members:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, []);
    
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create sets based on screen size
  const cardsPerSet = isMobile ? 2 : 4;
  const totalSets = Math.ceil(teamMembers.length / cardsPerSet);
  const sets = [];
  
  for (let i = 0; i < teamMembers.length; i += cardsPerSet) {
    sets.push(teamMembers.slice(i, i + cardsPerSet));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSet((prev) => (prev + 1) % totalSets);
    }, 30000);

    return () => clearInterval(interval);
  }, [totalSets]);

  return (
    <section id="team" className="py-16 bg-gray-50 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Executives</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The dedicated executives guiding the youth ministry with vision and purpose
          </p>
        </motion.div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {!loading && !error && teamMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No team members found.</p>
          </div>
        )}
        
        {!loading && !error && teamMembers.length > 0 && (
          <>
            <div className="relative h-[300px] sm:h-[400px] lg:h-[400px]">
              <AnimatePresence mode="wait">
                {sets.map((set, setIndex) => (
                  currentSet === setIndex && (
                    <motion.div
                      key={`set-${setIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 sm:gap-8 absolute inset-0`}
                    >
                      {set.map((member, index) => {
                        const direction = index % 2 === 0 ? 'left' : 'right';
                        
                        return (
                          <motion.div
                            key={`${member.id}-${setIndex}`} 
                            initial={{ 
                              x: direction === 'left' ? -100 : 100,
                              opacity: 0 
                            }}
                            animate={{ 
                              x: 0,
                              opacity: 1,
                              transition: { 
                                delay: index * 0.2,
                                type: 'spring',
                                stiffness: 100,
                                damping: 10
                              }
                            }}
                            exit={{
                              x: direction === 'left' ? -100 : 100,
                              opacity: 0,
                              transition: { duration: 0.3 }
                            }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                          >
                            <div className="relative h-48 sm:h-56 lg:h-80 w-full">
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                              />
                              {/* Color overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-800/40 to-blue-700/20" />
                              
                              {/* Text overlay with background */}
                              <div className="absolute bottom-0 top-[12rem] left-0 right-0 p-3 sm:p-4">
                                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg">
                                  <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1">{member.name}</h3>
                                  <p className="text-blue-600 font-medium mb-1 sm:mb-2 text-xs sm:text-sm">{member.role}</p>
                                  <p className="text-amber-600 font-light text-xs mb-2">{member.phone}</p>
                                  <p className="text-gray-700 mb-2 italic text-xs sm:text-sm">&quot;{member.quote}&quot;</p>
                                  
                                  <div className="flex justify-center space-x-3">
                                    <a href={member.social.twitter} className="text-gray-500 hover:text-blue-500 transition-colors">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                      </svg>
                                    </a>
                                    <a href={member.social.facebook} className="text-gray-500 hover:text-blue-700 transition-colors">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalSets }).map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setCurrentSet(index)}
                  className={`w-3 h-3 rounded-full ${currentSet === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}