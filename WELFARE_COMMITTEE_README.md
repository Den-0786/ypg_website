# Welfare Committee Management System

## Overview

The Welfare Committee Management System is a comprehensive feature that allows administrators to manage welfare committee members with full CRUD operations, real-time validation, and modern UI/UX.

## Features

### ✅ **Core Functionality**

- **Add New Members** - Complete form with validation
- **Edit Members** - Update existing member information
- **Delete Members** - Soft delete (remove) and hard delete (permanent)
- **View Members** - Grid layout with member cards
- **Search & Filter** - Search by name, email, phone; filter by position
- **Sort Options** - Sort by name, position, or congregation

### ✅ **Real-time Validation**

- **Email Validation** - Ensures valid email format and uniqueness
- **Phone Validation** - Ghana phone number format (+233 or 0 followed by 9 digits)
- **Required Fields** - All fields are mandatory with proper error messages
- **File Validation** - Image upload with size and type validation

### ✅ **Modern UI/UX**

- **Theme Toggle** - Light/Dark mode with persistent storage
- **Responsive Design** - Works on all screen sizes
- **Loading States** - Visual feedback during operations
- **Toast Notifications** - Success and error messages
- **Hover Effects** - Interactive elements with smooth transitions

### ✅ **Data Management**

- **Database Integration** - PostgreSQL with proper indexing
- **Image Upload** - Profile picture support (5MB max)
- **Soft Delete** - Recoverable deletion with `deleted_at` timestamp
- **Audit Trail** - Created and updated timestamps

## Database Schema

```sql
CREATE TABLE welfare_committee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    congregation VARCHAR(255) NOT NULL,
    picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
```

## API Endpoints

### GET `/api/welfare-committee`

- Fetches all active committee members
- Returns: `{ success: true, members: [...] }`

### POST `/api/welfare-committee`

- Creates a new committee member
- Accepts: FormData with name, email, phone, position, congregation, picture
- Returns: `{ success: true, member: {...}, message: "..." }`

### GET `/api/welfare-committee/[id]`

- Fetches a specific committee member
- Returns: `{ success: true, member: {...} }`

### PUT `/api/welfare-committee/[id]`

- Updates an existing committee member
- Accepts: FormData with updated fields
- Returns: `{ success: true, member: {...}, message: "..." }`

### DELETE `/api/welfare-committee/[id]`

- Deletes a committee member (soft or hard)
- Accepts: `{ hardDelete: boolean }`
- Returns: `{ success: true, message: "..." }`

## Setup Instructions

### 1. Create Database Table

Run the database setup script:

```bash
node scripts/create-welfare-committee-table.js
```

### 2. Access the Feature

1. Login to the admin dashboard
2. Navigate to "Welfare Committee" in the sidebar
3. Start adding committee members

## Committee Positions

- Chairman
- Vice Chairman
- Secretary
- Treasurer
- Financial Secretary
- Organizing Secretary
- Public Relations Officer
- Member

## Congregations

- Emmanuel Congregation Ahinsan
- Peniel Congregation Esreso No1
- Mizpah Congregation Odagya No1
- Christ Congregation Ahinsan Estate
- Ebenezer Congregation Dompaose Aprabo
- Favour Congregation Esreso No2
- Liberty Congregation High Tension
- NOM Kuwait
- Odagya No2 Preaching Point Odagya
- Kokobriko Preaching Point Kokobriko

## Usage

### Adding a New Member

1. Click "Add Member" button
2. Fill in all required fields:
   - Full Name
   - Email (must be unique)
   - Phone Number (Ghana format)
   - Position (select from dropdown)
   - Congregation (select from dropdown)
   - Profile Picture (optional, max 5MB)
3. Click "Save"

### Editing a Member

1. Click the three-dot menu on any member card
2. Select "Edit"
3. Modify the desired fields
4. Click "Update"

### Deleting a Member

1. Click the three-dot menu on any member card
2. Choose:
   - "Remove" for soft delete (recoverable)
   - "Delete Permanently" for hard delete (irreversible)

### Searching and Filtering

- Use the search bar to find members by name, email, or phone
- Click "Filters" to filter by position
- Use the sort dropdown to sort by name, position, or congregation
- Toggle sort order with the arrow button

## Technical Details

### Validation Rules

- **Name**: Minimum 2 characters, required
- **Email**: Valid email format, must be unique, required
- **Phone**: Ghana format (+233 or 0 + 9 digits), required
- **Position**: Must be selected from predefined list
- **Congregation**: Must be selected from predefined list
- **Picture**: Optional, max 5MB, image files only

### File Structure

```
src/app/admin/components/WelfareCommittee.js     # Main component
src/app/api/welfare-committee/route.js           # Main API routes
src/app/api/welfare-committee/[id]/route.js      # Individual member routes
database/welfare_committee_schema.sql            # Database schema
scripts/create-welfare-committee-table.js        # Setup script
```

### Dependencies

- React hooks (useState, useEffect)
- Lucide React icons
- Framer Motion (for animations)
- FormData API (for file uploads)
- PostgreSQL (database)

## Future Enhancements

- Bulk import/export functionality
- Advanced filtering options
- Member activity tracking
- Integration with main website display
- Email notifications
- Profile picture cropping/editing
- Committee member roles and permissions
