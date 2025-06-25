import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

const prisma = new PrismaClient();

async function testPostgressConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const connect = () => {
      logger.info('Attempting PostgreSQL connection...', {}, 'DATABASE');
      prisma.$connect()
        .then(() => {
          logger.success('Prisma connected to PostgreSQL successfully', {
            database: 'PostgreSQL',
            orm: 'Prisma'
          }, 'DATABASE');
          resolve();
        })
        .catch(error => {
          logger.error('Prisma PostgreSQL connection error, retrying in 2 seconds', {
            error: error.message,
            retryIn: '2 seconds'
          }, 'DATABASE');
          setTimeout(connect, 2000);
        });
    };
    connect();
  });
}

dotenv.config();
const MONGO_URL = process.env.MONGODB_URL || 'NO STRING LOADED';

const connectMongoDBwithRetry = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const connect = () => {
      logger.info('Attempting MongoDB connection...', {
        url: MONGO_URL.includes('mongodb') ? 'MongoDB URL loaded' : 'No valid MongoDB URL'
      }, 'DATABASE');
      mongoose.connect(MONGO_URL)
        .then(() => {
          logger.success('MongoDB connected successfully', {
            database: 'MongoDB',
            connectionState: mongoose.connection.readyState
          }, 'DATABASE');
          resolve();
        })
        .catch(err => {
          logger.error('MongoDB connection unsuccessful, retrying in 2 seconds', {
            error: err.message,
            retryIn: '2 seconds'
          }, 'DATABASE');
          setTimeout(connect, 2000);
        });
    };
    connect();
  });
}

export { prisma, testPostgressConnection, connectMongoDBwithRetry };

