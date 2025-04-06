# Suggesting Collaboration Times

A web application that helps students find optimal collaboration times based on their schedules and assignments.

## Project Overview

This project was developed as part of a hackathon submission. Check out our [Devpost submission](https://devpost.com/software/studysync-fu8zqo/edit) and [Demo Video](https://youtu.be/dDC9-SWw81c).

## Problem Statement

For time-strapped students, the effort to coordinate with classmates often feels harder than doing the work alone. The pandemic set the stage for this shift – normalizing asynchronous course load and remote learning. Now with rapid advancements in technology – AI tools, digital learning platforms, and instant solutions – solo work has become even easier. As a result, meaningful peer connection is becoming less common.

This issue was brought to our attention by two of our founders who are grading tutors at Harvey Mudd College. Over their last 4 semesters as grutors, they've noticed a continuous decline in students coming in for help.

## Our Solution

Our project is a step toward reversing this trend. We facilitate collaboration by matching students who have shared assignment due dates and overlapping free time; making it easier to plan co-working sessions.

When users enter our website, they are prompted to sign in with Google through a secure Google OAuth integration. After signing in, users grant access to their Google Calendar. The app then scans the calendar to identify:
- Upcoming assignments based on event names and keywords
- Free time blocks where no events are scheduled

The platform analyzes the data and suggests study partners based on:
- Matching/similar assignment due dates
- Shared blocks of free time

In order to protect our user's data, we avoid storing unnecessary personal data and ensure users can opt out or pause matching at any time. Additionally, users only ever see suggested study times of other users and never their entire availability.

## Features

- Google OAuth2 authentication
- Calendar integration to fetch free time slots
- Assignment tracking and due date management
- Smart suggestions for collaboration times
- User profile management
- Real-time availability matching

## Tech Stack

### Backend
- Python 3.x
- Flask (Web Framework)
- Google Calendar API
- MongoDB (Database)
- Firebase Admin SDK
- Flask-CORS

### Frontend
- React.js
- React Router
- React Icons
- CSS3

## Project Structure

```
.
├── backend/
│   ├── app.py              # Main Flask application
│   ├── oauth.py            # Google OAuth2 implementation
│   ├── models.py           # Data models
│   ├── db_utils.py         # Database utilities
│   ├── requirements.txt    # Python dependencies
│   └── data.json           # Local data storage
├── frontend/
│   ├── src/
│   │   ├── Components/     # React components
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Entry point
│   ├── public/             # Static files
│   └── package.json        # Node.js dependencies
└── README.md
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up Google OAuth2 credentials:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Download the credentials and save as `secrets.json` in the backend directory

4. Run the backend server:
   ```bash
   python backend/app.py
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/user/current` - Get current user's profile
- `POST /api/suggestions` - Get collaboration time suggestions
- `POST /api/user` - Create new user
- `GET /api/user/<email>` - Get user by email
- `GET /api/assignments` - Get all assignments

## Environment Variables

Create a `.env` file in the backend directory with:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000
```
