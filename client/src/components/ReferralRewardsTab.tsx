import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import CincCoin from '@/components/CincCoin';
import GiftBox from '@/components/GiftBox';
// === SPIN WHEEL FEATURE - TEMPORARILY DISABLED ===
// This section is part of the SPIN WHEEL system.
// It has been commented out for now.
// This will be uncommented and reactivated in future development.
// TODO: UNCOMMENT FOR SPIN WHEEL INTEGRATION
// import WheelComponent from '@/components/WheelOfPrizes';
import { 
  Users, 
  DollarSign, 
  Award, 
  AlertTriangle, 
  Gift, 
  Clock, 
  RefreshCw,
  Copy,
  ChevronRight,
  Zap,
  Gift as GiftIcon,
  Sparkles,
  RotateCw,
  BadgeCheck,
  TrendingUp,
  Disc,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useReferralRewards, ReferralStats } from '@/hooks/use-referral-rewards';
import useReferralMilestones, { Milestone } from '@/hooks/use-referral-milestones';
import { useAuth } from '@/contexts/AuthContext';

export function ReferralRewardsTab() {
  // Add an ID to allow accessing from outside
  useEffect(() => {
    const parentElement = document.getElementById('referral-rewards-tab');
    if (!parentElement) {
      const wrapper = document.querySelector('[data-value="rewards"]');
      if (wrapper) {
        wrapper.id = 'referral-rewards-tab';
      }
    }
  }, []);
  const { toast } = useToast();
  const auth = useAuth();
  
  // Use our custom hooks to get referral stats, actions and milestones
  const { 
    stats, 
    // === SPIN WHEEL FEATURE - TEMPORARILY DISABLED ===
    // spinRewards, 
    isLoading, 
    transferCinc, 
    isTransferring,
    claimGiftBox, 
    // claimSpinReward, 
    isClaimingGiftBox,
    // isClaimingSpinReward
  } = useReferralRewards();
  
  // Get milestone data from the database
  const {
    milestones,
    allMilestones,
    isLoading: milestonesLoading,
    formatMilestoneReward,
    refetch: refetchMilestones
  } = useReferralMilestones();
  
  // Sync our persisted state with localStorage for demo/testing
  useEffect(() => {
    localStorage.setItem('referralStats', JSON.stringify({
      totalEarnings: stats.totalEarnings,
      coinBalance: stats.coinBalance
    }));
  }, [stats.totalEarnings, stats.coinBalance]);

  // === SPIN WHEEL FEATURE - TEMPORARILY DISABLED ===
  // This section is part of the SPIN WHEEL system.
  // It has been commented out for now.
  // This will be uncommented and reactivated in future development.
  // TODO: UNCOMMENT FOR SPIN WHEEL INTEGRATION
  /*
  // Dialog states - Spin Wheel related
  const [showSpinDialog, setShowSpinDialog] = useState(false);
  
  // Active spinner state
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | string | null>(null);
  
  // Define types for spinRewards if needed for the remaining code
  type SpinReward = {
    value: number | string;
    probability: number;
    color: string;
    displayText?: string;
  };

  // Set up to handle wheel spinning
  const spinWheel = () => {
    setShowSpinDialog(true);
    setIsSpinning(true);
    setSpinResult(null);
  };
  */

  // Dialog states - Active
  const [showGiftBoxDialog, setShowGiftBoxDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMilestoneRewardPopup, setShowMilestoneRewardPopup] = useState(false);
  const [rewardPopupData, setRewardPopupData] = useState<{
    referralCount: number;
    baseAmount: number;
    bonusAmount: number;
    totalAmount: number;
  } | null>(null);

  // Gift box state
  const [giftBoxOpened, setGiftBoxOpened] = useState(false);
  const [giftBoxReward, setGiftBoxReward] = useState<number | null>(null);

  // Function to handle opening the gift box with backend integration
  const openGiftBox = () => {
    if (giftBoxOpened || isClaimingGiftBox) return;

    setGiftBoxOpened(true);
    
    // Call the backend to claim the gift immediately
    // The animation will show while the API request is processing
    claimGiftBox();
  };

  // Function to copy referral link
  const copyReferralLink = () => {
    navigator.clipboard.writeText("https://chainify.com/ref/YOUR_REFERRAL_CODE");
    toast({
      title: "Referral Link Copied!",
      description: "Share this link with your friends to earn rewards!",
    });
  };

  // Reset gift box state when dialog closes
  useEffect(() => {
    if (!showGiftBoxDialog) {
      setTimeout(() => {
        setGiftBoxOpened(false);
        setGiftBoxReward(null);
      }, 300);
    }
  }, [showGiftBoxDialog]);
  
  // WebSocket connection for real-time milestone notifications
  useEffect(() => {
    if (!auth.user || !auth.user.id) return;
    
    let socket: WebSocket | null = null;
    let reconnectInterval: NodeJS.Timeout | null = null;
    let isConnecting = false;
    
    // Function to create WebSocket connection with error handling
    const connectWebSocket = () => {
      if (isConnecting) return;
      isConnecting = true;
      
      try {
        // Setup WebSocket connection
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws?userId=${auth.user?.id}`;
        
        socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log("WebSocket connection established for milestone notifications");
          isConnecting = false;
          
          // Clear any reconnect interval if connection is successful
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
          }
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);
            
            // Handle different message types
            if (data.type === 'milestone_achieved') {
              // Show the milestone achievement popup with the data
              setRewardPopupData({
                referralCount: data.referralCount,
                baseAmount: data.baseAmount,
                bonusAmount: data.bonusAmount,
                totalAmount: data.totalAmount
              });
              setShowMilestoneRewardPopup(true);
              
              // Refresh milestones data
              refetchMilestones();
              
              // Show a toast notification
              toast({
                title: "Milestone Achieved!",
                description: `You've unlocked the ${data.referralCount} referrals milestone!`,
              });
            } else if (data.type === 'connected') {
              console.log("WebSocket connection confirmed:", data);
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        };
        
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          isConnecting = false;
        };
        
        socket.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          isConnecting = false;
          
          // Setup reconnection if not intentionally closed
          if (!event.wasClean && !reconnectInterval) {
            console.log("Setting up WebSocket reconnection...");
            reconnectInterval = setInterval(() => {
              if (socket?.readyState !== WebSocket.OPEN) {
                console.log("Attempting to reconnect WebSocket...");
                connectWebSocket();
              }
            }, 5000); // Try to reconnect every 5 seconds
          }
        };
      } catch (error) {
        console.error("Error setting up WebSocket connection:", error);
        isConnecting = false;
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup on component unmount
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, "Component unmounted");
      }
      
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, [auth.user, refetchMilestones, toast]);

  // Calculate referral renewal commission percentage
  const renewalCommissionPercentage = stats.activeReferrals > 0
    ? Math.min(100, (stats.renewalEarnings / (stats.activeReferrals * 9000 * 0.15)) * 100)
    : 0;

  // Calculate inactive referrals percentage
  const inactiveReferralsPercentage = stats.totalReferrals > 0
    ? Math.min(100, (stats.inactiveReferrals / stats.totalReferrals) * 100)
    : 0;
    
  // Security check for milestones display - only consider milestones "unlocked" if user has enough referrals
  const secureMilestones = useMemo(() => {
    return milestones.map(milestone => ({
      ...milestone,
      // Override the achieved status based on actual referral count
      achieved: stats.totalReferrals >= milestone.referCount
    }));
  }, [milestones, stats.totalReferrals]);

  // Dynamically determine next milestone based on database-fetched milestones
  // This ensures we only use real milestone data from the database
  const determineNextMilestone = useMemo(() => {
    // Filter to get only unachieved milestones (those with higher referral counts than current)
    const upcomingMilestones = secureMilestones
      .filter(m => m.referCount > stats.totalReferrals)
      .sort((a, b) => a.referCount - b.referCount);
    
    // Get the next milestone with a bonus if possible
    const nextBonusMilestone = upcomingMilestones.find(m => m.bonusAmount > 0);
    
    // If there's a bonus milestone, prioritize it, otherwise use the closest next milestone
    return nextBonusMilestone || upcomingMilestones[0] || null;
  }, [secureMilestones, stats.totalReferrals]);
  
  // Calculate progress based on the dynamically determined next milestone
  const currentLevel = stats.totalReferrals;
  const nextLevel = determineNextMilestone ? determineNextMilestone.referCount : currentLevel;
  const progress = nextLevel > currentLevel ? (currentLevel / nextLevel) * 100 : 100;
  
  // Additional metadata from the next milestone for display consistency
  const nextMilestoneDetails = determineNextMilestone ? {
    referCount: determineNextMilestone.referCount,
    coinAmount: determineNextMilestone.coinAmount,
    bonusAmount: determineNextMilestone.bonusAmount,
    hasSpin: determineNextMilestone.hasSpin,
    remaining: determineNextMilestone.referCount - currentLevel
  } : null;

  return (
    <div className="space-y-6 pb-16">
      {/* Hidden button trigger for gift box from other components */}
      <button 
        data-gift-box-trigger
        className="hidden"
        onClick={() => setShowGiftBoxDialog(true)}
      />

      {/* Live CINC Balance */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-xs opacity-80">ReferPay</p>
            <div className="flex items-center">
              <CincCoin size="lg" variant="premium" className="mr-2 border-white/30" />
              <p className="text-white text-2xl font-bold">{stats.coinBalance.toLocaleString()}</p>
            </div>
            {/* Added info text */}
            <p className="text-white/70 text-xs mt-1">Earnings from Newly Activated Referrals</p>
          </div>
          <div className="flex flex-col">
            <Button
              variant="secondary"
              size="sm"
              className={`bg-white/20 hover:bg-white/30 text-white transition-all duration-300 ${
                stats.coinBalance > 0 ? 'animate-pulse-slow' : ''
              }`}
              onClick={() => {
                if (stats.coinBalance <= 0) {
                  toast({
                    title: "No Balance Available",
                    description: "You need to earn CINC before transferring to earnings",
                    variant: "destructive"
                  });
                  return;
                }
                transferCinc();
              }}
              disabled={isTransferring}
            >
              {isTransferring ? (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Moving to Earnings...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Transfer to Earnings
                </span>
              )}
            </Button>
            
            {/* Added status indicator */}
            {stats.coinBalance <= 0 && (
              <span className="text-xs text-center mt-2 text-white/60">
                No CINC available to transfer
              </span>
            )}
            {stats.coinBalance > 0 && !isTransferring && (
              <span className="text-xs text-center mt-2 text-white/90 font-medium">
                {stats.coinBalance.toLocaleString()} CINC available
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Referral Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Referral Progress</CardTitle>
          <CardDescription>Keep referring to unlock rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Show tracker only if there are still milestones to be unlocked */}
          {secureMilestones.some(m => !m.achieved) ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Next milestone</span>
                <span className="font-medium">
                {stats.totalReferrals}/{nextLevel}
              </span>
              </div>
              <div className="relative">
                <Progress 
                  value={progress} 
                  className="h-2 bg-slate-100" 
                />
                {stats.totalReferrals > 0 && (
                  <div 
                    className="absolute top-0 h-3 w-3 bg-blue-600 rounded-full -mt-0.5 border-2 border-white" 
                    style={{ 
                      left: `${Math.min(100, progress)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
              </div>
              <div className="flex justify-end text-xs text-blue-600 font-medium pt-1">
                {stats.totalReferrals === 0 ? 
                  'Refer friends to earn' :
                  nextMilestoneDetails && nextMilestoneDetails.remaining > 0 ? 
                    `${nextMilestoneDetails.remaining} more needed` : 
                    'Milestone reached!'}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="text-center py-2 bg-green-50 rounded-md">
                <span className="text-sm text-green-600 font-medium">
                  All referral bonuses claimed
                </span>
              </div>
            </div>
          )}

          {/* Enhanced Next Bonus Section - only shown if there are milestones left to achieve */}
          {secureMilestones.some(m => !m.achieved) ? (
            <div className="pt-2 flex justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{stats.totalReferrals}</span>
                <span className="text-xs text-slate-500">Current</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium flex items-center gap-1">
                  {nextMilestoneDetails?.hasSpin && <RotateCw className="h-3 w-3" />}
                  {nextLevel}
                </span>
                <span className="text-xs text-slate-500">Goal</span>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {nextMilestoneDetails?.coinAmount.toLocaleString()} CINC
                  </span>
                  {(nextMilestoneDetails?.bonusAmount || 0) > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                      +{(nextMilestoneDetails?.bonusAmount || 0).toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">Reward</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">All milestones completed</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      

      {stats.coinBoosterActive && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 flex items-center gap-3">
          <div className="bg-indigo-100 p-1.5 rounded-full">
            <Zap className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-700">Coin Booster Active!</p>
            <p className="text-xs text-indigo-600">Your next referral reward will be doubled!</p>
          </div>
          <Badge className="bg-indigo-200 text-indigo-700 hover:bg-indigo-300">ACTIVE</Badge>
        </div>
      )}

      {/* Referral Milestone Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Milestone Rewards</CardTitle>
            <Button 
              variant="ghost" 
              className="text-xs h-8 pl-2 pr-3"
              onClick={() => setShowMilestoneDialog(true)}
            >
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <CardDescription>Earn bonuses at special milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Milestone entries from database - shown dynamically based on progress */}
            {milestonesLoading ? (
              // Loading state with placeholders
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="border rounded-md p-3 flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-1 bg-slate-200 rounded w-full mt-2"></div>
                  </div>
                </div>
              ))
            ) : (
              // Display progressive milestone list according to requirements
              secureMilestones.map((milestone) => {
                // Format milestone reward text using the helper function
                const rewardText = formatMilestoneReward(milestone);
                // Use the achieved status from our secured milestone check
                const achieved = milestone.achieved;
                const hasBonus = milestone.bonusAmount > 0;
                
                return (
                  <div key={milestone.id} className="border rounded-md p-3 flex items-center gap-3">
                    <Badge variant="outline" className={`p-1 ${achieved ? 'bg-green-100' : 'bg-slate-100'}`}>
                      <Award className={`h-4 w-4 ${achieved ? 'text-green-500' : 'text-slate-400'}`} />
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {milestone.referCount} Referral{milestone.referCount !== 1 ? 's' : ''}
                        {hasBonus && (
                          <span className="ml-1 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                            +Bonus
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{rewardText}</p>
                      {/* Add progress bar to show advancement to this milestone */}
                      <Progress 
                        value={achieved ? 100 : Math.min(100, Math.round((stats.totalReferrals / milestone.referCount) * 100))} 
                        className="h-1 mt-2 bg-slate-100" 
                      />
                    </div>
                    <Badge className={`
                      ${achieved 
                        ? 'bg-green-100 text-green-700' 
                      : hasBonus 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'}
                    `}>
                      {achieved ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Cards Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* === SPIN WHEEL FEATURE - TEMPORARILY DISABLED === */}
        {/* This section is part of the SPIN WHEEL system. */}
        {/* It has been commented out for now. */}
        {/* This will be uncommented and reactivated in future development. */}
        {/* TODO: UNCOMMENT FOR SPIN WHEEL INTEGRATION */}
        {/* Spin to Win Button - currently disabled
        <button
          onClick={spinWheel}
          className="relative group overflow-hidden flex flex-col justify-center items-center p-5 rounded-xl border-2 border-yellow-300 bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg"
          disabled={!stats.hasSpinAvailable}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
          
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border-4 border-yellow-300 shadow-inner flex items-center justify-center animate-pulse-slow">
              <Disc className="h-10 w-10 text-white drop-shadow-md" />
            </div>
            
            {stats.hasSpinAvailable && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-bounce shadow-md border border-white">
                1
              </div>
            )}
            
            <div className="absolute -top-1 -left-1 text-yellow-300 animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="absolute bottom-0 right-0 text-yellow-300 animate-pulse delay-300">
              <Sparkles size={16} />
            </div>
          </div>
          
          <p className="font-bold text-xl text-white drop-shadow-md">Spin & Win!</p>
          <p className="text-sm text-yellow-200 mt-1">
            {stats.hasSpinAvailable ? 'Spin available now!' : 'Refer more to unlock'}
          </p>
        </button>
        */}

        {/* Daily Bonus Box was moved to Refers Stats Tab */}
      </div>
      
      {/* Stats Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-slate-50">
          <CardTitle className="text-lg font-semibold">Referral Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            
            
            
            
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pending Earnings</p>
                  <p className="text-xs text-slate-500">Earned but not yet released</p>
                </div>
              </div>
              <p className="font-semibold">{stats.pendingEarnings.toLocaleString()} CINC</p>
            </div>
            
            <div 
              className="flex justify-between items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => {
                // Use global function to open the INACTIVE referrals modal (different from Total Refers)
                const openInactiveModal = (window as any).openInactiveReferralsModal;
                if (openInactiveModal) {
                  openInactiveModal();
                } else {
                  // Fallback to a toast notification if the global function isn't available
                  toast({
                    title: 'Inactive Referrals',
                    description: 'Click to see referrals awaiting first purchase',
                  });
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-1.5 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Inactive Referrals</p>
                  <p className="text-xs text-slate-500">Need first purchase to activate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{stats.inactiveReferrals}</p>
                <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${inactiveReferralsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Box */}
      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white text-lg font-semibold">Share & Earn</h3>
                <p className="text-indigo-100 text-sm">Invite friends to earn CINC</p>
              </div>
              <Badge className="bg-white/20 text-white hover:bg-white/30">1350 CINC / referral</Badge>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg flex flex-col gap-3">
              <p className="text-sm text-indigo-100">Your referral link</p>
              <div className="bg-white/5 rounded-md p-2 flex items-center justify-between gap-1">
                <p className="text-xs text-white truncate">https://chainify.com/ref/YOUR_REFERRAL_CODE</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20"
                  onClick={copyReferralLink}
                >
                  <Copy className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-xs text-indigo-100">Total Invited</p>
              </div>
              <div className="flex-1 text-center border-l border-indigo-400">
                <p className="text-2xl font-bold">{stats.activeReferrals}</p>
                <p className="text-xs text-indigo-100">Active Users</p>
              </div>
              <div className="flex-1 text-center border-l border-indigo-400">
                <div className="flex items-center justify-center">
                  <CincCoin size="xs" className="mr-1" />
                  <p className="text-2xl font-bold">{stats.coinBalance}</p>
                </div>
                <p className="text-xs text-indigo-100">CINC Earned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {/* Milestone Reward Popup - Enhanced as per requirements */}
      <Dialog open={showMilestoneRewardPopup} onOpenChange={setShowMilestoneRewardPopup}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl">Milestone Achieved!</DialogTitle>
            <DialogDescription>
              Congratulations on reaching {rewardPopupData?.referralCount} {rewardPopupData?.referralCount === 1 ? 'referral' : 'referrals'}!
            </DialogDescription>
          </DialogHeader>
          
          {rewardPopupData && (
            <div className="py-6 flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Award className="h-12 w-12 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
                  {rewardPopupData.referralCount}
                </div>
              </div>
              
              <h3 className="text-xl font-bold">
                {rewardPopupData.referralCount} {rewardPopupData.referralCount === 1 ? 'Referral' : 'Referrals'} Milestone
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-lg w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Base Reward:</span>
                  <span className="font-medium">{rewardPopupData.baseAmount.toLocaleString()} CINC</span>
                </div>
                
                {rewardPopupData.bonusAmount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-600 font-medium">Bonus:</span>
                    <span className="font-medium text-blue-600">+{rewardPopupData.bonusAmount.toLocaleString()} CINC</span>
                  </div>
                )}
                
                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">{rewardPopupData.totalAmount.toLocaleString()} CINC</span>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 mt-2 space-y-1">
                <p>These rewards have been added to your ReferPay balance.</p>
                <p>Your milestone rewards are processed automatically.</p>
              </div>
              
              {/* Referral progress indicator - only show if there are milestones left to achieve */}
              {secureMilestones.some(m => !m.achieved) ? (
                <div className="w-full mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-xs text-slate-500">Current</span>
                    <span className="text-xs text-slate-500">Next</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 bg-slate-100" 
                  />
                  <div className="flex justify-between">
                    <span className="text-xs font-medium">{stats.totalReferrals}</span>
                    <span className="text-xs font-medium">{nextLevel}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full mt-2 bg-green-50 p-2 rounded-md flex justify-center items-center">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">All milestones completed</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              className="w-full" 
              onClick={() => setShowMilestoneRewardPopup(false)}
            >
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Share Your Referral Link</DialogTitle>
            <DialogDescription>
              Invite friends and earn 1350 CINC for each referral!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Referral Code Display */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Your Referral Code:</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-bold text-slate-800">AX72KL</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("AX72KL");
                    toast({
                      title: "Copied!",
                      description: "Referral code copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowShareDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === SPIN WHEEL FEATURE - TEMPORARILY DISABLED === */}
      {/* This section is part of the SPIN WHEEL system. */}
      {/* It has been commented out for now. */}
      {/* This will be uncommented and reactivated in future development. */}
      {/* TODO: UNCOMMENT FOR SPIN WHEEL INTEGRATION */}
      {/* Spin Dialog with Wheel Component - currently disabled
      <Dialog open={showSpinDialog} onOpenChange={setShowSpinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Spin & Win!</DialogTitle>
            <DialogDescription>
              Spin the wheel to win awesome rewards!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center justify-center">
            <WheelComponent
              segments={[5000, 10000, 15000, 20000, 25000, 30000]}
              segColors={['#EE4040', '#F0CF50', '#00C49F', '#0088FE', '#F9AA1F', '#9B59B6']}
              onFinished={(winner) => {
                // Handle the winner
                setSpinResult(winner);
                
                // Start claim process immediately to save the result
                if (typeof winner === 'number' || !isNaN(parseInt(winner as string))) {
                  const winValue = typeof winner === 'number' 
                    ? winner 
                    : parseInt(winner as string);
                  
                  // Display win notification
                  toast({
                    title: "Congratulations!",
                    description: (
                      <div className="flex items-center">
                        <span>You won </span>
                        <CincCoin value={winValue} showValue={true} variant="premium" size="md" className="mx-1" />
                        <span>!</span>
                      </div>
                    ),
                  });
                  
                  // Process the claim in the backend
                  setTimeout(() => {
                    claimSpinReward(winValue);
                  }, 1000);
                }
              }}
              primaryColor="black"
              contrastColor="white"
              buttonText="Spin"
              isOnlyOnce={true}
              size={280}
              fontSize={16}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSpinDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */}

      {/* Gift Box Dialog */}
      <Dialog open={showGiftBoxDialog} onOpenChange={setShowGiftBoxDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl">Daily Bonus</DialogTitle>
            <DialogDescription>
              Open your daily gift box to receive CINC rewards!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            <GiftBox 
              onOpen={openGiftBox}
              isOpened={giftBoxOpened || isClaimingGiftBox}
              giftBoxReward={isClaimingGiftBox ? null : giftBoxReward}
              disabled={!stats.hasGiftBoxAvailable || isClaimingGiftBox}
              nextAvailableTime={stats.nextGiftBoxTime ? new Date(stats.nextGiftBoxTime) : undefined}
            />
            
            {isClaimingGiftBox && (
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-indigo-600">Processing your reward...</p>
                <p className="text-xs text-slate-500 mt-1 flex items-center justify-center">
                  <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                  Claiming your daily bonus
                </p>
              </div>
            )}
            
            {!stats.hasGiftBoxAvailable && !isClaimingGiftBox && (
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-slate-600">Gift box not available yet</p>
                <p className="text-xs text-slate-500 mt-1">Next available: {stats.giftBoxTimeRemaining}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowGiftBoxDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Referral Milestones & Rewards</DialogTitle>
            <DialogDescription>
              Earn special rewards as you reach important referral milestones
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] pr-2">
            <div className="space-y-6 py-4">
              {/* Progress section - only shown if there are milestones left to achieve */}
              {secureMilestones.some(m => !m.achieved) ? (
                <div className="space-y-2">
                  <h3 className="font-medium">Your Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {stats.totalReferrals}</span>
                      <span>Next: {nextLevel}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-medium">Your Progress</h3>
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <div className="flex items-center justify-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">All milestones completed!</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <h3 className="font-medium mb-4">All Milestones</h3>
                
                {milestonesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 text-blue-500 mr-3">
                      <RotateCw className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-slate-500">Loading milestone data...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allMilestones.map((milestone) => {
                      // Format the reward text for display
                      const rewardText = formatMilestoneReward(milestone);
                      // Use the secure milestone achievement status based on actual referral count
                      const achieved = stats.totalReferrals >= milestone.referCount;
                      const hasBonus = milestone.bonusAmount > 0;
                      
                      return (
                        <div key={milestone.id} className="flex p-2 rounded-md border">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`p-1 ${achieved ? 'bg-green-100' : 'bg-slate-100'}`}>
                                <Award className={`h-4 w-4 ${achieved ? 'text-green-500' : 'text-slate-400'}`} />
                              </Badge>
                              <span className="font-medium">{milestone.referCount} Referrals</span>
                              {hasBonus && (
                                <Badge className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                                  +Bonus
                                </Badge>
                              )}
                              {achieved && (
                                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                  <BadgeCheck className="h-3 w-3 mr-1" />
                                  Achieved
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-slate-600">
                              Reward: {rewardText}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {achieved ? (
                              <Badge className="bg-green-100 text-green-700">Unlocked</Badge>
                            ) : (
                              <div className="text-sm text-slate-500">
                                {milestone.referCount - stats.totalReferrals} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowMilestoneDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReferralRewardsTab;