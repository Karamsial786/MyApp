# ReferPay App - Build Guide

This guide explains how to build an APK file for the ReferPay app using Expo's cloud build service.

## Prerequisites
- A computer with internet connection
- Node.js installed (if building locally)
- An Expo account (free signup at https://expo.dev)

## Option 1: Build Using Expo EAS (Recommended)

### Step 1: Extract Project Files
1. Extract all the project files to a directory on your computer

### Step 2: Install Expo CLI
```bash
npm install -g eas-cli
```

### Step 3: Log In to Your Expo Account
```bash
npx eas login
```

### Step 4: Navigate to the Mobile App Directory
```bash
cd mobile-app
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Start the Build Process
```bash
npx eas build -p android --profile preview
```

### Step 7: Follow the On-Screen Instructions
- If asked about a build profile, select "preview" 
- The build will be processed in the cloud
- When complete, you'll receive a download link to your APK file

## Option 2: Find Someone to Help

If you don't have experience with command line tools, consider:
1. Sharing these files with a friend who has technical knowledge
2. Asking them to follow the steps in Option 1
3. Having them send you the final APK file

## Notes About the App

- Package name: com.referpay.app
- Current version: 1.0.0
- The app is configured to build a debug version with the "preview" profile
- The preview profile generates an APK file (not an AAB file)
- The app includes all necessary permissions for its functionality
- All assets (icons, splash screens) are included in the project

## Troubleshooting

If you encounter any issues:
1. Make sure you're in the correct directory (mobile-app)
2. Ensure you're logged into your Expo account
3. Check your internet connection
4. For error details, check the build logs in the Expo website dashboard