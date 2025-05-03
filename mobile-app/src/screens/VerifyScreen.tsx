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
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, VerificationData } from '../contexts/AuthContext';

const VerifyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const theme = useTheme();
  
  // Get params from navigation
  const { email, token } = route.params || {};
  
  // Access auth context
  const { verifyEmail } = useAuth();
  
  // Verification code state
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  
  // Refs for input fields
  const inputRefs = useRef<Array<RNTextInput | null>>(Array(6).fill(null));
  
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
    
    // Focus first input field
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 500);
  }, []);
  
  // Handle code verification
  const handleVerify = async () => {
    Keyboard.dismiss();
    
    // Join code array into a string
    const verificationCode = code.join('');
    
    // Validate code
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const verificationData: VerificationData = {
        email,
        token,
      };
      
      const result = await verifyEmail(verificationCode, verificationData);
      
      if (result) {
        setSuccess(true);
        // Navigation will be handled by AuthContext
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle code input
  const handleCodeChange = (text: string, index: number) => {
    // Update the code array
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-focus next input if current input is filled
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // Handle backspace key
  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  // Go back to login
  const goToLogin = () => {
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
            onPress={goToLogin}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#334155"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Email</Text>
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
          {success ? (
            <View style={styles.successContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={60}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.successTitle}>Verification Successful!</Text>
              <Text style={styles.successMessage}>
                Your email has been verified. You're now being redirected to your account.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.formTitle}>Email Verification</Text>
              <Text style={styles.formSubtitle}>
                We've sent a verification code to {email}. Please enter the code below.
              </Text>
              
              <View style={styles.codeContainer}>
                {Array(6).fill(0).map((_, index) => (
                  <View
                    key={`code-input-${index}`}
                    style={styles.codeInputWrapper}
                  >
                    <TextInput
                      ref={(input) => {
                        inputRefs.current[index] = input;
                      }}
                      style={styles.codeInput}
                      value={code[index]}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      selectionColor={theme.colors.primary}
                      selectTextOnFocus
                    />
                  </View>
                ))}
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <Button
                mode="contained"
                onPress={handleVerify}
                style={styles.verifyButton}
                loading={isLoading}
                disabled={isLoading || code.join('').length !== 6}
              >
                Verify
              </Button>
              
              <TouchableOpacity style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Didn't receive the code? <Text style={[styles.resendLink, { color: theme.colors.primary }]}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// TextInput component for verification code
const TextInput = React.forwardRef((props: any, ref) => {
  const theme = useTheme();
  
  return (
    <RNTextInput
      {...props}
      ref={ref}
      style={[
        props.style,
        {
          borderColor: theme.colors.primary,
          color: theme.colors.primary,
        },
      ]}
    />
  );
});

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
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInputWrapper: {
    width: 48,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#64748b',
  },
  resendLink: {
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default VerifyScreen;