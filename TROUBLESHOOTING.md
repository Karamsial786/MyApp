# ReferPay APK Build - Troubleshooting Guide

If you encounter any issues while building the ReferPay APK, this guide may help you resolve them.

## Common Issues and Solutions

### "Command not found" Errors

**Problem:** When typing a command, you see an error like "`command not found`" or "`'npm' is not recognized as an internal or external command`"

**Solution:**
1. Make sure you have Node.js installed properly
2. Close and reopen your command prompt/terminal
3. If using Windows, you might need to restart your computer after installing Node.js

### Can't Log In to Expo

**Problem:** When trying to log in to Expo with `npx eas login`, you get authentication errors

**Solution:**
1. Make sure you're using the correct email/username and password
2. If you forgot your password, visit https://expo.dev and use the "Forgot password" option
3. If you don't have an Expo account, create one at https://expo.dev/signup

### Build Fails with Package Errors

**Problem:** The build process fails with errors about missing packages or dependencies

**Solution:**
1. Make sure you're in the correct directory (mobile-app folder)
2. Run `npm install` again to ensure all dependencies are installed
3. If specific packages are mentioned in the error, try installing them individually:
   ```
   npm install [package-name]
   ```

### APK Build Fails on EAS

**Problem:** The build process starts but fails on the Expo EAS servers

**Solution:**
1. Check the build logs for specific error messages
2. Common issues include:
   - Missing assets: Make sure all required image files are present
   - Configuration issues: Check your app.json and eas.json files
3. If the error mentions specific files or configurations, check those and try again

### Can't Install APK on Android Device

**Problem:** The APK downloads but won't install on your Android device

**Solution:**
1. Make sure your Android device allows installation from unknown sources:
   - Go to Settings > Security > Unknown Sources (or similar path depending on your Android version)
   - Enable the option to allow installation from unknown sources
2. If you get a "Package corrupted" error, try downloading the APK again
3. If you get a "Package conflicts" error, you might need to uninstall any previous version of the app first

### Build Queue Taking Too Long

**Problem:** Your build is stuck in the queue for a very long time

**Solution:**
1. EAS build queues can sometimes be long during peak times
2. Check the build status on the Expo website: https://expo.dev/accounts/[your-username]/projects/referpay/builds
3. Be patient - builds typically take 15-30 minutes, but can take longer during busy periods

## Getting More Help

If you continue to experience issues:

1. Check the Expo documentation: https://docs.expo.dev/build/setup/
2. Visit the Expo forums: https://forums.expo.dev/
3. Search for your error message on Stack Overflow: https://stackoverflow.com/questions/tagged/expo

## Contact Information

If you need direct assistance, consider reaching out to someone with React Native/Expo experience who can help guide you through the process.