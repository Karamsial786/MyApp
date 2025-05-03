import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function SupportChatScreen() {
  const navigation = useNavigation<any>();
  
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Support Chat" />
      <View style={styles.content}>
        <Surface style={styles.card}>
          <Text style={styles.title}>Support Chat</Text>
          <Text style={styles.description}>
            This screen will be a redirection page to the chat interface.
            You can create a new ticket or view existing ones.
          </Text>
          <Button 
            mode="contained" 
            style={styles.button}
            onPress={() => navigation.navigate('TicketHistory')}
          >
            View Tickets
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