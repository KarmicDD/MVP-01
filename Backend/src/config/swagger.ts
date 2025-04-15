import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// Define Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KarmicDD API Documentation',
      version: '2.0.0',
      description: 'API documentation for the KarmicDD platform. The API enables interaction with profiles, questionnaires, matching algorithms, and search functionality to connect startups with potential investors.',
      contact: {
        name: 'KarmicDD Support',
        url: 'https://karmicdd.netlify.app',
        email: 'support@karmicdd.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://karmicdd.netlify.app/terms'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.karmic-dd.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/**/*.ts',
    './src/swagger/*.ts',
    './src/swagger/**/*.yaml'  // Include all YAML files in the swagger directory
  ]
};

export const specs = swaggerJsdoc(options);
