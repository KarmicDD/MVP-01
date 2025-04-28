# KarmicDD Profile System Documentation

## Overview

The KarmicDD profile system allows users to view and share profiles in a user-friendly way. This document explains how the profile fetching and viewing system works, including URL formats, authentication requirements, and document visibility.

## URL Structure

The profile system uses a unified approach with two main URL formats:

1. **Company Name-based URLs**: `/:identifier`
   - Example: `/Cred%20Advisors%20Pvt%20Ltd`
   - This is the primary way to access profiles
   - The identifier is the company name (URL-encoded)
   - Used for both public viewing and sharing with others

2. **Share Token-based URLs**: `/shared-profile/:identifier`
   - Example: `/shared-profile/f374fd3b023363b66bd168da0707c9ede9166a960a2bc2859712bf8b7697a7d6`
   - Used for temporary sharing of profiles
   - The identifier is a secure token that expires after a set period

Both URL formats are handled by the same `ViewProfilePage` component, which determines the appropriate data fetching method based on the URL path.

## Profile Fetching Process

### Company Name-based Profile Fetching

When a user visits a URL like `/Cred%20Advisors%20Pvt%20Ltd`, the system:

1. Decodes the URL-encoded company name
2. Searches for startups with that company name using the search API
3. If no startup is found, searches for investors with that company name
4. If still no match, tries to fetch the profile directly using the identifier as a userId
5. If found, displays the profile with appropriate visibility settings
6. If not found, shows a helpful error message with navigation options

### Share Token-based Profile Fetching

When a user visits a URL like `/shared-profile/f374fd3b...`, the system:

1. Uses the share token to fetch the profile directly
2. If the token is valid and not expired, displays the profile
3. If the token is invalid or expired, shows an error message

## Authentication and Visibility

The profile system handles different authentication states:

### For Non-Logged-In Users

- Can view basic profile information
- Cannot see private documents
- See a call-to-action to sign up for KarmicDD

### For Logged-In Users

- Can view more detailed profile information
- Can see public documents uploaded by the profile owner
- Cannot see private documents (only visible to the profile owner)
- Have access to navigation to the dashboard and other authenticated features

## Document Visibility

Documents in the system have two visibility states:

1. **Public Documents**
   - Visible to all logged-in users
   - Used for sharing general information with potential matches
   - Accessible through the Documents tab when viewing a profile

2. **Private Documents**
   - Only visible to the profile owner
   - Used for sensitive information that shouldn't be shared
   - Not accessible to other users, even when logged in

## Implementation Details

### Key Components

- **ViewProfilePage**: The main component that handles both URL formats
- **ProfileService**: Contains API methods for fetching profiles and documents
- **DocumentUpload**: Handles document management with visibility controls

### API Endpoints

- `/profile/documents/public/:userId`: Fetches public documents for a specific user
- `/profile/shared/:shareToken`: Fetches a profile using a share token
- `/search/startups` and `/search/investors`: Used to search for profiles by company name

## Best Practices

1. **URL Sharing**: Share the company name-based URL for permanent links (e.g., `/Cred%20Advisors%20Pvt%20Ltd`)
2. **Temporary Sharing**: Use the share token URL for temporary access (e.g., `/shared-profile/token`)
3. **Document Visibility**: Mark documents as public only if they contain information that can be shared with all users
4. **Profile Completeness**: Fill out all profile fields to improve searchability and matching

## Troubleshooting

- If a profile cannot be found by company name, try using the search function in the dashboard
- If a share token link is not working, it may have expired - request a new share link
- If documents are not visible, check if they are marked as public
- If you cannot access your own documents, ensure you are logged in and viewing your own profile
