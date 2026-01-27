# Quick Start Guide

## Prerequisites

1. Node.js (v18 or higher)
2. Backend server running on `http://localhost:5000`

## Installation Steps

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Testing the Application

1. **Start the backend server first:**
   ```bash
   cd ../backend
   npm run dev
   ```

2. **Make sure you have academic years in the database:**
   - You can create them via the API: `POST http://localhost:5000/api/academic-years`
   - Body: `{ "yearLabel": "2024", "status": "PAST" }`
   - Body: `{ "yearLabel": "2025", "status": "ACTIVE" }`
   - Body: `{ "yearLabel": "2026", "status": "DRAFT" }`

3. **Create semesters for a year:**
   - `POST http://localhost:5000/api/semesters`
   - Body: `{ "name": "Semester 1", "startDate": "2025-01-01", "endDate": "2025-06-30", "status": "CURRENT", "AcademicYearId": 2 }`

## Features

- ✅ Select Academic Year page with cards
- ✅ Select Semester page with status indicators
- ✅ Navigation between pages
- ✅ API integration with error handling
- ✅ Responsive design
- ✅ Tailwind CSS with custom color palette

## Troubleshooting

**CORS Errors:**
- Make sure the backend has CORS enabled (already configured in `backend/app.js`)

**API Connection Errors:**
- Verify backend is running on port 5000
- Check browser console for detailed error messages

**Images not showing:**
- The app uses gradient backgrounds by default
- See `IMAGES_SETUP.md` for instructions on adding actual images
