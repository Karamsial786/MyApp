import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Surface, Button, TextInput, Divider, RadioButton, Snackbar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import CincCoin from '../components/CincCoin';

// Define payment methods
const PAYMENT_METHODS = [
  { id: 'cinc', name: 'CINC Coins', description: 'Pay using your CINC balance' },
  { id: 'paypal', name: 'PayPal', description: 'Pay using PayPal' },
  { id: 'bank', name: 'Direct Bank Transfer', description: 'Transfer directly to our bank account' },
];

// Default renewal price
const DEFAULT_RENEWAL_PRICE = 1800; // CINC

export default function RenewAccountScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  const accountId = route.params?.accountId;
  const platform = route.params?.platform;
  
  const [account, setAccount] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [userPaymentNumber, setUserPaymentNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      if (!accountId) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const accountData = await apiRequest(`/api/ip-accounts/${accountId}`);
        setAccount(accountData);
      } catch (err: any) {
        console.error('Error fetching account details:', err);
        setError(err.data?.message || 'Failed to fetch account details');
        setSnackbarVisible(true);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchAccountDetails();
  }, [accountId]);
  
  // Calculate renewal price
  const getRenewalPrice = () => {
    // In a real app, this might be fetched from the server or calculated based on the account
    return DEFAULT_RENEWAL_PRICE;
  };
  
  // Check if user has enough CINC balance
  const hasEnoughBalance = () => {
    if (!user) return false;
    
    const renewalPrice = getRenewalPrice();
    return parseFloat(user.cincBalance || '0') >= renewalPrice;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
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
      await apiRequest('/api/account-requests', {
        method: 'POST',
        body: JSON.stringify({
          accountId,
          platform: account?.platform || platform,
          paymentMethod: selectedPaymentMethod,
          transactionId: transactionId || undefined,
          userPaymentNumber: userPaymentNumber || undefined,
          accountHolderName: accountHolderName || undefined,
          paymentAmount: getRenewalPrice().toString(),
          isCincPayment: selectedPaymentMethod === 'cinc',
          isRenewal: true,
        }),
      });
      
      // Show success message and navigate back
      setError('Renewal request submitted successfully!');
      setSnackbarVisible(true);
      
      // Reset form
      setSelectedPaymentMethod(null);
      setTransactionId('');
      setUserPaymentNumber('');
      setAccountHolderName('');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error('Error submitting renewal request:', err);
      setError(err.data?.message || 'Failed to submit renewal request');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Renew Account" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Renew Account" />
      
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Account Details</Text>
          
          <View style={styles.accountDetail}>
            <Text style={styles.accountDetailLabel}>Platform:</Text>
            <Text style={styles.accountDetailValue}>{account?.platform || platform}</Text>
          </View>
          
          {account && (
            <>
              <View style={styles.accountDetail}>
                <Text style={styles.accountDetailLabel}>Username:</Text>
                <Text style={styles.accountDetailValue}>{account.username}</Text>
              </View>
              
              <View style={styles.accountDetail}>
                <Text style={styles.accountDetailLabel}>Status:</Text>
                <View style={styles.statusContainer}>
                  <View 
                    style={[
                      styles.statusDot,
                      account.isActive ? styles.activeDot : styles.inactiveDot,
                    ]} 
                  />
                  <Text style={styles.accountDetailValue}>
                    {account.isActive ? 'Active' : 'Expired'}
                  </Text>
                </View>
              </View>
            </>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.renewalPrice}>
            <Text style={styles.renewalPriceLabel}>Renewal Price:</Text>
            <CincCoin value={getRenewalPrice()} size="md" variant="premium" />
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
                  Insufficient balance for renewal
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
        
        <Button
          mode="contained"
          style={styles.submitButton}
          labelStyle={styles.submitButtonText}
          onPress={handleSubmit}
          disabled={loading || !selectedPaymentMethod}
          loading={loading}
        >
          Submit Renewal Request
        </Button>
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
    marginBottom: 16,
  },
  accountDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountDetailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  accountDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#22c55e',
  },
  inactiveDot: {
    backgroundColor: '#ef4444',
  },
  divider: {
    marginVertical: 12,
  },
  renewalPrice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  renewalPriceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
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
  submitButton: {
    marginVertical: 16,
    backgroundColor: '#4f46e5',
    padding: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});