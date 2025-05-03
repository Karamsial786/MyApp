import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Surface, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function TicketHistoryScreen() {
  const navigation = useNavigation<any>();
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Support Tickets" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Surface style={styles.card}>
          <Text style={styles.title}>Support Tickets</Text>
          <Text style={styles.description}>
            Your support ticket history will appear here. You can create a new ticket or view your existing ones.
          </Text>
          
          <Button 
            mode="contained" 
            style={styles.newTicketButton}
            onPress={() => navigation.navigate('SupportChatDetailed', { ticketId: 'new' })}
          >
            Create New Ticket
          </Button>
        </Surface>
      </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Add extra space for bottom navigation
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
  newTicketButton: {
    backgroundColor: '#4f46e5',
    marginTop: 8,
  },
});