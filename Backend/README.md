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
7.  [Environment Variables](#environment-variables)
8.  [Directory Structure](#directory-structure)
9.  [Contributing](#contributing)
10. [License](#license)

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

## Database Setup (Prisma)

1.  Ensure PostgreSQL is running.

2.  Set the `DATABASE_URL` environment variable in your `.env` file to point to your PostgreSQL database. Example:

    ```
    DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
    ```

3.  Generate Prisma Client:

    ```
    npx prisma generate
    ```

4.  Create and apply migrations:

    ```
    npx prisma migrate dev --name init
    npx prisma migrate deploy
    ```

    (Replace `init` with a descriptive name for your initial migration.)

Alternatively, for rapid prototyping in development (use with caution):

```
npx prisma db push
```

## OAuth Configuration

1.  **Google OAuth:**
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project or select an existing one.
    *   Navigate to "APIs & Services" -> "Credentials".
    *   Configure the OAuth consent screen.  Set the "Application type" to 'External'.
    *   Create an OAuth 2.0 Client ID of type "Web application".
    *   Set the Authorized JavaScript origins (e.g., `http://localhost:5173`, `https://yourdomain.com`).
    *   Set the Authorized redirect URIs (e.g., `http://localhost:5000/api/auth/google/callback`, `https://api.yourdomain.com/api/auth/google/callback`).
    *   Obtain the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

2.  **LinkedIn OAuth:**
    *   Go to [LinkedIn Developer Portal](https://developer.linkedin.com/).
    *   Create a new application.
    *   Set the Authorized redirect URLs (e.g., `http://localhost:5000/api/auth/linkedin/callback`, `https://api.yourdomain.com/api/auth/linkedin/callback`).
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

## Environment Variables

The following environment variables are required:

*   `PORT`: The port the server will listen on (e.g., `5000`).
*   `NODE_ENV`: Set to `development` or `production`.
*   `API_URL`: The base URL of your API (e.g., `http://localhost:5000` or `https://api.yourdomain.com`).
*   `FRONTEND_URL`: The base URL of your frontend application (e.g., `http://localhost:5173` or `https://yourdomain.com`).
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