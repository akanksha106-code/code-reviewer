require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

const createSampleUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users deleted');
    
    // Create sample users
    const users = await User.create([
      {
        username: 'johnsmith',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123'
      }
    ]);
    
    console.log(`Created ${users.length} sample users`);
    return users;
  } catch (error) {
    console.error('Error creating sample users:', error);
    return [];
  }
};

const createSampleReviews = async (users) => {
  try {
    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Existing reviews deleted');
    
    if (!users || users.length === 0) {
      console.log('No users available to create reviews');
      return;
    }
    
    // Sample code snippets
    const sampleCode = [
      {
        code: `function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n-1);
}`,
        language: 'javascript',
        review: `Good recursive implementation of factorial, but missing:
- Input validation for negative numbers
- Consider iterative implementation for better performance with large inputs
- Add JSDoc comments to explain parameters and return values`
      },
      {
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`,
        language: 'python',
        review: `Bubble sort implementation works correctly but could be improved:
- Add early termination if no swaps occur in a pass
- Consider adding type hints for better readability
- Add docstring explaining the algorithm, parameters, and time complexity`
      }
    ];
    
    const reviews = [];
    
    // Create reviews for each user
    for (const user of users) {
      for (const sample of sampleCode) {
        const review = await Review.create({
          user: user._id,
          codeSubmitted: sample.code,
          language: sample.language,
          aiReview: sample.review
        });
        reviews.push(review);
        
        // Update user's reviews array
        await User.findByIdAndUpdate(
          user._id,
          { $push: { reviews: review._id } }
        );
      }
    }
    
    console.log(`Created ${reviews.length} sample reviews`);
  } catch (error) {
    console.error('Error creating sample reviews:', error);
  }
};

const seedData = async () => {
  const connected = await connectDB();
  
  if (!connected) {
    console.log('Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  const users = await createSampleUsers();
  await createSampleReviews(users);
  
  console.log('Data seeding completed!');
  mongoose.disconnect();
  process.exit(0);
};

seedData(); 