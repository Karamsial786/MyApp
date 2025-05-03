import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Surface, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import { formatDateTime } from '../lib/utils';

// Define types for messages and tickets
interface Message {
  id: number;
  ticketId: number;
  userId: number;
  isStaff: boolean;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: number;
  userId: number;
  subject: string;
  status: 'open' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
}

export default function SupportChatDetailedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const ticketId = route.params?.ticketId;
  const isNewTicket = ticketId === 'new';
  
  // State variables
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Load ticket and messages
  useEffect(() => {
    if (isNewTicket) {
      setLoading(false);
      return;
    }
    
    const fetchTicketData = async () => {
      try {
        const ticketData = await apiRequest(`/api/support/tickets/${ticketId}`);
        setTicket(ticketData);
        
        const messagesData = await apiRequest(`/api/support/tickets/${ticketId}/messages`);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTicketData();
  }, [ticketId, isNewTicket]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      if (isNewTicket) {
        // Create a new ticket with the first message
        if (!subject.trim()) {
          alert('Please enter a subject for your ticket');
          setSending(false);
          return;
        }
        
        const newTicketData = await apiRequest('/api/support/tickets', {
          method: 'POST',
          body: JSON.stringify({
            subject,
            message: newMessage,
          }),
        });
        
        setTicket(newTicketData.ticket);
        setMessages(newTicketData.messages || []);
        
        // Navigate to the new ticket
        navigation.setParams({ ticketId: newTicketData.ticket.id });
      } else {
        // Add message to existing ticket
        const newMessageData = await apiRequest(`/api/support/tickets/${ticketId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            content: newMessage,
          }),
        });
        
        setMessages((prev) => [...prev, newMessageData]);
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  // Get the status color based on ticket status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#22c55e'; // Green
      case 'closed':
        return '#ef4444'; // Red
      case 'resolved':
        return '#3b82f6'; // Blue
      default:
        return '#64748b'; // Gray
    }
  };
  
  // Render a message bubble
  const renderMessage = (message: Message) => {
    const isCurrentUser = !message.isStaff;
    
    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.userMessage : styles.supportMessage,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.messageTime}>
          {formatDateTime(message.createdAt)}
        </Text>
      </View>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title="Support Chat" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Support Chat" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Ticket Information */}
        {(ticket || isNewTicket) && (
          <Surface style={styles.ticketInfo}>
            {isNewTicket ? (
              <TextInput
                style={styles.subjectInput}
                placeholder="Enter ticket subject..."
                value={subject}
                onChangeText={setSubject}
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketSubject}>{ticket?.subject}</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(ticket?.status || 'open') + '20' },
                  ]}
                  textStyle={{ color: getStatusColor(ticket?.status || 'open') }}
                >
                  {ticket?.status.charAt(0).toUpperCase() + ticket?.status.slice(1)}
                </Chip>
              </View>
            )}
          </Surface>
        )}
        
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length > 0 ? (
            messages.map((message) => (
              <View key={message.id}>{renderMessage(message)}</View>
            ))
          ) : (
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#94a3b8" />
              <Text style={styles.emptyChatText}>
                {isNewTicket
                  ? 'Start a new conversation with support'
                  : 'No messages in this ticket yet'}
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.disabledButton,
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  ticketInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusChip: {
    height: 26,
  },
  subjectInput: {
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  messageInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: '#1e293b',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
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
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyChatText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});