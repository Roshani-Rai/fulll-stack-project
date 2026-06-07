🏥 Doctor Appointment Platform
A modern, full-stack web application for booking doctor appointments with AI-powered symptom analysis, secure payments, and prescription management.

✨ Features

👥 Patient Features
Google OAuth Authentication - Secure login with Google
Symptom Checker - AI-powered Gemini integration to analyze symptoms and provide initial guidance
Multi-language Support - Ask symptoms and interact in Hindi and English
Voice Input - Send voice messages and audio reports to doctors
Doctor Discovery - Browse, search, and filter doctors
Ratings & Reviews - Rate and review doctors after appointments
Easy Booking - Intuitive appointment scheduling interface
Secure Payments - Razorpay integration for appointment payments
Prescription Management - Download prescriptions anytime
Medical Reports - Upload and attach medical reports to appointments
Password Management - Secure password reset and account recovery


👨‍⚕️ Doctor Features

Appointment Management - View and manage patient appointments
Prescription Creation - Add prescriptions only after payment confirmation
Cancellation Policy - Cancel appointments with automated refund processing
Patient History - Access patient medical history and previous prescriptions
Availability Management - Set working hours and available time slots


🛡️ Admin Features


Platform Management - Manage doctors, users, and appointments
Refund Processing - Handle refunds for cancelled appointments
Analytics Dashboard - Track bookings, revenue, and platform metrics
Content Moderation - Moderate reviews and ratings


🏗️ Tech Stack

Frontend

React.js - UI framework
Tailwind CSS / Material-UI - Styling
Axios - HTTP client
Redux / Context API - State management
React Router - Navigation

Backend

Node.js + Express - Server framework
MongoDB - Database
JWT - Authentication tokens
Google OAuth 2.0 - Social authentication
Gemini API - AI symptom analysis
Razorpay API - Payment processing
Nodemailer - Email notifications

Additional Services

Firebase Storage - File storage for prescriptions and reports
Twilio / Voice API - Voice message handling
SendGrid / Gmail SMTP - Email notifications

🚀 Getting Started

Prerequisites
Bash
Environment Variables
Create a .env file in the root directory:
Env
Installation
Clone the repository
Bash
Install backend dependencies
Bash
Install frontend dependencies
Bash
Start MongoDB
Bash
Run the backend server
Bash
Run the frontend
Bash
The application will be available at http://localhost:4000

Code
🔐 API Endpoints

Authentication

POST /api/auth/google - Google OAuth login
POST /api/auth/register - User registration
POST /api/auth/login - Email/password login
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password with token


Appointments

GET /api/appointments - Get user's appointments
POST /api/appointments - Book appointment
GET /api/appointments/:id - Get appointment details
PUT /api/appointments/:id - Update appointment
DELETE /api/appointments/:id - Cancel appointment


Doctors

GET /api/doctors - List all doctors
GET /api/doctors/:id - Get doctor details
POST /api/doctors/search - Search doctors by specialization


Payments

POST /api/payments/create-order - Create Razorpay order
POST /api/payments/verify - Verify payment
POST /api/payments/refund - Process refund


Prescriptions

POST /api/prescriptions - Add prescription (doctor only)
GET /api/prescriptions/:appointmentId - Get prescription

Gemini (AI)

POST /api/ai/analyze-symptoms - Analyze symptoms with Gemini
POST /api/ai/analyze-report - Analyze medical report


🎯 Usage Examples

Patient Booking an Appointment
Login with Google
Use Symptom Checker to describe symptoms in English or Hindi
Browse doctor recommendations
Select appointment time slot
Complete payment via Razorpay
Download prescription after doctor visit
Doctor Prescribing
View paid appointments
Access patient details and medical history
Create and upload prescription
Patient receives notification and can download
Voice & Reports
Patients can send voice messages describing symptoms
Upload medical reports directly from device
Doctor reviews and responds with guidance


🔄 Payment Flow

Code
Refund Process:
Patient cancels: Auto-refund to Razorpay account
Doctor cancels: Admin processes refund
Failed appointment: Automatic refund initiated

🌐 Multi-language Support

Currently supports:
English - Default
Hindi - Full UI translation + Gemini interaction
To add more languages, update the i18n configuration in /frontend/src/locales/




🙏 Acknowledgments

Gemini API - For AI symptom analysis
Razorpay - For seamless payment processing
Google OAuth - For secure authentication
MongoDB - For reliable data storage
All open-source contributors


📊 Project Statistics

Frontend Components: 20+
API Endpoints: 25+
Database Models: 8
Supported Languages: 2
Active Features: 15+
Made with ❤️ by [Roshani Rai]
Star ⭐ this repository if you find it helpful!
