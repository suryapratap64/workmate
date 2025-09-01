# Profile System Documentation

## Overview

This document describes the comprehensive profile system implemented for the WorkMate platform, similar to Upwork's profile functionality.

## Features

### 🎯 **Core Features**

- **Comprehensive Profile Pages**: Detailed profile views for both workers and clients
- **Profile Editing**: Full-featured edit forms with real-time updates
- **Profile Picture Upload**: Image upload with preview and validation
- **Responsive Design**: Mobile-first design with modern UI/UX
- **Role-Based Content**: Different sections for workers vs clients

### 👤 **Worker Profile Features**

- **Personal Information**: Name, email, location, bio
- **Professional Details**: Skills, hourly rate, experience, education
- **Portfolio Management**: Add/remove portfolio items
- **Languages & Certifications**: Dynamic lists with add/remove functionality
- **Statistics**: Completed jobs, total earnings, rating
- **Social Links**: LinkedIn, GitHub, personal website

### 🏢 **Client Profile Features**

- **Company Information**: Company name, size, industry
- **Business Statistics**: Posted jobs, hired workers, total spent
- **Contact Information**: Email, phone, location
- **Social Links**: LinkedIn, website, Twitter

## Backend Implementation

### Database Models

#### Worker Model (`backend/models/worker.model.js`)

```javascript
{
  firstName: String (required),
  lastName: String (required),
  mobileNumber: String (required),
  email: String,
  password: String (required),
  profilePicture: String,
  bio: String,
  country: String (required),
  city: String,
  state: String,
  localAddress: String,
  skills: [String],
  hourlyRate: Number,
  experience: String,
  education: String,
  portfolio: [String],
  availability: String,
  rating: Number,
  totalReviews: Number,
  completedJobs: Number,
  totalEarnings: Number,
  languages: [String],
  certifications: [String],
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  }
}
```

#### Client Model (`backend/models/client.model.js`)

```javascript
{
  firstName: String (required),
  lastName: String (required),
  mobileNumber: String (required),
  email: String,
  password: String (required),
  profilePicture: String,
  bio: String,
  country: String (required),
  city: String,
  state: String,
  localAddress: String,
  companyName: String,
  companySize: String,
  industry: String,
  totalSpent: Number,
  postedJobs: Number,
  hiredWorkers: Number,
  rating: Number,
  totalReviews: Number,
  socialLinks: {
    linkedin: String,
    website: String,
    twitter: String
  }
}
```

### API Endpoints

#### Profile Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/profile/picture` - Upload profile picture

#### Authentication Required

All profile endpoints require authentication via JWT token in cookies.

### File Upload Configuration

- **Multer Configuration**: Handles image uploads with validation
- **File Size Limit**: 5MB maximum
- **File Types**: Images only (jpg, png, gif, etc.)
- **Storage**: Local file system with unique naming
- **Static Serving**: Files served via `/uploads` endpoint

## Frontend Implementation

### Components

#### Profile Component (`frontend/src/components/Profile.jsx`)

- **Responsive Layout**: Grid-based layout with sidebar
- **Dynamic Content**: Shows different sections based on user type
- **Statistics Cards**: Real-time stats display
- **Social Links**: Clickable social media links
- **Loading States**: Spinner during data fetching

#### EditProfile Component (`frontend/src/components/EditProfile.jsx`)

- **Comprehensive Forms**: All profile fields with validation
- **Dynamic Arrays**: Skills, languages, certifications, portfolio
- **File Upload**: Profile picture with preview
- **Real-time Updates**: Form state management
- **Role-based Sections**: Different forms for workers vs clients

### Key Features

#### Form Management

- **Controlled Components**: All inputs are controlled
- **Dynamic Arrays**: Add/remove items from arrays
- **Validation**: Client-side validation with error handling
- **Auto-save**: Optional auto-save functionality

#### Image Upload

- **Preview**: Real-time image preview
- **Validation**: File type and size validation
- **Upload Progress**: Visual feedback during upload
- **Error Handling**: Graceful error handling

#### User Experience

- **Loading States**: Spinners during operations
- **Toast Notifications**: Success/error feedback
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage Examples

### Viewing a Profile

```javascript
// Navigate to profile page
navigate("/profile");

// Profile data is automatically fetched and displayed
```

### Editing a Profile

```javascript
// Navigate to edit page
navigate("/edit-profile");

// Form is pre-populated with current data
// Make changes and save
```

### Uploading Profile Picture

```javascript
// Click camera icon in edit form
// Select image file
// Preview appears immediately
// Save to upload to server
```

## Styling

### Design System

- **Color Scheme**: Green primary (#16a34a)
- **Typography**: Modern sans-serif fonts
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation for cards
- **Borders**: Rounded corners for modern look

### Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Security Considerations

### Backend Security

- **Authentication**: JWT token validation
- **File Upload**: Type and size validation
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: API rate limiting (recommended)

### Frontend Security

- **Input Validation**: Client-side validation
- **File Validation**: File type checking
- **Error Handling**: Graceful error display
- **XSS Prevention**: Proper data sanitization

## Performance Optimizations

### Backend

- **Database Indexing**: Proper indexes on frequently queried fields
- **File Compression**: Image compression for uploads
- **Caching**: Redis caching for profile data (recommended)

### Frontend

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **State Management**: Efficient state updates
- **Bundle Optimization**: Code splitting for better performance

## Future Enhancements

### Planned Features

- **Profile Verification**: ID verification system
- **Portfolio Galleries**: Image galleries for portfolio items
- **Profile Analytics**: View tracking and analytics
- **Advanced Search**: Search by skills, location, rating
- **Profile Templates**: Pre-built profile templates
- **Social Integration**: Direct social media integration

### Technical Improvements

- **CDN Integration**: Cloud storage for images
- **Real-time Updates**: WebSocket for live profile updates
- **Advanced Caching**: Redis for better performance
- **API Versioning**: Proper API versioning
- **Monitoring**: Application performance monitoring

## Troubleshooting

### Common Issues

#### Image Upload Fails

- Check file size (max 5MB)
- Ensure file is an image
- Verify upload directory permissions
- Check network connectivity

#### Profile Not Loading

- Verify authentication token
- Check API endpoint availability
- Ensure database connection
- Check browser console for errors

#### Form Validation Errors

- Check required fields
- Verify email format
- Ensure URL format for social links
- Check character limits

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Check server logs for backend errors
4. Validate database connections
5. Test file upload permissions

## Dependencies

### Backend Dependencies

- `multer`: File upload handling
- `express`: Web framework
- `mongoose`: Database ODM
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT authentication

### Frontend Dependencies

- `react-router-dom`: Routing
- `axios`: HTTP client
- `react-toastify`: Notifications
- `react-icons`: Icon library
- `@radix-ui/react-avatar`: Avatar component

## Installation

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
# Backend
PORT=8000
MONGODB_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Frontend
VITE_API_URL=http://localhost:8000/api
```

This comprehensive profile system provides a solid foundation for user profiles in the WorkMate platform, with room for future enhancements and scalability.
