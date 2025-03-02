import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma connected to PostgreSQL successfully');
  } catch (error) {
    console.error('Prisma PostgreSQL connection error:', error);
    process.exit(1);
  }
}


dotenv.config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit on failure
  }
};

export { prisma, testConnection, connectMongoDB };

