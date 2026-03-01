# CYM Leaders’ Tracker 2026

A modern, responsive web-based church leadership tracker system.

## Features

### Member Portal (index.html)
- No authentication required (Name input only).
- Monthly Devotion Tracker (Calendar view).
- Meeting Attendance Tracker (End-month only).
- Mid-month and End-month submission types.
- **PWA Supported**: Installable on mobile and desktop.

### Admin Portal (admin.html)
- Password protected (default: `admin`).
- Dashboard with summary statistics.
- Detailed reports table with filtering.
- Export functionality.

## Database
Uses **Firebase Firestore** (Collection: `cym_submission`).
Migrated from Trickle Database for portability.

## Tech Stack
- React 18
- TailwindCSS
- Lucide Icons
- Chart.js
- Firebase (Analytics)

## Export & Deployment
See [EXPORT_TO_GITHUB.md](EXPORT_TO_GITHUB.md) for instructions on moving this project to GitHub and handling database migration.
