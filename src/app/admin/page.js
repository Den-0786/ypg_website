/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Image,
  Video,
  DollarSign,
  Eye,
  Settings,
  Plus,
  Edit,
  Trash2,
  Upload,
  BarChart3,
  FileText,
  Heart,
  Image as ImageIcon,
  Video as VideoIcon,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    venue: '',
    image: '',
    startDate: '',
    endDate: '',
    description: '',
    type: 'upcoming',
  });

  // State for data from API
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalMedia: 0
  });

  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [media, setMedia] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [pastEvents, setPastEvents] = useState([]);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newMedia, setNewMedia] = useState({
    type: 'image',
    url: '',
    title: '',
    description: '',
  });

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    description: '',
    image: null,
  });

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    phone: '',
    quote: '',
    image: null,
  });
  const [editingTeamMember, setEditingTeamMember] = useState(null);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([]);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: '',
    quote: '',
    highlight: '',
    image: null,
  });
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Ministry registration state
  const [ministryRegistrations, setMinistryRegistrations] = useState([]);
  const [showAddMinistryRegistration, setShowAddMinistryRegistration] = useState(false);
  const [newMinistryRegistration, setNewMinistryRegistration] = useState({
    name: '',
    phone: '',
    congregation: '',
    ministry: '',
  });
  const [editingMinistryRegistration, setEditingMinistryRegistration] = useState(null);
  
  // Donation state
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [newDonation, setNewDonation] = useState({
    donor: '',
    phone: '',
    email: '',
    amount: '',
    payment_method: 'online',
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    status: 'completed'
  });
  const [editingDonation, setEditingDonation] = useState(null);
  
  // Contact messages state
  const [contactMessages, setContactMessages] = useState([]);
  const [showAddContactMessage, setShowAddContactMessage] = useState(false);
  const [newContactMessage, setNewContactMessage] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    status: 'unread'
  });
  const [editingContactMessage, setEditingContactMessage] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsResponse = await fetch('/api/events');
      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        setEvents(eventsData.events);
      }

      // Fetch donations
      const donationsResponse = await fetch('/api/donations');
      const donationsData = await donationsResponse.json();
      if (donationsData.success) {
        setDonations(donationsData.donations);
      }

      // Fetch media
      const mediaResponse = await fetch('/api/media');
      const mediaData = await mediaResponse.json();
      if (mediaData.success) {
        setMedia(mediaData.media);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/analytics');
      const analyticsData = await analyticsResponse.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }

      // Update stats
      setStats({
        totalVisitors: analyticsData.success ? analyticsData.analytics.visitors.total : 0,
        totalDonations: donationsData.success ? donationsData.summary.total_amount : 0,
        totalEvents: eventsData.success ? eventsData.events.length : 0,
        totalMedia: mediaData.success ? mediaData.media.length : 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      // For now, we'll use hardcoded data since we haven't created the API yet
      // In a real implementation, this would fetch from /api/testimonials
      const hardcodedTestimonials = [
        {
          id: 1,
          name: 'Martha Owusu',
          role: 'YPG President, Bethel Congregation',
          image: '/rita.jpg',
          quote: "Joining the youth group helped me grow spiritually and find a second family. I'm proud to serve and make a difference.",
          highlight: "Second family"
        },
        {
          id: 2,
          name: 'Kwame Asare',
          role: 'Member, Emmanuel Congregation',
          image: '/mission-vision/pres.jpg',
          quote: "The events, teachings, and friendships I've built here have shaped my life. I encourage everyone to join.",
          highlight: "Shaped my life"
        },
        {
          id: 3,
          name: 'Grace Mensah',
          role: 'Choir Lead, Zion Congregation',
          image: '/mission-vision/priscy.jpg',
          quote: "Every youth deserves a place like this — full of love, leadership, and purpose. God bless the movement!",
          highlight: "Love & purpose"
        }
      ];
      setTestimonials(hardcodedTestimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  // Fetch ministry registrations
  const fetchMinistryRegistrations = async () => {
    try {
      // For now, we'll use hardcoded data since we haven't created the API yet
      // In a real implementation, this would fetch from /api/ministry-registrations
      const hardcodedRegistrations = [
        {
          id: 1,
          name: 'John Doe',
          phone: '+233123456789',
          congregation: 'Bethel Congregation',
          ministry: 'Music Ministry',
          submittedAt: '2023-05-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          phone: '0123456789',
          congregation: 'Emmanuel Congregation',
          ministry: 'Outreach Ministry',
          submittedAt: '2023-05-16T14:45:00Z'
        }
      ];
      setMinistryRegistrations(hardcodedRegistrations);
    } catch (error) {
      console.error('Error fetching ministry registrations:', error);
    }
  };
  
  // Fetch contact messages
  const fetchContactMessages = async () => {
    try {
      // For now, we'll use hardcoded data since we haven't created the API yet
      // In a real implementation, this would fetch from /api/contact-messages
      const hardcodedMessages = [
        {
          id: 1,
          name: 'Samuel Osei',
          email: 'samuel.osei@example.com',
          subject: 'Prayer Request',
          message: 'I would like to request prayers for my family as we go through some challenges.',
          date: '2023-05-10T14:30:00Z',
          status: 'unread'
        },
        {
          id: 2,
          name: 'Akosua Mensah',
          email: 'akosua.mensah@example.com',
          subject: 'Joining the Youth Group',
          message: 'I am interested in joining the youth group. How do I go about it?',
          date: '2023-05-08T09:15:00Z',
          status: 'read'
        },
        {
          id: 3,
          name: 'Kwame Asante',
          email: 'kwame.asante@example.com',
          subject: 'Event Inquiry',
          message: 'Could you provide more details about the upcoming retreat?',
          date: '2023-05-05T16:45:00Z',
          status: 'archived'
        }
      ];
      setContactMessages(hardcodedMessages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchTeamMembers();
      fetchTestimonials();
      fetchMinistryRegistrations();
      fetchContactMessages();
    }
  }, [isAuthenticated]);

  // Migration function: move ended upcoming events to pastEvents
  const migratePastEvents = () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setHours(15, 0, 0, 0); // 3pm today
    const stillUpcoming = [];
    const toPast = [];
    events.forEach(event => {
      const eventEnd = new Date(event.endDate);
      if (
        eventEnd < now ||
        (eventEnd.toDateString() === now.toDateString() && now >= cutoff)
      ) {
        toPast.push({
          ...event,
          start_date: event.startDate,
          end_date: event.endDate,
        });
      } else {
        stillUpcoming.push(event);
      }
    });
    if (toPast.length > 0) {
      setPastEvents(prev => [...prev, ...toPast]);
      setEvents(stillUpcoming);
    }
  };

  // Run migration on load and after adding event
  useEffect(() => {
    migratePastEvents();
    // eslint-disable-next-line
  }, [events]);

  const handleLogin = () => {
    if (password === 'admin2024') {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      alert('Incorrect password');
    }
  };

  // Add Event handler
  const handleAddEvent = (e) => {
    e.preventDefault();
    setEvents([
      ...events,
      {
        id: Date.now(),
        ...newEvent,
        attendees: 0,
        status: 'active',
      },
    ]);
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      venue: '',
      image: '',
      startDate: '',
      endDate: '',
      description: '',
      type: 'upcoming',
    });
  };

  const handleAddMedia = (e) => {
    e.preventDefault();
    setMedia([
      ...media,
      {
        id: Date.now(),
        ...newMedia,
      },
    ]);
    setShowAddMedia(false);
    setNewMedia({ type: 'image', url: '', title: '', description: '' });
  };

  // Helper to format date as 'Month Day, Year'
  function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleAddBlog = (e) => {
    e.preventDefault();
    setBlogPosts(prev => {
      const updated = prev.length >= 10 ? prev.slice(1) : prev;
      return [...updated, {
        id: Date.now(),
        ...newBlog,
        date: getFormattedDate(),
      }];
    });
    setShowAddBlog(false);
    setNewBlog({ title: '', description: '', image: null });
  };

  // Handle adding a new team member
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', newTeamMember.name);
      formData.append('role', newTeamMember.role);
      formData.append('phone', newTeamMember.phone);
      formData.append('quote', newTeamMember.quote);
      if (newTeamMember.image) {
        formData.append('image', newTeamMember.image);
      }
      
      const response = await fetch('/api/team', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(prev => [...prev, data.teamMember]);
        setShowAddTeamMember(false);
        setNewTeamMember({
          name: '',
          role: '',
          phone: '',
          quote: '',
          image: null,
        });
      } else {
        console.error('Error adding team member:', data.error);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  // Handle updating a team member
  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('id', editingTeamMember.id);
      formData.append('name', newTeamMember.name);
      formData.append('role', newTeamMember.role);
      formData.append('phone', newTeamMember.phone);
      formData.append('quote', newTeamMember.quote);
      if (newTeamMember.image) {
        formData.append('image', newTeamMember.image);
      }
      
      const response = await fetch('/api/team', {
        method: 'PUT',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(prev =>
          prev.map(member =>
            member.id === editingTeamMember.id ? data.teamMember : member
          )
        );
        setShowAddTeamMember(false);
        setNewTeamMember({
          name: '',
          role: '',
          phone: '',
          quote: '',
          image: null,
        });
        setEditingTeamMember(null);
      } else {
        console.error('Error updating team member:', data.error);
      }
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  // Handle deleting a team member
  const handleDeleteTeamMember = async (id) => {
    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(prev => prev.filter(member => member.id !== id));
      } else {
        console.error('Error deleting team member:', data.error);
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  // Handle adding a new testimonial
  const handleAddTestimonial = (e) => {
    e.preventDefault();
    const newTestimonialWithId = {
      ...newTestimonial,
      id: Date.now(), // In a real app, this would come from the server
    };
    setTestimonials(prev => [...prev, newTestimonialWithId]);
    setShowAddTestimonial(false);
    setNewTestimonial({
      name: '',
      role: '',
      quote: '',
      highlight: '',
      image: null,
    });
  };

  // Handle updating a testimonial
  const handleUpdateTestimonial = (e) => {
    e.preventDefault();
    setTestimonials(prev =>
      prev.map(t =>
        t.id === editingTestimonial.id ? { ...newTestimonial, id: editingTestimonial.id } : t
      )
    );
    setShowAddTestimonial(false);
    setNewTestimonial({
      name: '',
      role: '',
      quote: '',
      highlight: '',
      image: null,
    });
    setEditingTestimonial(null);
  };

  // Handle deleting a testimonial
  const handleDeleteTestimonial = (id) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  // Handle adding a new ministry registration
  const handleAddMinistryRegistration = (e) => {
    e.preventDefault();
    const newRegistrationWithId = {
      ...newMinistryRegistration,
      id: Date.now(), // In a real app, this would come from the server
      submittedAt: new Date().toISOString()
    };
    setMinistryRegistrations(prev => [...prev, newRegistrationWithId]);
    setShowAddMinistryRegistration(false);
    setNewMinistryRegistration({
      name: '',
      phone: '',
      congregation: '',
      ministry: '',
    });
  };

  // Handle updating a ministry registration
  const handleUpdateMinistryRegistration = (e) => {
    e.preventDefault();
    setMinistryRegistrations(prev =>
      prev.map(r =>
        r.id === editingMinistryRegistration.id ? { ...newMinistryRegistration, id: editingMinistryRegistration.id } : r
      )
    );
    setShowAddMinistryRegistration(false);
    setNewMinistryRegistration({
      name: '',
      phone: '',
      congregation: '',
      ministry: '',
    });
    setEditingMinistryRegistration(null);
  };

  // Handle deleting a ministry registration
  const handleDeleteMinistryRegistration = (id) => {
    setMinistryRegistrations(prev => prev.filter(r => r.id !== id));
  };
  
  // Handle adding a new donation
  const handleAddDonation = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDonation,
          amount: parseFloat(newDonation.amount),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev => [...prev, data.donation]);
        setShowAddDonation(false);
        setNewDonation({
          donor: '',
          phone: '',
          email: '',
          amount: '',
          payment_method: 'online',
          date: new Date().toISOString().split('T')[0],
          purpose: '',
          status: 'completed'
        });
      } else {
        console.error('Error adding donation:', data.error);
      }
    } catch (error) {
      console.error('Error adding donation:', error);
    }
  };
  
  // Handle updating a donation
  const handleUpdateDonation = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/donations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingDonation.id,
          ...newDonation,
          amount: parseFloat(newDonation.amount),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev =>
          prev.map(donation =>
            donation.id === editingDonation.id ? data.donation : donation
          )
        );
        setShowAddDonation(false);
        setNewDonation({
          donor: '',
          phone: '',
          email: '',
          amount: '',
          payment_method: 'online',
          date: new Date().toISOString().split('T')[0],
          purpose: '',
          status: 'completed'
        });
        setEditingDonation(null);
      } else {
        console.error('Error updating donation:', data.error);
      }
    } catch (error) {
      console.error('Error updating donation:', error);
    }
  };
  
  // Handle deleting a donation
  const handleDeleteDonation = async (id) => {
    try {
      const response = await fetch(`/api/donations?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDonations(prev => prev.filter(donation => donation.id !== id));
      } else {
        console.error('Error deleting donation:', data.error);
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
    }
  };
  
  // Handle adding a new contact message
  const handleAddContactMessage = (e) => {
    e.preventDefault();
    const newMessageWithId = {
      ...newContactMessage,
      id: Date.now(), // In a real app, this would come from the server
    };
    setContactMessages(prev => [...prev, newMessageWithId]);
    setShowAddContactMessage(false);
    setNewContactMessage({
      name: '',
      email: '',
      subject: '',
      message: '',
      date: new Date().toISOString().split('T')[0],
      status: 'unread'
    });
  };
  
  // Handle updating a contact message
  const handleUpdateContactMessage = (e) => {
    e.preventDefault();
    setContactMessages(prev =>
      prev.map(msg =>
        msg.id === editingContactMessage.id ? { ...newContactMessage, id: editingContactMessage.id } : msg
      )
    );
    setShowAddContactMessage(false);
    setNewContactMessage({
      name: '',
      email: '',
      subject: '',
      message: '',
      date: new Date().toISOString().split('T')[0],
      status: 'unread'
    });
    setEditingContactMessage(null);
  };
  
  // Handle deleting a contact message
  const handleDeleteContactMessage = (id) => {
    setContactMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Ahinsan District YPG</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Default password: admin2024
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                PCG Ahinsan District YPG
              </span>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex lg:flex-wrap lg:justify-center gap-2 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-3 sm:px-3 sm:overflow-x-visible">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'media', label: 'Media', icon: Image },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'testimonials', label: 'Testimonials', icon: MessageCircle },
              { id: 'ministry-registrations', label: 'Ministry', icon: FileText },
              { id: 'contact-messages', label: 'Messages', icon: MessageCircle },
              { id: 'blog', label: 'Blog', icon: BookOpen },
              { id: 'donations', label: 'Donations', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: Eye },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center min-w-[80px] sm:min-w-[120px] lg:min-w-[180px] px-2 py-2 sm:px-4 sm:py-3 rounded-xl shadow-md font-medium transition-colors whitespace-nowrap bg-white border hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'text-gray-600 hover:text-blue-700 border-gray-200'
                  }`}
                  style={{ transition: 'box-shadow 0.2s' }}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cards for medium and up */}
              <div className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalDonations}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Image className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Media Files</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMedia}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Horizontal scroll for small screens */}
            <div className="sm:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              <div className="min-w-[250px] bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition flex-shrink-0">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Visitors</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalVisitors}</p>
                  </div>
                </div>
              </div>
              <div className="min-w-[250px] bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition flex-shrink-0">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalDonations}</p>
                  </div>
                </div>
              </div>
              <div className="min-w-[250px] bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition flex-shrink-0">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>
              <div className="min-w-[250px] bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition flex-shrink-0">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Image className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Media Files</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalMedia}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md border mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:mx-0 md:px-0">
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors min-w-[200px] flex-shrink-0 md:min-w-0">
                  <Plus className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Add New Event</span>
                </button>
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors min-w-[200px] flex-shrink-0 md:min-w-0">
                  <Upload className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Upload Media</span>
                </button>
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors min-w-[200px] flex-shrink-0 md:min-w-0">
                  <FileText className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium">View Reports</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Events Management</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowAddEvent(true)}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Event
              </button>
            </div>
            {/* Add Event Modal */}
            <Transition.Root show={showAddEvent} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddEvent}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          Add Upcoming Event
                        </Dialog.Title>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue (Congregation/Location)</label>
                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Browse Media</label>
                            <div className="flex items-center gap-2">
                              {/* Left: Icon + Preview or No file chosen */}
                              <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                {newEvent.image ? (
                                  <span>{typeof newEvent.image === 'string' ? newEvent.image : newEvent.image.name}</span>
                                ) : (
                                  <span>No file chosen</span>
                                )}
                              </div>
                              {/* Right: Browse/Upload button */}
                              <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  required
                                  className="hidden"
                                  onChange={e => setNewEvent({ ...newEvent, image: e.target.files[0] })}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                              <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                              <input type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" rows={3} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                          </div>
                          <input type="hidden" value="upcoming" />
                          <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowAddEvent(false)}>Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Add Event</button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.type === 'upcoming' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.attendees}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Media Management</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowAddMedia(true)}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Add Media
              </button>
            </div>
            {/* Add Media Modal */}
            <Transition.Root show={showAddMedia} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddMedia}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          Add Media
                        </Dialog.Title>
                        <form onSubmit={handleAddMedia} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newMedia.type}
                              onChange={e => setNewMedia({ ...newMedia, type: e.target.value })}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Browse Media</label>
                            <div className="flex items-center gap-2">
                              {/* Left: Icon + Preview or No file chosen */}
                              <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                                {newMedia.type === 'image' ? (
                                  <ImageIcon className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <VideoIcon className="w-4 h-4 text-blue-400" />
                                )}
                                {newMedia.file ? (
                                  <span>{typeof newMedia.file === 'string' ? newMedia.file : newMedia.file.name}</span>
                                ) : (
                                  <span>No file chosen</span>
                                )}
                              </div>
                              {/* Right: Browse/Upload button */}
                              <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                                Upload
                                <input
                                  type="file"
                                  accept={newMedia.type === 'image' ? 'image/*' : 'video/*'}
                                  required
                                  className="hidden"
                                  onChange={e => setNewMedia({ ...newMedia, file: e.target.files[0] })}
                                />
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title/Caption</label>
                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newMedia.title} onChange={e => setNewMedia({ ...newMedia, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description (include location/congregation)</label>
                            <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" rows={2} value={newMedia.description} onChange={e => setNewMedia({ ...newMedia, description: e.target.value })} />
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowAddMedia(false)}>Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Add Media</button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            {/* Cards: grid for md+, horizontal scroll for small screens */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <Video className="w-12 h-12 text-gray-400" />
                    ) : (
                      <Image className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.type}</p>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:hidden flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {media.map((item) => (
                <div key={item.id} className="min-w-[260px] bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden flex-shrink-0">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <Video className="w-12 h-12 text-gray-400" />
                    ) : (
                      <Image className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.type}</p>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Donations</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingDonation(null);
                  setNewDonation({
                    donor: '',
                    phone: '',
                    email: '',
                    amount: '',
                    payment_method: 'online',
                    date: new Date().toISOString().split('T')[0],
                    purpose: '',
                    status: 'completed'
                  });
                  setShowAddDonation(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Donation
              </button>
            </div>
            
            {/* Add Donation Modal */}
            <Transition.Root show={showAddDonation} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddDonation}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          {editingDonation ? 'Edit Donation' : 'Add Donation'}
                        </Dialog.Title>
                        <form onSubmit={editingDonation ? handleUpdateDonation : handleAddDonation} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.donor}
                              onChange={e => setNewDonation({ ...newDonation, donor: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.phone}
                              onChange={e => setNewDonation({ ...newDonation, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.email}
                              onChange={e => setNewDonation({ ...newDonation, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input
                              type="number"
                              required
                              min="1"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.amount}
                              onChange={e => setNewDonation({ ...newDonation, amount: parseFloat(e.target.value) || '' })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.payment_method}
                              onChange={e => setNewDonation({ ...newDonation, payment_method: e.target.value })}
                            >
                              <option value="online">Online</option>
                              <option value="check">Check</option>
                              <option value="cash">Cash</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.date}
                              onChange={e => setNewDonation({ ...newDonation, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newDonation.purpose}
                              onChange={e => setNewDonation({ ...newDonation, purpose: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              onClick={() => setShowAddDonation(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              {editingDonation ? 'Update' : 'Add'} Donation
                            </button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${donations.reduce((sum, donation) => sum + donation.amount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Online Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${donations.filter(d => d.payment_method === 'online').reduce((sum, donation) => sum + donation.amount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Check Donations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${donations.filter(d => d.payment_method === 'check').reduce((sum, donation) => sum + donation.amount, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {donation.donor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${donation.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            donation.payment_method === 'online'
                              ? 'bg-green-100 text-green-800'
                              : donation.payment_method === 'check'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {donation.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {donation.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {
                              setEditingDonation(donation);
                              setNewDonation({
                                donor: donation.donor,
                                phone: donation.phone,
                                email: donation.email || '',
                                amount: donation.amount,
                                payment_method: donation.payment_method,
                                date: donation.date,
                                purpose: donation.purpose,
                                status: donation.status
                              });
                              setShowAddDonation(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteDonation(donation.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Website Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Visitors</span>
                    <span className="font-semibold">{stats.totalVisitors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold">89</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Most Viewed Page</span>
                    <span className="font-semibold">Events</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Time on Site</span>
                    <span className="font-semibold">4m 32s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bounce Rate</span>
                    <span className="font-semibold">23%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Blog Posts</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowAddBlog(true)}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Add Blog Post
              </button>
            </div>
            {/* Add Blog Modal */}
            <Transition.Root show={showAddBlog} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddBlog}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          Add Blog Post
                        </Dialog.Title>
                        <form onSubmit={handleAddBlog} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" rows={3} value={newBlog.description} onChange={e => setNewBlog({ ...newBlog, description: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                {newBlog.image ? (
                                  <span>{typeof newBlog.image === 'string' ? newBlog.image : newBlog.image.name}</span>
                                ) : (
                                  <span>No file chosen</span>
                                )}
                              </div>
                              <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => setNewBlog({ ...newBlog, image: e.target.files[0] })}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setShowAddBlog(false)}>Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Add Blog Post</button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            {/* Blog post list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-md border p-4 flex gap-4 items-start">
                  {post.image && (
                    <img src={typeof post.image === 'string' ? post.image : URL.createObjectURL(post.image)} alt="Blog" className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{post.date}</div>
                    <h4 className="font-bold text-gray-900 mb-1 text-base">{post.title}</h4>
                    <p className="text-gray-700 text-sm line-clamp-3">{post.description}</p>
                  </div>
                </div>
              ))}
              {blogPosts.length === 0 && (
                <div className="text-gray-400 text-center col-span-full">No blog posts yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingTeamMember(null);
                  setNewTeamMember({
                    name: '',
                    role: '',
                    phone: '',
                    quote: '',
                    image: null,
                  });
                  setShowAddTeamMember(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Team Member
              </button>
            </div>
            
            {/* Add Team Member Modal */}
            <Transition.Root show={showAddTeamMember} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddTeamMember}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          {editingTeamMember ? 'Edit Team Member' : 'Add Team Member'}
                        </Dialog.Title>
                        <form onSubmit={editingTeamMember ? handleUpdateTeamMember : handleAddTeamMember} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTeamMember.name}
                              onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTeamMember.role}
                              onChange={e => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTeamMember.phone}
                              onChange={e => setNewTeamMember({ ...newTeamMember, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              rows={3}
                              value={newTeamMember.quote}
                              onChange={e => setNewTeamMember({ ...newTeamMember, quote: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                {newTeamMember.image ? (
                                  <span>{typeof newTeamMember.image === 'string' ? newTeamMember.image : newTeamMember.image.name}</span>
                                ) : (
                                  <span>No file chosen</span>
                                )}
                              </div>
                              <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => setNewTeamMember({ ...newTeamMember, image: e.target.files[0] })}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              onClick={() => setShowAddTeamMember(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              {editingTeamMember ? 'Update' : 'Add'} Team Member
                            </button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            
            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    {member.phone && (
                      <p className="text-gray-600 text-sm mb-2">Phone: {member.phone}</p>
                    )}
                    {member.quote && (
                      <p className="text-gray-700 text-sm italic line-clamp-2">&quot;{member.quote}&quot;</p>
                    )}
                    <div className="flex space-x-2 mt-3">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setEditingTeamMember(member);
                          setNewTeamMember({
                            name: member.name,
                            role: member.role,
                            phone: member.phone || '',
                            quote: member.quote || '',
                            image: member.image || null,
                          });
                          setShowAddTeamMember(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTeamMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <div className="text-gray-400 text-center col-span-full">No team members added yet.</div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Testimonial Management</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingTestimonial(null);
                  setNewTestimonial({
                    name: '',
                    role: '',
                    quote: '',
                    highlight: '',
                    image: null,
                  });
                  setShowAddTestimonial(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Testimonial
              </button>
            </div>
            
            {/* Add Testimonial Modal */}
            <Transition.Root show={showAddTestimonial} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddTestimonial}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                        </Dialog.Title>
                        <form onSubmit={editingTestimonial ? handleUpdateTestimonial : handleAddTestimonial} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTestimonial.name}
                              onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Congregation</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTestimonial.role}
                              onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Quote</label>
                            <textarea
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              rows={4}
                              value={newTestimonial.quote}
                              onChange={e => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Phrase</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newTestimonial.highlight}
                              onChange={e => setNewTestimonial({ ...newTestimonial, highlight: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (Optional)</label>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-xs text-gray-500 min-w-[110px] max-w-[140px] truncate gap-1">
                                <ImageIcon className="w-4 h-4 text-blue-400" />
                                {newTestimonial.image ? (
                                  <span>{typeof newTestimonial.image === 'string' ? newTestimonial.image : newTestimonial.image.name}</span>
                                ) : (
                                  <span>No file chosen</span>
                                )}
                              </div>
                              <label className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold cursor-pointer text-xs hover:bg-blue-100 border border-blue-100">
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => setNewTestimonial({ ...newTestimonial, image: e.target.files[0] })}
                                />
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              onClick={() => setShowAddTestimonial(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              {editingTestimonial ? 'Update' : 'Add'} Testimonial
                            </button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl shadow-md border hover:shadow-lg transition overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      {testimonial.image ? (
                        <img
                          src={typeof testimonial.image === 'string' ? testimonial.image : URL.createObjectURL(testimonial.image)}
                          alt={testimonial.name}
                          className="w-14 h-14 object-cover rounded-full border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                          <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                        <p className="text-blue-600 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm italic line-clamp-3">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <p className="text-blue-600 font-medium text-sm mt-2">
                        &quot;{testimonial.highlight}&quot;
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setEditingTestimonial(testimonial);
                          setNewTestimonial({
                            name: testimonial.name,
                            role: testimonial.role,
                            quote: testimonial.quote,
                            highlight: testimonial.highlight,
                            image: testimonial.image || null,
                          });
                          setShowAddTestimonial(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div className="text-gray-400 text-center col-span-full">No testimonials added yet.</div>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Ministry Registrations Tab */}
        {activeTab === 'ministry-registrations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Ministry Registrations</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingMinistryRegistration(null);
                  setNewMinistryRegistration({
                    name: '',
                    phone: '',
                    congregation: '',
                    ministry: '',
                  });
                  setShowAddMinistryRegistration(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Registration
              </button>
            </div>
            
            {/* Add Ministry Registration Modal */}
            <Transition.Root show={showAddMinistryRegistration} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddMinistryRegistration}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          {editingMinistryRegistration ? 'Edit Ministry Registration' : 'Add Ministry Registration'}
                        </Dialog.Title>
                        <form onSubmit={editingMinistryRegistration ? handleUpdateMinistryRegistration : handleAddMinistryRegistration} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newMinistryRegistration.name}
                              onChange={e => setNewMinistryRegistration({ ...newMinistryRegistration, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                              type="tel"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newMinistryRegistration.phone}
                              onChange={e => setNewMinistryRegistration({ ...newMinistryRegistration, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Congregation</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newMinistryRegistration.congregation}
                              onChange={e => setNewMinistryRegistration({ ...newMinistryRegistration, congregation: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ministry of Interest</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newMinistryRegistration.ministry}
                              onChange={e => setNewMinistryRegistration({ ...newMinistryRegistration, ministry: e.target.value })}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              onClick={() => setShowAddMinistryRegistration(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              {editingMinistryRegistration ? 'Update' : 'Add'} Registration
                            </button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            
            {/* Ministry Registrations Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Congregation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ministry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ministryRegistrations.map((registration) => (
                      <tr key={registration.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {registration.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.congregation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.ministry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {
                              setEditingMinistryRegistration(registration);
                              setNewMinistryRegistration({
                                name: registration.name,
                                phone: registration.phone,
                                congregation: registration.congregation,
                                ministry: registration.ministry,
                              });
                              setShowAddMinistryRegistration(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteMinistryRegistration(registration.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Contact Messages Tab */}
        {activeTab === 'contact-messages' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setEditingContactMessage(null);
                  setNewContactMessage({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'unread'
                  });
                  setShowAddContactMessage(true);
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Message
              </button>
            </div>
            
            {/* Add Contact Message Modal */}
            <Transition.Root show={showAddContactMessage} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={setShowAddContactMessage}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                          {editingContactMessage ? 'Edit Message' : 'Add Message'}
                        </Dialog.Title>
                        <form onSubmit={editingContactMessage ? handleUpdateContactMessage : handleAddContactMessage} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newContactMessage.name}
                              onChange={e => setNewContactMessage({ ...newContactMessage, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newContactMessage.email}
                              onChange={e => setNewContactMessage({ ...newContactMessage, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                              type="text"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newContactMessage.subject}
                              onChange={e => setNewContactMessage({ ...newContactMessage, subject: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              rows={4}
                              value={newContactMessage.message}
                              onChange={e => setNewContactMessage({ ...newContactMessage, message: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newContactMessage.date}
                              onChange={e => setNewContactMessage({ ...newContactMessage, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                              value={newContactMessage.status}
                              onChange={e => setNewContactMessage({ ...newContactMessage, status: e.target.value })}
                            >
                              <option value="unread">Unread</option>
                              <option value="read">Read</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-6">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                              onClick={() => setShowAddContactMessage(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              {editingContactMessage ? 'Update' : 'Add'} Message
                            </button>
                          </div>
                        </form>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
            
            {/* Contact Messages Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contactMessages.map((message) => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {message.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {message.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {message.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(message.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            message.status === 'unread'
                              ? 'bg-red-100 text-red-800'
                              : message.status === 'read'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => {
                              setEditingContactMessage(message);
                              setNewContactMessage({
                                name: message.name,
                                email: message.email,
                                subject: message.subject,
                                message: message.message,
                                date: message.date,
                                status: message.status
                              });
                              setShowAddContactMessage(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteContactMessage(message.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900">Website Settings</h2>
            
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Presbyterian Youth Ministry"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        defaultValue="youth@presbyterian.org"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        defaultValue="https://facebook.com/presbyterianyouth"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        defaultValue="https://instagram.com/presbyterianyouth"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 