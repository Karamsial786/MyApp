# ReferPay - Cross-Platform Referral Rewards Platform

A sophisticated cross-platform referral rewards platform that seamlessly bridges mobile and web experiences, enabling users to discover, share, and earn rewards across multiple devices.

## Key Technologies

- React Native for cross-platform mobile development
- TypeScript for type-safe code
- Shadcn/ui for modern component design
- GSAP for smooth animations
- Tailwind CSS for responsive styling
- PostgreSQL database for data persistence
- Express.js backend
- Drizzle ORM for database interactions

## Features

- User registration and authentication
- Referral code generation and management
- Tracking of referral relationships
- Reward system with milestones
- Spin wheel rewards for engagement
- Daily gifts for user retention
- Support ticket system
- Account management
- Withdrawal requests

## Project Structure

- `/server` - Backend Express.js server
- `/shared` - Shared types and schemas
- `/mobile-app` - React Native mobile application
- `/client` - Web frontend

## Database Setup

The project uses PostgreSQL with Drizzle ORM. Database models are defined in `/shared/schema.ts`.

## Getting Started

1. Install dependencies: `npm install`
2. Set up database: Make sure PostgreSQL is running and DATABASE_URL is set
3. Run migration: `npm run db:push`
4. Start the application: `npm run dev`

## Mobile App

The mobile app is built with React Native and can be run using the Expo CLI.