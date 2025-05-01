import { verifyTaskWithAI, isDataNewerThanCache, getTimestampForData } from '../controllers/taskController';
import TaskVerificationCacheModel from '../models/TaskVerificationCache';
import TaskModel from '../models/Task';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test task verification
const testTaskVerification = async () => {
  try {
    // Create a mock task
    const mockTask = {
      _id: new mongoose.Types.ObjectId(),
      userId: 'test-user-id',
      title: 'Complete your profile',
      description: 'Add basic information about your startup',
      dueDate: new Date(),
      priority: 'high' as 'high', // Type assertion to match Task interface
      category: 'profile' as 'profile', // Type assertion to match Task interface
      completed: false,
      aiVerified: false,
      // Add required properties from Document interface
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create mock user data
    const mockUserData = {
      userId: 'test-user-id',
      profile: {
        companyName: 'Test Company',
        industry: 'Technology',
        location: 'San Francisco',
        updatedAt: new Date()
      }
    };

    console.log('Testing task verification with Gemini 2.0 Flash Lite...');

    // Verify task with type assertion to match Task interface
    const result = await verifyTaskWithAI(mockTask as any, mockUserData);
    console.log('Verification result:', result);

    // Check if result was cached
    const cachedResult = await TaskVerificationCacheModel.findOne({
      userId: 'test-user-id',
      taskId: mockTask._id.toString()
    });

    console.log('Cached result found:', !!cachedResult);
    if (cachedResult) {
      console.log('Cached verification result:', cachedResult.result);
      console.log('Data dependencies:', cachedResult.dataDependencies);
    }

    // Test data dependency tracking
    console.log('\nTesting data dependency tracking...');

    // Create a test task in the database
    const testTask = new TaskModel({
      userId: 'test-user-id',
      title: 'Test data dependencies',
      description: 'This is a test task for data dependencies',
      dueDate: new Date(),
      priority: 'medium',
      category: 'profile',
      completed: false,
      aiVerified: false
    });

    await testTask.save();
    // Explicitly type the _id as mongoose.Types.ObjectId
    console.log('Test task created:', (testTask._id as mongoose.Types.ObjectId).toString());

    // Create initial user data
    const initialUserData = {
      userId: 'test-user-id',
      profile: {
        companyName: 'Initial Company',
        industry: 'Initial Industry',
        location: 'Initial Location',
        updatedAt: new Date(Date.now() - 60000) // 1 minute ago
      }
    };

    // Verify task with initial data
    console.log('Verifying task with initial data...');
    const initialResult = await verifyTaskWithAI(testTask as any, initialUserData);
    console.log('Initial verification result:', initialResult);

    // Get the cached result
    const initialCache = await TaskVerificationCacheModel.findOne({
      userId: 'test-user-id',
      taskId: (testTask._id as mongoose.Types.ObjectId).toString()
    });

    console.log('Initial cache created:', !!initialCache);

    // Create updated user data
    const updatedUserData = {
      userId: 'test-user-id',
      profile: {
        companyName: 'Updated Company',
        industry: 'Updated Industry',
        location: 'Updated Location',
        updatedAt: new Date() // Now
      }
    };

    // Test if data is detected as newer
    const dataDependencies = {
      profileUpdated: getTimestampForData(updatedUserData.profile),
      documentsUpdated: new Date(0),
      questionnairesUpdated: new Date(0),
      financialsUpdated: new Date(0),
      matchesUpdated: new Date(0)
    };

    const isNewer = isDataNewerThanCache('profile', initialCache, dataDependencies);
    console.log('Is data newer than cache?', isNewer);

    // Verify task with updated data
    console.log('Verifying task with updated data...');
    const updatedResult = await verifyTaskWithAI(testTask as any, updatedUserData);
    console.log('Updated verification result:', updatedResult);

    // Get the updated cached result
    const updatedCache = await TaskVerificationCacheModel.findOne({
      userId: 'test-user-id',
      taskId: (testTask._id as mongoose.Types.ObjectId).toString()
    });

    console.log('Cache updated:',
      updatedCache?.dataTimestamp && initialCache?.dataTimestamp
        ? updatedCache.dataTimestamp > initialCache.dataTimestamp
        : 'Cannot compare timestamps',
      'New timestamp:', updatedCache?.dataTimestamp
    );

    // Clean up test data
    await TaskModel.deleteOne({ _id: testTask._id });
    await TaskVerificationCacheModel.deleteMany({
      userId: 'test-user-id',
      taskId: {
        $in: [
          mockTask._id.toString(),
          (testTask._id as mongoose.Types.ObjectId).toString()
        ]
      }
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Test completed');
  } catch (error) {
    console.error('Test error:', error);
    await mongoose.disconnect();
  }
};

// Run the test
connectDB().then(() => {
  testTaskVerification();
});
