# KarmicDD Backend

## Description

This is the backend service for KarmicDD, built with Node.js, TypeScript, Prisma, and PostgreSQL. It handles user authentication (including OAuth2 with Google and LinkedIn), data storage, and API endpoints for the frontend.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Installation](#installation)
3.  [Configuration](#configuration)
4.  [Database Setup (Prisma)](#database-setup-prisma)
5.  [OAuth Configuration](#oauth-configuration)
6.  [Running the Server](#running-the-server)
7.  [API Documentation](#api-documentation)
8.  [Environment Variables](#environment-variables)
9.  [Directory Structure](#directory-structure)
10. [Contributing](#contributing)
11. [License](#license)

## Prerequisites

*   Node.js (v18 or higher)
*   npm (v8 or higher)
*   PostgreSQL
*   MongoDB (optional, depending on your data storage needs)

## Installation

1.  Clone the repository:

    ```
    git clone
    cd Backend
    ```

2.  Install dependencies:

    ```
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root directory (see `.env.example` for the required variables).

## Database Architecture

The application uses a hybrid database approach:

- **PostgreSQL** (via Prisma): Handles user authentication, relationships, and analytics data
- **MongoDB**: Stores document data, rich profiles, and content

This architecture optimizes for both data consistency (PostgreSQL) and flexibility (MongoDB).

### Document Storage

Documents uploaded by users are stored and managed through MongoDB. The actual files are saved to the filesystem, while metadata is stored in MongoDB using the `Document` model. This includes:

- File information (name, type, size)
- User associations
- Document categorization
- Access permissions

The PostgreSQL database only tracks document analytics (views and downloads) but does not store the actual documents or their metadata.

## Database Setup (Prisma)

### For New Developers

1.  Ensure PostgreSQL is running.

2.  Set the `DATABASE_URL` environment variable in your `.env` file to point to your PostgreSQL database. Example:

    ```
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    ```

3.  Initialize your database with the current schema:

    ```
    npx prisma db push
    ```

    This command will create all tables defined in the Prisma schema in your database without requiring migration history.

4.  Generate Prisma Client:

    ```
    npx prisma generate
    ```

    This creates the TypeScript client that provides type-safe access to your database.

5.  Start the server:

    ```
    npm run dev
    ```

### Handling Schema Changes

For this project, we use `npx prisma db push` as the primary method for schema changes:

1.  Update the `schema.prisma` file with your changes.

2.  Apply the changes to your database:

    ```
    npx prisma db push
    ```

3.  Regenerate the Prisma Client to reflect the schema changes:

    ```
    npx prisma generate
    ```

4.  Restart your server to use the updated client.

### Working with Existing Databases

If you need to update your Prisma schema to match an existing database:

```
npx prisma db pull
```

This command introspects your database and updates your `schema.prisma` file to match the actual database schema. This is useful when:

- The database schema has been modified outside of Prisma
- You're connecting to an existing database for the first time
- You need to verify your schema matches the actual database

After pulling the schema, always run `npx prisma generate` to update your client.

### Important Note on Migrations

Currently, this project uses `db push` instead of formal migrations due to the hybrid database approach and ongoing development. Formal migrations (`npx prisma migrate dev`) are not currently supported in this project setup without additional configuration.

If you need to track schema changes, please document them in comments or in a separate changelog file.

## OAuth Configuration

1.  **Google OAuth:**
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Navigate to "APIs & Services" -> "Credentials".
    *   Configure the OAuth consent screen.  Set the "Application type" to 'External'.
    *   Create an OAuth 2.0 Client ID of type "Web application".
    *   Set the Authorized JavaScript origins (e.g., `http://localhost:5173`, `https://karmicdd.netlify.app`).
    *   Set the Authorized redirect URIs (e.g., `http://localhost:5000/api/auth/google/callback`, `https://mvp-01.onrender.com/api/auth/google/callback`).
    *   Obtain the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

2.  **LinkedIn OAuth:**
    *   Go to [LinkedIn Developer Portal](https://developer.linkedin.com/).
    *   Create a new application.
    *   Set the Authorized redirect URLs (e.g., `http://localhost:5000/api/auth/linkedin/callback`, `https://mvp-01.onrender.com/api/auth/linkedin/callback`).
    *   Obtain the `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`.

3.  Set the OAuth environment variables in your `.env` file:

    ```
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    LINKEDIN_CLIENT_ID=your_linkedin_client_id
    LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
    ```

## Running the Server

1.  Start the development server:

    ```
    npm run dev
    ```

    This command compiles the TypeScript code and starts the server using nodemon, which automatically restarts the server on file changes.

2.  Build for Production:

    ```
    npm run build
    ```

    This command compiles the TypeScript code into JavaScript files.

## API Documentation

The API documentation is available through Swagger UI at `/api-docs` when the server is running:

```
http://localhost:5000/api-docs  # Local development
https://mvp-01.onrender.com/api-docs  # Production
```

The documentation provides a comprehensive overview of all available endpoints, request/response schemas, and data models. You can also test the API directly from the Swagger UI interface.

### API Documentation Version 2.1.0

The latest update to our API documentation includes:

- Updated Belief System Analysis endpoints with enhanced response schemas
- Detailed documentation for the Gemini 2.0 Flash Thinking AI model integration
- Improved rate limiting information (10 requests per day)
- More comprehensive schema definitions for all data models

Features of the API documentation:

- Interactive API testing
- Detailed request and response schemas
- Authentication flow explanation
- Organized by functional areas (Authentication, Profile, Matching, etc.)
- Support for all API endpoints including:
  - Authentication (register, login, OAuth)
  - Profile management (startup, investor, extended profiles)
  - Matching algorithms
  - Compatibility analysis
  - Belief system analysis with Gemini 2.0 Flash Thinking
  - Questionnaires
  - Financial due diligence
  - Search functionality

## Environment Variables

The following environment variables are required:

*   `PORT`: The port the server will listen on (e.g., `5000`).
*   `NODE_ENV`: Set to `development` or `production`.
*   `API_URL`: The base URL of your API (e.g., `http://localhost:5000` or `https://mvp-01.onrender.com`).
*   `FRONTEND_URL`: The base URL of your frontend application (e.g., `http://localhost:5173` or `https://karmicdd.netlify.app`).
*   `JWT_SECRET`: A secret key used to sign JWT tokens.  Generate a long, random string.
*   `JWT_EXPIRES_IN`: How long JWT tokens are valid for (e.g., `7d`, `1h`).
*   `DATABASE_URL`: The connection string for your PostgreSQL database.
*   `MONGODB_URI`: The connection string for your MongoDB database (if used).
*   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
*   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
*   `LINKEDIN_CLIENT_ID`: Your LinkedIn OAuth Client ID.
*   `LINKEDIN_CLIENT_SECRET`: Your LinkedIn OAuth Client Secret.

## Directory Structure

```
karmicdd-backend/
├── config/
│   ├── db.js               # Database connection configurations
│   ├── passport.js         # Passport.js OAuth configuration
│   └── jwt.js              # JWT configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   └── userController.js   # User management logic
├── middleware/
│   ├── auth.js             # JWT verification middleware
│   └── errorHandler.js     # Global error handling
├── models/
│   ├── postgresql/
│   │   └── User.js         # PostgreSQL user model
│   └── mongodb/
│       └── FormSubmission.js # MongoDB schema
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   └── userRoutes.js       # User management routes
├── utils/
│   ├── passwordUtils.js    # Password hashing utilities
│   └── jwtUtils.js         # JWT generation utilities
├── .env                    # Environment variables (git-ignored)
├── app.js                  # Express application setup
└── server.js               # Server entry point
```

## Contributing

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Push your changes to your fork.
5.  Submit a pull request.

## License
abhi nahi hai dalunga kuch
