# Code Review App Backend

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/code-review-app
JWT_SECRET=your_jwt_secret_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Google Gemini API Integration

This application uses the Google Gemini API for generating AI code reviews. For development, a mock service is provided.

To use the real Google Gemini API:

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your `.env` file:

```bash
GOOGLE_GEMINI_KEY=your_api_key_here
```

4. To enable the real API, modify `src/controllers/ai.controller.js` to use the real service instead of the mock service.

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start MongoDB:
   ```bash
   docker-compose up -d mongodb
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The server will be available at http://localhost:3000.

## API Routes

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login a user
- GET `/api/reviews` - Get all reviews
- POST `/api/ai/review` - Generate a code review

## Development Notes

- Mock AI service is used by default for reliable development
- To implement the real Google Gemini API, follow the instructions above
