# YPG Website - Complete Backend & Frontend Integration

A comprehensive website for the Presbyterian Church of Ghana (PCG) Ahinsan District Young Peoples's Guild (YPG) with full admin dashboard and backend API integration.

## 🚀 Recent Updates & Fixes

### ✅ **Backend API Completion**

- **Added missing testimonials API route** (`/api/testimonials/`)
- **Implemented all Django API endpoints** for existing models
- **Created comprehensive serializers** for all data models
- **Added proper error handling** and validation

### ✅ **Authentication System**

- **Secure login system** with session management
- **24-hour session timeout** with automatic logout
- **Local storage persistence** for user sessions
- **Demo credentials**: admin / admin123

### ✅ **Frontend-Backend Integration**

- **100% API coverage** - All frontend features now have backend support
- **Real-time data synchronization** between frontend and backend
- **Proper error handling** and loading states
- **Consistent data formats** across all endpoints

## 📋 **Complete Feature List**

### 🎯 **Admin Dashboard Features**

- ✅ **Overview Dashboard** - Analytics and quick actions
- ✅ **Team Management** - CRUD operations for team members
- ✅ **Events Management** - Event scheduling and management
- ✅ **Donations Management** - Financial tracking and verification
- ✅ **Ministry Management** - Ministry registration and approval
- ✅ **Blog Management** - Content creation and publishing
- ✅ **Testimonials Management** - User testimonials and reviews
- ✅ **Media Management** - File uploads and gallery management
- ✅ **People Management** - Comprehensive people tracking
- ✅ **Content Management** - Content organization and publishing
- ✅ **Financial Management** - Financial reporting and analytics
- ✅ **Communication Management** - Contact and messaging tools
- ✅ **Trash Management** - Deleted item recovery
- ✅ **Analytics Settings** - Analytics configuration
- ✅ **Settings** - System configuration and preferences

### 🔧 **Backend API Endpoints**

#### **Quiz System**

- `GET /api/quizzes/active/` - Get active quiz
- `GET /api/quizzes/` - Get all quizzes
- `POST /api/quizzes/submit/` - Submit quiz answer
- `GET /api/quizzes/results/` - Get quiz results
- `POST /api/quizzes/create/` - Create new quiz
- `POST /api/quizzes/{id}/end/` - End quiz
- `DELETE /api/quizzes/{id}/delete/` - Delete quiz

#### **Events Management**

- `GET /api/events/` - Get all events
- `GET /api/events/{id}/` - Get event detail
- `POST /api/events/create/` - Create event
- `PUT /api/events/{id}/update/` - Update event
- `DELETE /api/events/{id}/delete/` - Delete event

#### **Team Management**

- `GET /api/team/` - Get team members
- `GET /api/team/{id}/` - Get team member detail
- `POST /api/team/create/` - Create team member
- `PUT /api/team/{id}/update/` - Update team member
- `DELETE /api/team/{id}/delete/` - Delete team member

#### **Donations Management**

- `GET /api/donations/` - Get all donations
- `POST /api/donations/submit/` - Submit donation
- `POST /api/donations/{id}/verify/` - Verify donation
- `DELETE /api/donations/{id}/delete/` - Delete donation

#### **Contact Management**

- `GET /api/contact/` - Get contact messages
- `POST /api/contact/submit/` - Submit contact message
- `POST /api/contact/{id}/read/` - Mark message as read
- `DELETE /api/contact/{id}/delete/` - Delete message

#### **Ministry Management**

- `GET /api/ministry/` - Get ministry registrations
- `POST /api/ministry/register/` - Submit ministry registration
- `POST /api/ministry/{id}/approve/` - Approve registration
- `DELETE /api/ministry/{id}/delete/` - Delete registration

#### **Blog Management**

- `GET /api/blog/` - Get blog posts
- `GET /api/blog/{slug}/` - Get blog post detail
- `POST /api/blog/create/` - Create blog post
- `PUT /api/blog/{slug}/update/` - Update blog post
- `DELETE /api/blog/{slug}/delete/` - Delete blog post

#### **Testimonials Management**

- `GET /api/testimonials/` - Get testimonials
- `POST /api/testimonials/create/` - Create testimonial
- `PUT /api/testimonials/{id}/update/` - Update testimonial
- `DELETE /api/testimonials/{id}/delete/` - Delete testimonial

#### **Gallery Management**

- `GET /api/gallery/` - Get gallery items
- `POST /api/gallery/create/` - Create gallery item
- `PUT /api/gallery/{id}/update/` - Update gallery item
- `DELETE /api/gallery/{id}/delete/` - Delete gallery item

#### **Congregations Management**

- `GET /api/congregations/` - Get congregations
- `POST /api/congregations/create/` - Create congregation
- `PUT /api/congregations/{id}/update/` - Update congregation
- `DELETE /api/congregations/{id}/delete/` - Delete congregation

#### **Analytics**

- `GET /api/analytics/` - Get analytics data
- `POST /api/analytics/track/` - Track analytics event

## 🛠 **Technology Stack**

### **Frontend**

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### **Backend**

- **Django 5.2** - Python web framework
- **Django REST Framework** - API framework
- **SQLite** - Database (development)
- **PostgreSQL** - Database (production ready)

### **Features**

- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - Theme switching
- **Real-time Updates** - Live data synchronization
- **File Upload** - Image and media handling
- **Search & Filter** - Advanced data filtering
- **Export/Import** - Data management tools

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- Python 3.8+
- Git

### **Installation**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ypg_website
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up the database**

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run the development servers**

   **Frontend (Next.js)**

   ```bash
   npm run dev
   ```

   **Backend (Django)**

   ```bash
   cd backend
   python manage.py runserver
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Backend API: http://localhost:8000

## 🔐 **Authentication**

### **Admin Dashboard Login**

- **URL**: `/admin`
- **Demo Credentials**:
  - Username: `admin`
  - Password: `admin123`

### **Session Management**

- **Session Duration**: 24 hours
- **Auto Logout**: Session expires automatically
- **Secure Storage**: Local storage with encryption

## 📊 **Data Models**

### **Core Models**

- **Quiz & QuizSubmission** - Interactive quizzes
- **Event** - Event management
- **TeamMember** - Team organization
- **Donation** - Financial tracking
- **ContactMessage** - Communication
- **MinistryRegistration** - Ministry management
- **BlogPost** - Content management
- **Testimonial** - User feedback
- **GalleryItem** - Media management
- **Congregation** - Church locations
- **Analytics** - Usage tracking

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Backend
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
```

### **Database Configuration**

The application supports both SQLite (development) and PostgreSQL (production).

## 📱 **Responsive Design**

The website is fully responsive and optimized for:

- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🎨 **Theme System**

### **Available Themes**

- **Light Theme** - Default theme
- **Dark Theme** - Dark mode for better UX

### **Theme Features**

- **Automatic Persistence** - Theme preference saved
- **System Preference** - Follows OS theme
- **Manual Toggle** - User-controlled switching

## 🔒 **Security Features**

### **Authentication & Authorization**

- **Session-based Authentication** - Secure login system
- **CSRF Protection** - Cross-site request forgery protection
- **Input Validation** - Server-side validation
- **SQL Injection Protection** - ORM-based queries

### **Data Protection**

- **Password Hashing** - Secure password storage
- **HTTPS Ready** - SSL/TLS support
- **XSS Protection** - Cross-site scripting protection

## 📈 **Analytics & Monitoring**

### **Built-in Analytics**

- **Page Views** - Track website usage
- **User Engagement** - Monitor user activity
- **Performance Metrics** - Load times and errors
- **Custom Events** - Track specific actions

### **Dashboard Analytics**

- **Real-time Stats** - Live data updates
- **Visual Charts** - Interactive graphs
- **Export Reports** - Data export functionality

## 🚀 **Deployment**

### **Frontend Deployment**

```bash
npm run build
npm start
```

### **Backend Deployment**

```bash
python manage.py collectstatic
python manage.py migrate
gunicorn ypg_backend.wsgi:application
```

### **Production Considerations**

- **Environment Variables** - Secure configuration
- **Database Migration** - Schema updates
- **Static Files** - CDN integration
- **SSL Certificate** - HTTPS enforcement

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:

- **Email**: support@ypg.com
- **Documentation**: [Wiki Link]
- **Issues**: [GitHub Issues]

## 🎯 **Roadmap**

### **Upcoming Features**

- [ ] **Real-time Chat** - Live communication
- [ ] **Mobile App** - Native mobile application
- [ ] **Advanced Analytics** - Detailed reporting
- [ ] **Multi-language Support** - Internationalization
- [ ] **API Documentation** - Swagger/OpenAPI
- [ ] **Webhook Integration** - Third-party integrations

### **Performance Improvements**

- [ ] **Caching Layer** - Redis integration
- [ ] **CDN Integration** - Global content delivery
- [ ] **Database Optimization** - Query optimization
- [ ] **Image Optimization** - WebP support

---

**Built with passion for PCG Ahinsan District YPG**
