import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider, Avatar } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const ReferralScreen = () => {
  const { user } = useAuth();
  
  // In a real app, this would come from API
  const referrals = [];

  const handleShare = () => {
    // Handle sharing referral code
    console.log('Share referral code:', user?.referralCode);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text variant="headlineMedium" style={styles.referralCode}>{user?.referralCode || 'DEMO123'}</Text>
            <Button mode="contained" style={styles.copyButton}>
              Copy
            </Button>
          </View>
          
          <Button 
            mode="contained" 
            icon="share-variant" 
            style={styles.shareButton}
            onPress={handleShare}
          >
            Share Your Code
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Referral Rewards</Text>
          
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, styles.blueBackground]}>
                <Text style={styles.rewardIconText}>1</Text>
              </View>
              <Text style={styles.rewardValue}>$10</Text>
              <Text variant="bodySmall">per referral</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, styles.blueBackground]}>
                <Text style={styles.rewardIconText}>5</Text>
              </View>
              <Text style={styles.rewardValue}>$50</Text>
              <Text variant="bodySmall">bonus</Text>
            </View>
            
            <View style={styles.rewardItem}>
              <View style={[styles.rewardIcon, styles.blueBackground]}>
                <Text style={styles.rewardIconText}>10</Text>
              </View>
              <Text style={styles.rewardValue}>$100</Text>
              <Text variant="bodySmall">bonus</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Your Referrals</Text>
          
          {referrals.length > 0 ? (
            referrals.map((referral, index) => (
              <View key={index}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.referralItem}>
                  <Avatar.Text 
                    size={40} 
                    label={`${referral.firstName.charAt(0)}${referral.lastName.charAt(0)}`} 
                    backgroundColor="#0369a1" 
                  />
                  <View style={styles.referralInfo}>
                    <Text variant="titleSmall">{referral.firstName} {referral.lastName}</Text>
                    <Text variant="bodySmall">Joined {referral.joinDate}</Text>
                  </View>
                  <View style={styles.referralStatus}>
                    <Text variant="titleSmall" style={styles.referralAmount}>${referral.amount}</Text>
                    <Text variant="bodySmall" style={styles.referralStatusText}>{referral.status}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>You haven't referred anyone yet.</Text>
              <Text variant="bodySmall" style={styles.emptySubtext}>
                Share your referral code with friends to start earning rewards!
              </Text>
              <Button 
                mode="outlined" 
                style={styles.getStartedButton}
                onPress={handleShare}
              >
                Get Started
              </Button>
            </View>
          )}
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
  card: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#0369a1',
    fontWeight: 'bold',
    marginBottom: 15,
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
  shareButton: {
    backgroundColor: '#0369a1',
    marginTop: 15,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  blueBackground: {
    backgroundColor: '#0369a1',
  },
  rewardIconText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rewardValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0369a1',
  },
  divider: {
    marginVertical: 15,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  referralInfo: {
    flex: 1,
    marginLeft: 15,
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  referralAmount: {
    color: '#0369a1',
    fontWeight: 'bold',
  },
  referralStatusText: {
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 20,
  },
  getStartedButton: {
    borderColor: '#0369a1',
    borderWidth: 2,
  },
});

export default ReferralScreen;