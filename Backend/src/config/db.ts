import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

async function testPostgressConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const connect = () => {
      console.log('Attempting PostgreSQL connection...');
      prisma.$connect()
        .then(() => {
          console.log('Prisma connected to PostgreSQL successfully');
          resolve();
        })
        .catch(error => {
          console.error('Prisma PostgreSQL connection error, retrying in 2 seconds:', error);
          setTimeout(connect, 2000);
        });
    };
    connect();
  });
}



dotenv.config();

dotenv.config();
const MONGO_URL = process.env.MONGODB_URL || 'NO STRING LOADED';

const connectMongoDBwithRetry = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const connect = () => {
      console.log('Attempting MongoDB connection...');
      mongoose.connect(MONGO_URL)
        .then(() => {
          console.log('MongoDB is connected');
          resolve();
        })
        .catch(err => {
          console.error('MongoDB connection unsuccessful, retrying in 2 seconds...', err);
          setTimeout(connect, 2000);
        });
    };
    connect();
  });
}


export { prisma, testPostgressConnection, connectMongoDBwithRetry };

