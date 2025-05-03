import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Alert,
  Modal,
  Share,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  Text, 
  Card, 
  Button, 
  Chip, 
  Divider, 
  Badge, 
  Tab,
  IconButton,
  useTheme, 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import Clipboard from '@react-native-clipboard/clipboard';

// Components
import Header from '../components/Header';
import CincCoin from '../components/CincCoin';
import RewardTier from '../components/RewardTier';

// Type definitions
type Referral = {
  id: number;
  userId: number;
  referredUserId: number;
  referredUsername: string;
  status: 'active' | 'inactive' | 'pending' | 'grace_period';
  joinDate: string;
  daysActive: number;
  earnedAmount: number;
  lastActive: string;
};

type Milestone = {
  id: number;
  referralCount: number;
  baseAmount: number;
  bonusAmount: number;
  isAchieved: boolean;
  isCollected: boolean;
  description: string;
};

type ReferralStats = {
  totalReferrals: number;
  activeReferrals: number;
  inactiveReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
  gracePeriodReferrals: number;
};

// Main component
const ReferralsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    inactiveReferrals: 0,
    totalEarnings: 0,
    pendingReferrals: 0,
    gracePeriodReferrals: 0,
  });
  const [referralCode, setReferralCode] = useState<string>(user?.referralCode || '');
  const [showSpinWheel, setShowSpinWheel] = useState<boolean>(false);
  
  // Calculate next milestone
  const nextMilestone = milestones.find(m => !m.isAchieved);
  const progress = nextMilestone
    ? Math.min(100, (stats.totalReferrals / nextMilestone.referralCount) * 100)
    : 100;
  
  // Load data
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch referral stats
      const statsResponse = await apiClient.get('/api/referrals/stats');
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Fetch referrals
      const referralsResponse = await apiClient.get('/api/referrals');
      if (referralsResponse.data) {
        setReferrals(referralsResponse.data);
      }
      
      // Fetch milestones
      const milestonesResponse = await apiClient.get('/api/referrals/milestones');
      if (milestonesResponse.data) {
        setMilestones(milestonesResponse.data);
      }
      
      // Animation for content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
    } catch (error) {
      console.error('Error loading referrals data:', error);
      Alert.alert(
        'Error',
        'Failed to load referrals data. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Copy referral code to clipboard
  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied', 'Referral code copied to clipboard');
  };
  
  // Share referral code
  const shareReferralCode = async () => {
    try {
      await Share.share({
        message: `Join ReferPay using my referral code: ${referralCode}. Sign up at https://referpay.app/signup?ref=${referralCode}`,
        title: 'Share Referral Code',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // Claim milestone reward
  const claimMilestoneReward = async (milestoneId: number) => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post(`/api/referrals/milestones/${milestoneId}/claim`);
      
      if (response.data.success) {
        Alert.alert(
          'Reward Claimed!',
          `You received ${response.data.amount} CINC coins!`
        );
        
        // Refresh milestone data
        loadData();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming milestone reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };
  
  // Load data on mount and when screen is focused
  useEffect(() => {
    loadData();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );
  
  // Filter referrals by status
  const getFilteredReferrals = (status: string | null) => {
    if (!status) return referrals;
    return referrals.filter(r => r.status === status);
  };
  
  // Render loading state
  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.container}>
        <Header title="Refers & Rewards" showBack={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading referrals data...</Text>
        </View>
      </View>
    );
  }
  
  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return renderStatsTab();
      case 'list':
        return renderListTab();
      case 'rewards':
        return renderRewardsTab();
      default:
        return null;
    }
  };
  
  // Render stats tab
  const renderStatsTab = () => (
    <Animated.View
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyReferralCode}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Button
            mode="contained"
            icon="share-variant"
            style={styles.shareButton}
            onPress={shareReferralCode}
          >
            Share Referral Code
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Referral Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-multiple"
                size={28}
                color={theme.colors.primary}
              />
              <Text style={styles.statValue}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-check"
                size={28}
                color="#10b981"
              />
              <Text style={styles.statValue}>{stats.activeReferrals}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-clock"
                size={28}
                color="#f59e0b"
              />
              <Text style={styles.statValue}>{stats.pendingReferrals}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-cancel"
                size={28}
                color="#ef4444"
              />
              <Text style={styles.statValue}>{stats.inactiveReferrals}</Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.totalEarningsContainer}>
            <Text style={styles.totalEarningsLabel}>Total Earnings:</Text>
            <CincCoin
              value={stats.totalEarnings}
              size={24}
              showText={true}
              textPosition="right"
            />
          </View>
        </Card.Content>
      </Card>
      
      {nextMilestone ? (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.nextMilestoneHeader}>
              <Text style={styles.cardTitle}>Next Milestone</Text>
              <Chip mode="outlined" style={styles.progressChip}>
                {stats.totalReferrals}/{nextMilestone.referralCount} Referrals
              </Chip>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>
            <View style={styles.milestoneRewardContainer}>
              <View style={styles.milestoneDescriptionContainer}>
                <Text style={styles.milestoneDescription}>
                  {nextMilestone.description}
                </Text>
                <Text style={styles.referralsNeeded}>
                  {nextMilestone.referralCount - stats.totalReferrals} more referrals needed
                </Text>
              </View>
              <View style={styles.milestoneRewardAmount}>
                <CincCoin
                  value={nextMilestone.baseAmount + nextMilestone.bonusAmount}
                  size={20}
                  showText={true}
                  textPosition="right"
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content style={styles.allMilestonesCompleted}>
            <MaterialCommunityIcons
              name="trophy"
              size={48}
              color="#f59e0b"
            />
            <Text style={styles.allMilestonesText}>
              All milestones completed!
            </Text>
          </Card.Content>
        </Card>
      )}
    </Animated.View>
  );
  
  // Render list tab
  const renderListTab = () => (
    <Animated.View
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Chip
            selected={!activeFilter}
            onPress={() => setActiveFilter(null)}
            style={styles.filterChip}
            textStyle={activeFilter ? styles.filterChipText : styles.activeFilterChipText}
          >
            All ({referrals.length})
          </Chip>
          <Chip
            selected={activeFilter === 'active'}
            onPress={() => setActiveFilter('active')}
            style={styles.filterChip}
            textStyle={activeFilter !== 'active' ? styles.filterChipText : styles.activeFilterChipText}
          >
            Active ({stats.activeReferrals})
          </Chip>
          <Chip
            selected={activeFilter === 'pending'}
            onPress={() => setActiveFilter('pending')}
            style={styles.filterChip}
            textStyle={activeFilter !== 'pending' ? styles.filterChipText : styles.activeFilterChipText}
          >
            Pending ({stats.pendingReferrals})
          </Chip>
          <Chip
            selected={activeFilter === 'grace_period'}
            onPress={() => setActiveFilter('grace_period')}
            style={styles.filterChip}
            textStyle={activeFilter !== 'grace_period' ? styles.filterChipText : styles.activeFilterChipText}
          >
            Grace Period ({stats.gracePeriodReferrals})
          </Chip>
          <Chip
            selected={activeFilter === 'inactive'}
            onPress={() => setActiveFilter('inactive')}
            style={styles.filterChip}
            textStyle={activeFilter !== 'inactive' ? styles.filterChipText : styles.activeFilterChipText}
          >
            Inactive ({stats.inactiveReferrals})
          </Chip>
        </ScrollView>
      </View>
      
      {referrals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={64}
            color="#94a3b8"
          />
          <Text style={styles.emptyText}>
            You don't have any referrals yet
          </Text>
          <Button
            mode="contained"
            icon="share-variant"
            style={styles.shareButtonEmpty}
            onPress={shareReferralCode}
          >
            Share Your Referral Code
          </Button>
        </View>
      ) : (
        <FlatList
          data={getFilteredReferrals(activeFilter)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReferralItem}
          contentContainerStyle={styles.referralsList}
          ListEmptyComponent={
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterText}>
                No referrals found for this filter
              </Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
  
  // Render rewards tab
  const renderRewardsTab = () => (
    <Animated.View
      style={[
        styles.tabContent,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.rewardsHeader}>
        <Text style={styles.rewardsTitle}>Referral Milestones</Text>
        <Text style={styles.rewardsDescription}>
          Earn rewards as you refer more users
        </Text>
      </View>
      
      {milestones.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading milestones...</Text>
        </View>
      ) : (
        <FlatList
          data={milestones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RewardTier
              milestone={item}
              currentReferrals={stats.totalReferrals}
              onClaimReward={() => claimMilestoneReward(item.id)}
            />
          )}
          contentContainerStyle={styles.milestonesList}
        />
      )}
      
      {/* Spin wheel button (visible when a milestone is reached but not claimed) */}
      {milestones.some(m => m.isAchieved && !m.isCollected) && (
        <View style={styles.spinWheelContainer}>
          <Button
            mode="contained"
            icon="gesture-tap"
            style={styles.spinWheelButton}
            onPress={() => setShowSpinWheel(true)}
          >
            Spin the Wheel
          </Button>
        </View>
      )}
    </Animated.View>
  );
  
  // Render referral item
  const renderReferralItem = ({ item }: { item: Referral }) => {
    // Status badge
    let statusColor = '#94a3b8';
    let statusText = 'Unknown';
    
    switch (item.status) {
      case 'active':
        statusColor = '#10b981';
        statusText = 'Active';
        break;
      case 'inactive':
        statusColor = '#ef4444';
        statusText = 'Inactive';
        break;
      case 'pending':
        statusColor = '#f59e0b';
        statusText = 'Pending';
        break;
      case 'grace_period':
        statusColor = '#6366f1';
        statusText = 'Grace Period';
        break;
    }
    
    // Format date
    const formattedJoinDate = new Date(item.joinDate).toLocaleDateString();
    const formattedLastActive = new Date(item.lastActive).toLocaleDateString();
    
    return (
      <Card style={styles.referralCard}>
        <Card.Content>
          <View style={styles.referralHeader}>
            <View style={styles.referralUser}>
              <View style={styles.referralAvatar}>
                <Text style={styles.referralAvatarText}>
                  {item.referredUsername.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.referralInfo}>
                <Text style={styles.referralUsername}>
                  {item.referredUsername}
                </Text>
                <Text style={styles.referralJoinDate}>
                  Joined: {formattedJoinDate}
                </Text>
              </View>
            </View>
            <View style={styles.referralStatus}>
              <Badge
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                {statusText}
              </Badge>
            </View>
          </View>
          
          <Divider style={styles.cardDivider} />
          
          <View style={styles.referralDetails}>
            <View style={styles.referralDetail}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={18}
                color="#64748b"
              />
              <Text style={styles.referralDetailText}>
                {item.daysActive} days active
              </Text>
            </View>
            
            <View style={styles.referralDetail}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color="#64748b"
              />
              <Text style={styles.referralDetailText}>
                Last active: {formattedLastActive}
              </Text>
            </View>
            
            <View style={styles.referralDetail}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={18}
                color="#64748b"
              />
              <Text style={styles.referralDetailText}>
                Earned: {item.earnedAmount} CINC
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Component state
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  return (
    <View style={styles.container}>
      <Header
        title="Refers & Rewards"
        showBack={false}
        rightComponent={
          <IconButton
            icon="refresh"
            color="#ffffff"
            size={20}
            onPress={handleRefresh}
          />
        }
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'stats' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('stats')}
        >
          <MaterialCommunityIcons
            name="chart-box"
            size={22}
            color={activeTab === 'stats' ? theme.colors.primary : '#64748b'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'stats' && styles.activeTabButtonText,
            ]}
          >
            Stats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'list' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('list')}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={22}
            color={activeTab === 'list' ? theme.colors.primary : '#64748b'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'list' && styles.activeTabButtonText,
            ]}
          >
            Referrals
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'rewards' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('rewards')}
        >
          <MaterialCommunityIcons
            name="gift"
            size={22}
            color={activeTab === 'rewards' ? theme.colors.primary : '#64748b'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'rewards' && styles.activeTabButtonText,
            ]}
          >
            Rewards
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
  },
  tabButtonText: {
    marginLeft: 4,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabButtonText: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  tabContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  referralCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  divider: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 16,
  },
  totalEarningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalEarningsLabel: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressChip: {
    backgroundColor: '#f8fafc',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  milestoneRewardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneDescriptionContainer: {
    flex: 1,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  referralsNeeded: {
    fontSize: 12,
    color: '#64748b',
  },
  milestoneRewardAmount: {
    marginLeft: 8,
  },
  allMilestonesCompleted: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  allMilestonesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f8fafc',
  },
  filterChipText: {
    color: '#64748b',
  },
  activeFilterChipText: {
    fontWeight: 'bold',
  },
  referralsList: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  shareButtonEmpty: {
    marginTop: 16,
  },
  emptyFilterContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#64748b',
  },
  referralCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  referralUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  referralAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  referralInfo: {
    justifyContent: 'center',
  },
  referralUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  referralJoinDate: {
    fontSize: 12,
    color: '#64748b',
  },
  referralStatus: {
    justifyContent: 'center',
  },
  statusBadge: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardDivider: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 12,
  },
  referralDetails: {
    marginTop: 8,
  },
  referralDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referralDetailText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
  rewardsHeader: {
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  rewardsDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  milestonesList: {
    paddingBottom: 80,
  },
  spinWheelContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  spinWheelButton: {
    width: '100%',
  },
});

export default ReferralsScreen;