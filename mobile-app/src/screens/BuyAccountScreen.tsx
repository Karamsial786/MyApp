import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Surface, Button, TextInput, Divider, RadioButton, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import CincCoin from '../components/CincCoin';

// Define platform options
const PLATFORMS = [
  { id: 1, name: 'TimeBucks', price: 3500 },
  { id: 2, name: 'MicroTasks', price: 3200 },
  { id: 3, name: 'EarnApp', price: 2800 },
  { id: 4, name: 'Honeygain', price: 3000 },
];

// Define payment methods
const PAYMENT_METHODS = [
  { id: 'cinc', name: 'CINC Coins', description: 'Pay using your CINC balance' },
  { id: 'paypal', name: 'PayPal', description: 'Pay using PayPal' },
  { id: 'bank', name: 'Direct Bank Transfer', description: 'Transfer directly to our bank account' },
];

export default function BuyAccountScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [userPaymentNumber, setUserPaymentNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Get selected platform details
  const getSelectedPlatform = () => {
    return PLATFORMS.find(p => p.id === selectedPlatform);
  };
  
  // Check if user has enough CINC balance
  const hasEnoughBalance = () => {
    if (!user || !selectedPlatform) return false;
    
    const selectedPlatformObj = getSelectedPlatform();
    if (!selectedPlatformObj) return false;
    
    return parseFloat(user.cincBalance || '0') >= selectedPlatformObj.price;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!selectedPlatform) {
      setError('Please select a platform');
      setSnackbarVisible(true);
      return;
    }
    
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      setSnackbarVisible(true);
      return;
    }
    
    // Validate payment details
    if (selectedPaymentMethod === 'cinc') {
      if (!hasEnoughBalance()) {
        setError('Insufficient CINC balance');
        setSnackbarVisible(true);
        return;
      }
    } else if (selectedPaymentMethod === 'paypal' || selectedPaymentMethod === 'bank') {
      if (!transactionId.trim()) {
        setError('Please enter the transaction ID');
        setSnackbarVisible(true);
        return;
      }
      
      if (!userPaymentNumber.trim()) {
        setError('Please enter your payment number');
        setSnackbarVisible(true);
        return;
      }
      
      if (!accountHolderName.trim()) {
        setError('Please enter the account holder name');
        setSnackbarVisible(true);
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const platform = getSelectedPlatform();
      
      await apiRequest('/api/account-requests', {
        method: 'POST',
        body: JSON.stringify({
          platformId: selectedPlatform,
          platform: platform?.name,
          paymentMethod: selectedPaymentMethod,
          transactionId: transactionId || undefined,
          userPaymentNumber: userPaymentNumber || undefined,
          accountHolderName: accountHolderName || undefined,
          paymentAmount: platform?.price.toString(),
          isCincPayment: selectedPaymentMethod === 'cinc',
        }),
      });
      
      // Show success message and navigate back
      setError('Account request submitted successfully!');
      setSnackbarVisible(true);
      
      // Reset form
      setSelectedPlatform(null);
      setSelectedPaymentMethod(null);
      setTransactionId('');
      setUserPaymentNumber('');
      setAccountHolderName('');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting account request:', err);
      setError(err.data?.message || 'Failed to submit account request');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Buy Account" />
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Select Platform</Text>
          <Text style={styles.description}>
            Choose the platform you want to purchase access for:
          </Text>
          
          <View style={styles.platformsContainer}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformCard,
                  selectedPlatform === platform.id && styles.selectedPlatformCard,
                ]}
                onPress={() => setSelectedPlatform(platform.id)}
              >
                <Text style={styles.platformName}>{platform.name}</Text>
                <View style={styles.platformPrice}>
                  <CincCoin value={platform.price} size="sm" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Surface>
        
        <Surface style={styles.card}>
          <Text style={styles.title}>Payment Method</Text>
          <Text style={styles.description}>
            Choose how you want to pay:
          </Text>
          
          <RadioButton.Group
            onValueChange={(value) => setSelectedPaymentMethod(value)}
            value={selectedPaymentMethod || ''}
          >
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <RadioButton value={method.id} color="#4f46e5" />
                <View style={styles.paymentMethodTextContainer}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodDescription}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </RadioButton.Group>
          
          {selectedPaymentMethod === 'cinc' && (
            <View style={styles.cincPaymentContainer}>
              <Text style={styles.cincBalanceTitle}>Your CINC Balance:</Text>
              <View style={styles.cincBalance}>
                <CincCoin value={user?.cincBalance || '0'} size="md" />
              </View>
              
              {!hasEnoughBalance() && (
                <Text style={styles.insufficientBalance}>
                  Insufficient balance for selected platform
                </Text>
              )}
            </View>
          )}
          
          {(selectedPaymentMethod === 'paypal' || selectedPaymentMethod === 'bank') && (
            <View style={styles.paymentDetailsContainer}>
              <TextInput
                label="Transaction ID"
                value={transactionId}
                onChangeText={setTransactionId}
                style={styles.input}
                disabled={loading}
              />
              
              <TextInput
                label="Payment Number/Email"
                value={userPaymentNumber}
                onChangeText={setUserPaymentNumber}
                style={styles.input}
                disabled={loading}
              />
              
              <TextInput
                label="Account Holder Name"
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                style={styles.input}
                disabled={loading}
              />
            </View>
          )}
        </Surface>
        
        <Surface style={styles.card}>
          <Text style={styles.title}>Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected Platform:</Text>
            <Text style={styles.summaryValue}>
              {getSelectedPlatform()?.name || 'None selected'}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={styles.summaryValue}>
              {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name || 'None selected'}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <View style={styles.summaryPrice}>
              <CincCoin
                value={getSelectedPlatform()?.price || 0}
                size="md"
                variant="premium"
              />
            </View>
          </View>
          
          <Button
            mode="contained"
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
            onPress={handleSubmit}
            disabled={loading || !selectedPlatform || !selectedPaymentMethod}
            loading={loading}
          >
            Submit Request
          </Button>
        </Surface>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  selectedPlatformCard: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  platformPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  selectedPaymentMethod: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  paymentMethodTextContainer: {
    marginLeft: 8,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  cincPaymentContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cincBalanceTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cincBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insufficientBalance: {
    marginTop: 8,
    color: '#ef4444',
    fontSize: 14,
  },
  paymentDetailsContainer: {
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  summaryPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    padding: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});