# ReferPay APK Build - Visual Guide

This guide will help you build the ReferPay app APK file using simple step-by-step instructions with visual cues.

## Step 1: Download the Project Files
Download all the project files from Replit by clicking the three dots in the top-right corner and selecting "Download as zip".

## Step 2: Extract the Files
Extract the downloaded zip file to a folder on your computer.

## Step 3: Install Node.js (if not already installed)
1. Go to https://nodejs.org/
2. Download the "LTS" version
3. Run the installer and follow the prompts

## Step 4: Open Command Prompt (Windows) or Terminal (Mac/Linux)
- **Windows**: Press Windows key, type "cmd" and press Enter
- **Mac**: Press Command+Space, type "terminal" and press Enter
- **Linux**: Press Ctrl+Alt+T

## Step 5: Navigate to the Project Folder
Type the following command, replacing `/path/to/project` with the actual path where you extracted the files:

```
cd /path/to/project/mobile-app
```

## Step 6: Install Necessary Tools
Type the following command and press Enter:

```
npm install -g eas-cli
```

## Step 7: Log In to Expo
Type the following command and press Enter:

```
npx eas login
```

When prompted:
- Enter your Expo username or email
- Enter your password

## Step 8: Install Project Dependencies
Type the following command and press Enter:

```
npm install
```

Wait for the installation to complete (this may take a few minutes).

## Step 9: Start the Build Process
Type the following command and press Enter:

```
npx eas build -p android --profile preview
```

## Step 10: Follow the Prompts
- If asked if you want to create a new build profile, type "y" and press Enter
- If asked about creating a keystore, type "y" and press Enter
- Wait for the build to be queued and processed (this can take 15-30 minutes)

## Step 11: Get Your APK
When the build completes:
1. You'll see a URL in the terminal
2. Open that URL in your web browser
3. Click the "Download" button to get your APK file

## Step 12: Install on Your Android Device
1. Transfer the APK file to your Android device (via email, USB, etc.)
2. On your Android device, tap the APK file
3. If prompted about security settings, go to Settings and enable "Install from Unknown Sources"
4. Complete the installation

Your ReferPay app is now installed and ready to use!