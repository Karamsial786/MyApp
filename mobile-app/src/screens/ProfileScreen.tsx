import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, List, Switch, Divider } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.firstName?.charAt(0) || ''}
            {user?.lastName?.charAt(0) || ''}
          </Text>
        </View>
        <Text variant="titleLarge" style={styles.userName}>
          {user?.firstName || ''} {user?.lastName || ''}
        </Text>
        <Text variant="bodyMedium" style={styles.userEmail}>
          {user?.email || ''}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Account Information</Text>
          
          <List.Item
            title="Username"
            description={user?.username || ''}
            left={props => <List.Icon {...props} icon="account" color="#0369a1" />}
          />
          
          <Divider />
          
          <List.Item
            title="Email"
            description={user?.email || ''}
            left={props => <List.Icon {...props} icon="email" color="#0369a1" />}
          />
          
          <Divider />
          
          <List.Item
            title="Referral Code"
            description={user?.referralCode || ''}
            left={props => <List.Icon {...props} icon="tag" color="#0369a1" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Settings</Text>
          
          <List.Item
            title="Notifications"
            description="Receive updates about your referrals"
            left={props => <List.Icon {...props} icon="bell" color="#0369a1" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#0369a1"
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Payment Information"
            description="Manage your payment methods"
            left={props => <List.Icon {...props} icon="credit-card" color="#0369a1" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Settings"
            description="Control your data and privacy"
            left={props => <List.Icon {...props} icon="shield-account" color="#0369a1" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Support</Text>
          
          <List.Item
            title="Help Center"
            description="Get help with using the app"
            left={props => <List.Icon {...props} icon="help-circle" color="#0369a1" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <Divider />
          
          <List.Item
            title="Contact Support"
            description="Reach out to our support team"
            left={props => <List.Icon {...props} icon="message-text" color="#0369a1" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="Version 1.0.0"
            left={props => <List.Icon {...props} icon="information" color="#0369a1" />}
          />
        </Card.Content>
      </Card>

      <Button 
        mode="outlined" 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        Log Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0369a1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    color: '#64748b',
    marginTop: 5,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    color: '#0369a1',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderColor: '#ef4444',
    borderWidth: 2,
  },
});

export default ProfileScreen;