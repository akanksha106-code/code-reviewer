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