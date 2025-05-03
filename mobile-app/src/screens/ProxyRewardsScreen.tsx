import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function ProxyRewardsScreen() {
  const navigation = useNavigation<any>();
  
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Proxy Rewards" />
      <View style={styles.content}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Proxy Rewards</Text>
          <Text style={styles.description}>
            The proxy rewards feature will be available soon. Check back for 
            exciting rewards and bonuses for your proxies.
          </Text>
          <Button 
            mode="contained" 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Button>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  button: {
    backgroundColor: '#4f46e5',
  },
});