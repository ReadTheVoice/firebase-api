# ReadTheVoice Firebase API

This repository contains the Firebase Cloud Functions API for the ReadTheVoice application. ReadTheVoice is a real-time audio-to-text transcription service designed to enhance accessibility during conferences, lectures, and similar events.  
Please note that this README is a brief overview of the API. For more detailed information, please refer to the code and comments in the `functions/index.js` file.

## How it Works

The API is built with Firebase Cloud Functions and is responsible for managing user accounts, meetings, and transcriptions. Here is a brief overview of the main functionalities:

- **User Management**: The API provides endpoints for user sign up, log in, log out, token verification, account deletion, password reset, and user profile updates.

- **Meeting Management**: The API provides endpoints for creating, deleting, listing, finishing, and updating meetings. It also provides an endpoint for retrieving a specific meeting's details.

- **Transcription Management**: The API is integrated with Deepgram's API for real-time transcription. It manages the storage and distribution of transcriptions to the public.

## Setup and Deployment

The API is deployed using GitHub Actions. On every push to the main branch, the API is automatically deployed to Firebase. The deployment workflow includes steps for setting up Node.js, installing dependencies, and deploying to Firebase using the Firebase CLI.

## Dependencies

The API uses several npm packages, including:

- `firebase-admin` and `firebase-functions` for Firebase Cloud Functions.
- `axios` for making HTTP requests.
- `jsonwebtoken` for handling JSON Web Tokens.
- `nodemailer` for sending emails.
- `handlebars` for templating.

## Node.js Version

The API is built with Node.js and requires Node.js version 18.