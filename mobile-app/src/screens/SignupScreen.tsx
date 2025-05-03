import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Animated,
  Keyboard,
} from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { signup } = useAuth();
  
  // Refs for inputs
  const lastNameInputRef = useRef<RNTextInput>(null);
  const emailInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const referralCodeInputRef = useRef<RNTextInput>(null);
  
  // Form state
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Error states
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  
  // Animation values
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  
  // Start animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else {
      setFirstNameError('');
    }
    
    // Validate last name
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else {
      setLastNameError('');
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  // Handle signup
  const handleSignup = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        ...(referralCode ? { referralCode } : {}),
      };
      
      const verificationToken = await signup(userData);
      
      if (verificationToken) {
        // Navigate to verification screen with email and token
        navigation.navigate('Verify', {
          email,
          token: verificationToken,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate to login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateToLogin}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#334155"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={styles.placeholderView} />
        </View>
        
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            },
          ]}
        >
          <Text style={styles.formTitle}>Create Your Account</Text>
          <Text style={styles.formSubtitle}>Join our community and start earning rewards!</Text>
          
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={() => lastNameInputRef.current?.focus()}
                error={!!firstNameError}
                left={<TextInput.Icon icon="account" />}
              />
              {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
            </View>
            
            <View style={styles.nameField}>
              <TextInput
                ref={lastNameInputRef}
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                error={!!lastNameError}
                left={<TextInput.Icon icon="account" />}
              />
              {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
            </View>
          </View>
          
          <TextInput
            ref={emailInputRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            error={!!emailError}
            left={<TextInput.Icon icon="email" />}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <TextInput
            ref={passwordInputRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            returnKeyType="next"
            onSubmitEditing={() => referralCodeInputRef.current?.focus()}
            error={!!passwordError}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <TextInput
            ref={referralCodeInputRef}
            label="Referral Code (Optional)"
            value={referralCode}
            onChangeText={setReferralCode}
            mode="outlined"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSignup}
            left={<TextInput.Icon icon="ticket-percent" />}
          />
          
          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.signupButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Sign Up
          </Button>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text
                style={[
                  styles.loginLink,
                  { color: theme.colors.primary },
                ]}
              >
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  placeholderView: {
    width: 40,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 1,
    marginRight: 8,
  },
  nameField2: {
    flex: 1,
    marginLeft: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#64748b',
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;