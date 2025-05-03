import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Divider, 
  Avatar, 
  Portal,
  Modal,
  TextInput,
  useTheme, 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';

// Components
import Header from '../components/Header';

// Types
type SupportTicket = {
  id: number;
  userId: number;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    createdAt: string;
    isAdmin: boolean;
  };
  category: string;
};

type Message = {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  isAdmin: boolean;
  createdAt: string;
};

// Main component
const SupportScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const messageInputRef = useRef<RNTextInput>(null);
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [newTicketSubject, setNewTicketSubject] = useState<string>('');
  const [newTicketMessage, setNewTicketMessage] = useState<string>('');
  const [newTicketCategory, setNewTicketCategory] = useState<string>('general');
  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Load tickets
  const loadTickets = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.get('/api/support/tickets');
      
      if (response.data) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', 'Failed to load support tickets');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Load ticket messages
  const loadTicketMessages = async (ticketId: number) => {
    try {
      const response = await apiClient.get(`/api/support/tickets/${ticketId}/messages`);
      
      if (response.data) {
        setMessages(response.data);
        // Scroll to bottom after messages load
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error loading ticket messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTickets();
  };
  
  // Open ticket
  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    loadTicketMessages(ticket.id);
  };
  
  // Close ticket view
  const closeTicketView = () => {
    setSelectedTicket(null);
    setMessages([]);
  };
  
  // Send message
  const sendMessage = async () => {
    if (!selectedTicket || !messageText.trim()) return;
    
    setIsSending(true);
    
    try {
      const response = await apiClient.post(`/api/support/tickets/${selectedTicket.id}/messages`, {
        content: messageText.trim(),
      });
      
      if (response.data.success) {
        setMessageText('');
        // Refresh messages
        loadTicketMessages(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  // Create new ticket
  const createNewTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
      Alert.alert('Error', 'Please enter both subject and message');
      return;
    }
    
    setIsCreatingTicket(true);
    
    try {
      const response = await apiClient.post('/api/support/tickets', {
        subject: newTicketSubject.trim(),
        message: newTicketMessage.trim(),
        category: newTicketCategory,
      });
      
      if (response.data.success) {
        setNewTicketSubject('');
        setNewTicketMessage('');
        setNewTicketCategory('general');
        setShowNewTicketModal(false);
        
        // Refresh tickets
        loadTickets();
        
        // Open the newly created ticket
        if (response.data.ticketId) {
          const newTicket = {
            id: response.data.ticketId,
            userId: user?.id || 0,
            subject: newTicketSubject.trim(),
            status: 'open' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: newTicketCategory,
          };
          
          openTicket(newTicket);
        }
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create support ticket');
    } finally {
      setIsCreatingTicket(false);
    }
  };
  
  // Load tickets on mount and when screen is focused
  useEffect(() => {
    loadTickets();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [])
  );
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#10b981';
      case 'closed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'account':
        return 'account';
      case 'payment':
        return 'credit-card';
      case 'technical':
        return 'wrench';
      case 'feedback':
        return 'message-text';
      default:
        return 'help-circle';
    }
  };
  
  // Render ticket item
  const renderTicketItem = ({ item }: { item: SupportTicket }) => (
    <Card 
      style={styles.ticketCard} 
      onPress={() => openTicket(item)}
      mode="outlined"
    >
      <Card.Content style={styles.ticketCardContent}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketSubject} numberOfLines={1}>
              {item.subject}
            </Text>
            <View style={styles.ticketMeta}>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusChipText}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Chip>
              <Text style={styles.ticketDate}>
                {formatDate(item.updatedAt || item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.categoryIconContainer}>
            <MaterialCommunityIcons 
              name={getCategoryIcon(item.category)} 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>
        </View>
        
        {item.lastMessage && (
          <View style={styles.lastMessageContainer}>
            <Text style={styles.lastMessageText} numberOfLines={2}>
              {item.lastMessage.content}
            </Text>
            <Text style={styles.lastMessageDate}>
              {formatDate(item.lastMessage.createdAt)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
  
  // Render message item
  const renderMessageItem = (message: Message) => {
    const isUserMessage = !message.isAdmin;
    
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageContainer,
          isUserMessage ? styles.userMessageContainer : styles.adminMessageContainer,
        ]}
      >
        <View style={styles.messageHeader}>
          <Avatar.Text 
            label={isUserMessage ? (user?.firstName?.charAt(0) || 'U') : 'S'} 
            size={32} 
            style={{ 
              backgroundColor: isUserMessage ? theme.colors.primary : '#6366f1',
            }}
          />
          <View style={styles.messageHeaderText}>
            <Text style={styles.messageSender}>
              {isUserMessage ? 'You' : 'Support Team'}
            </Text>
            <Text style={styles.messageDate}>
              {formatDate(message.createdAt)}
            </Text>
          </View>
        </View>
        <View 
          style={[
            styles.messageContent,
            isUserMessage ? styles.userMessageContent : styles.adminMessageContent,
          ]}
        >
          <Text style={styles.messageText}>{message.content}</Text>
        </View>
      </View>
    );
  };
  
  // Render new ticket modal
  const renderNewTicketModal = () => (
    <Portal>
      <Modal
        visible={showNewTicketModal}
        onDismiss={() => setShowNewTicketModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Support Ticket</Text>
          
          <TextInput
            label="Subject"
            value={newTicketSubject}
            onChangeText={setNewTicketSubject}
            style={styles.modalInput}
            mode="outlined"
          />
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              <Chip
                selected={newTicketCategory === 'general'}
                onPress={() => setNewTicketCategory('general')}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons 
                    name="help-circle" 
                    size={18} 
                    color={newTicketCategory === 'general' ? theme.colors.primary : '#64748b'} 
                  />
                )}
              >
                General
              </Chip>
              <Chip
                selected={newTicketCategory === 'account'}
                onPress={() => setNewTicketCategory('account')}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons 
                    name="account" 
                    size={18} 
                    color={newTicketCategory === 'account' ? theme.colors.primary : '#64748b'} 
                  />
                )}
              >
                Account
              </Chip>
              <Chip
                selected={newTicketCategory === 'payment'}
                onPress={() => setNewTicketCategory('payment')}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons 
                    name="credit-card" 
                    size={18} 
                    color={newTicketCategory === 'payment' ? theme.colors.primary : '#64748b'} 
                  />
                )}
              >
                Payment
              </Chip>
              <Chip
                selected={newTicketCategory === 'technical'}
                onPress={() => setNewTicketCategory('technical')}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons 
                    name="wrench" 
                    size={18} 
                    color={newTicketCategory === 'technical' ? theme.colors.primary : '#64748b'} 
                  />
                )}
              >
                Technical
              </Chip>
              <Chip
                selected={newTicketCategory === 'feedback'}
                onPress={() => setNewTicketCategory('feedback')}
                style={styles.categoryChip}
                icon={() => (
                  <MaterialCommunityIcons 
                    name="message-text" 
                    size={18} 
                    color={newTicketCategory === 'feedback' ? theme.colors.primary : '#64748b'} 
                  />
                )}
              >
                Feedback
              </Chip>
            </ScrollView>
          </View>
          
          <TextInput
            label="Message"
            value={newTicketMessage}
            onChangeText={setNewTicketMessage}
            style={styles.modalInput}
            mode="outlined"
            multiline
            numberOfLines={5}
          />
          
          <View style={styles.modalActions}>
            <Button 
              mode="outlined" 
              onPress={() => setShowNewTicketModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={createNewTicket}
              style={styles.modalButton}
              loading={isCreatingTicket}
              disabled={isCreatingTicket}
            >
              Create Ticket
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
  
  // Main render
  return (
    <View style={styles.container}>
      {!selectedTicket ? (
        // Tickets list screen
        <>
          <Header
            title="Support"
            showBack={false}
            rightComponent={
              <TouchableOpacity onPress={() => setShowNewTicketModal(true)}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>
            }
          />
          
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          ) : (
            <FlatList
              data={tickets}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.ticketsList}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={64}
                    color="#94a3b8"
                  />
                  <Text style={styles.emptyText}>
                    No support tickets yet
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => setShowNewTicketModal(true)}
                    style={styles.newTicketButton}
                    icon="plus"
                  >
                    Create New Ticket
                  </Button>
                </View>
              }
            />
          )}
        </>
      ) : (
        // Ticket details screen
        <KeyboardAvoidingView
          style={styles.ticketDetailsContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          <Header
            title={selectedTicket.subject}
            onBackPress={closeTicketView}
            rightComponent={
              <View style={styles.ticketStatus}>
                <Chip
                  style={[
                    styles.ticketStatusChip,
                    { backgroundColor: getStatusColor(selectedTicket.status) },
                  ]}
                  textStyle={styles.ticketStatusChipText}
                >
                  {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                </Chip>
              </View>
            }
          />
          
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            <View style={styles.ticketInfoContainer}>
              <Text style={styles.ticketInfoTitle}>Ticket Information</Text>
              <View style={styles.ticketInfoRow}>
                <Text style={styles.ticketInfoLabel}>ID:</Text>
                <Text style={styles.ticketInfoValue}>#{selectedTicket.id}</Text>
              </View>
              <View style={styles.ticketInfoRow}>
                <Text style={styles.ticketInfoLabel}>Created:</Text>
                <Text style={styles.ticketInfoValue}>{formatDate(selectedTicket.createdAt)}</Text>
              </View>
              <View style={styles.ticketInfoRow}>
                <Text style={styles.ticketInfoLabel}>Category:</Text>
                <View style={styles.ticketInfoCategoryContainer}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(selectedTicket.category)}
                    size={18}
                    color={theme.colors.primary}
                    style={styles.ticketInfoCategoryIcon}
                  />
                  <Text style={styles.ticketInfoValue}>
                    {selectedTicket.category.charAt(0).toUpperCase() + selectedTicket.category.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
            
            <Divider style={styles.messageDivider} />
            
            {messages.length === 0 ? (
              <View style={styles.loadingMessages}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.loadingMessagesText}>Loading messages...</Text>
              </View>
            ) : (
              messages.map(renderMessageItem)
            )}
          </ScrollView>
          
          {selectedTicket.status !== 'closed' && (
            <View style={styles.replyContainer}>
              <TextInput
                ref={messageInputRef}
                mode="outlined"
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type your message..."
                multiline
                style={styles.replyInput}
                right={
                  <TextInput.Icon
                    icon="send"
                    disabled={isSending || !messageText.trim()}
                    onPress={sendMessage}
                    color={theme.colors.primary}
                  />
                }
              />
            </View>
          )}
          
          {selectedTicket.status === 'closed' && (
            <View style={styles.ticketClosedContainer}>
              <MaterialCommunityIcons
                name="lock"
                size={24}
                color="#64748b"
              />
              <Text style={styles.ticketClosedText}>
                This ticket is closed. You cannot reply anymore.
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
      
      {renderNewTicketModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  ticketsList: {
    padding: 16,
  },
  ticketCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  ticketCardContent: {
    padding: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
    marginRight: 8,
  },
  statusChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  ticketDate: {
    fontSize: 12,
    color: '#64748b',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastMessageContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  lastMessageText: {
    fontSize: 14,
    color: '#334155',
    fontStyle: 'italic',
  },
  lastMessageDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  newTicketButton: {
    marginTop: 16,
  },
  ticketDetailsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  ticketStatus: {
    marginRight: 8,
  },
  ticketStatusChip: {
    height: 24,
  },
  ticketStatusChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  ticketInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ticketInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  ticketInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ticketInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 80,
  },
  ticketInfoValue: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  ticketInfoCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketInfoCategoryIcon: {
    marginRight: 4,
  },
  messageDivider: {
    marginBottom: 16,
    backgroundColor: '#e2e8f0',
    height: 1,
  },
  loadingMessages: {
    padding: 24,
    alignItems: 'center',
  },
  loadingMessagesText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  adminMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageHeaderText: {
    marginLeft: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
  },
  messageDate: {
    fontSize: 12,
    color: '#64748b',
  },
  messageContent: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessageContent: {
    backgroundColor: '#f1f5f9',
    borderBottomRightRadius: 0,
  },
  adminMessageContent: {
    backgroundColor: '#ede9fe',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  replyContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  replyInput: {
    backgroundColor: '#ffffff',
  },
  ticketClosedContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketClosedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 8,
    padding: 0,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  categoryList: {
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    marginLeft: 12,
  },
});

export default SupportScreen;