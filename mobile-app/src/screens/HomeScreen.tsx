import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, ProgressBar } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.welcome}>
          Welcome, {user?.firstName || 'User'}!
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Your Referral Stats</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>0</Text>
              <Text variant="bodySmall">Referrals</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>$0</Text>
              <Text variant="bodySmall">Earned</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>$0</Text>
              <Text variant="bodySmall">Pending</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text variant="headlineMedium" style={styles.referralCode}>{user?.referralCode || 'DEMO123'}</Text>
            <Button mode="contained" style={styles.copyButton}>
              Copy
            </Button>
          </View>
          <Text variant="bodySmall" style={styles.codeInfo}>
            Share this code with friends to earn rewards when they sign up!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Next Milestone</Text>
          <Text variant="titleSmall" style={styles.milestone}>5 Referrals = $50 Bonus</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={0} color="#0369a1" style={styles.progressBar} />
            <Text variant="bodySmall">0/5 referrals</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>How It Works</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="titleSmall">Share Your Code</Text>
              <Text variant="bodySmall">Send your unique referral code to friends and family</Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="titleSmall">Friends Sign Up</Text>
              <Text variant="bodySmall">They create an account using your referral code</Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="titleSmall">Earn Rewards</Text>
              <Text variant="bodySmall">You earn $10 for each successful referral</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcome: {
    color: '#0369a1',
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#0369a1',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#0369a1',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  referralCode: {
    fontWeight: 'bold',
  },
  copyButton: {
    backgroundColor: '#0369a1',
  },
  codeInfo: {
    marginTop: 10,
    color: '#64748b',
  },
  milestone: {
    marginVertical: 10,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    marginVertical: 10,
    borderRadius: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0369a1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
});

export default HomeScreen;