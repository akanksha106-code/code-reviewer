# Code Reviewer - Powered by Gemini AI

A modern code review application using Google's Gemini AI to analyze code and provide detailed feedback on quality, best practices, and potential improvements.



## Features

- 🚀 **Real-time Code Analysis**: Get immediate feedback on your code
- 🔍 **Detailed Code Reviews**: Receive comprehensive analysis from an AI with senior developer expertise
- 💡 **Improvement Suggestions**: Get actionable recommendations to improve your code
- ✨ **Modern UI**: Clean, intuitive interface for a seamless experience

## Prerequisites

- Node.js v18 or higher
- Google Gemini API key (for the AI powered reviews)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/akanksha106-code/code-reviewer.git
cd code-reviewer
```

### 2. Set up the Backend

```bash
cd BackEnd
npm install

# Create a .env file with your Gemini API key
echo "GOOGLE_GEMINI_KEY=your_gemini_api_key_here" > .env

# Start the backend server
node server.js
```

The backend will run on http://localhost:3000

### 3. Set up the Frontend

```bash
cd ../Frontend
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on http://localhost:5173

## Environment Variables

### Backend

The backend requires the following environment variables:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/code-reviewer

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# API Keys
GOOGLE_GEMINI_KEY=your_gemini_api_key_here
```

Copy the `.env.example` file to `.env` and update the values accordingly:

```bash
cd BackEnd
cp .env.example .env
```

### Frontend

The frontend requires the following environment variables:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000/api
```

Copy the frontend `.env.example` file:

```bash
cd Frontend
cp .env.example .env
```

## Docker Setup

This application can be run using Docker containers. Make sure you have Docker and Docker Compose installed on your system.

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd code-review-app
```

2. Set up environment variables:
```bash
# Create a .env file in the root directory
echo "GOOGLE_GEMINI_KEY=your_gemini_api_key_here" > .env
```

3. Start the application using Docker Compose:
```bash
docker-compose up --build
```

This will start both the frontend and backend services:
- Frontend will be available at: http://localhost:5173
- Backend will be available at: http://localhost:3000

To stop the application:
```bash
docker-compose down
```

### Services included in Docker setup:
- Frontend (React): http://localhost:5173
- Backend (Node.js): http://localhost:3000
- MongoDB: mongodb://localhost:27017

The MongoDB data is persisted using a Docker volume named `mongodb_data`.

### Development with Docker

The Docker setup includes volume mounts for both frontend and backend, enabling hot-reload during development. Any changes you make to the source code will be reflected immediately in the running containers.

## Usage

1. Enter your code in the editor on the left side
2. Click the "Review Code" button
3. View the AI-generated review on the right side

## Project Structure

```
code-reviewer/
├── BackEnd/             # Express.js backend
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── app.js       # Express app setup
│   ├── .env             # Environment variables
│   └── server.js        # Server entry point
│
└── Frontend/            # React frontend
    ├── public/          # Static assets
    └── src/             # React components and styles
```

## Technologies Used

### Backend
- Node.js
- Express.js
- Google Generative AI (@google/generative-ai)

### Frontend
- React
- Vite
- CSS3
- Prism.js (code highlighting)
- Axios (API requests)

## License

MIT

## Acknowledgements

- Google Gemini AI for providing the code review capabilities
- React and the open-source community for the amazing tools