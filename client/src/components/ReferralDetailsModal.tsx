import React from 'react';
import { X, MessageCircle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useReferrals from '@/hooks/use-referrals';

// Type for individual referral
export type Referral = {
  id: number;
  username: string;
  referredUserId: number;
  referrerId: number;
  activationDate: Date | null;
  nextRewardDate: Date | null;
  gracePeriodEnds: Date | null;
  lastActiveDate: Date | null;
  isActive: boolean | null;
  isInactive: boolean | null;
  activeAccounts: number;
  inactiveAccounts: number;
  totalAccounts: number;
  daysRemaining: number;
  status: 'Active' | 'Pending Renewal' | 'Grace Period' | 'Inactive' | 'Pending';
  statusDetails: string;
  estimatedCommission: number;
  renewalUrgency?: 'normal' | 'warning' | 'critical';
  
  // Client-side calculated properties
  renewalStatus: 'Renewed' | 'Awaiting Renewal' | 'Missed Renewal';
  timeLeft?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  };
  isWithinGracePeriod: boolean;
};

interface ReferralDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrals: Referral[];
}

// Helper function to get badge color based on status
const getStatusBadgeColor = (status: Referral['status']) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 hover:bg-green-100'; // Green for Active and Renewed
    case 'Pending Renewal':
      return 'bg-yellow-100 text-amber-800 hover:bg-yellow-100'; // Yellow for Pending Renewal
    case 'Grace Period':
      return 'bg-red-100 text-red-800 hover:bg-red-100'; // Red for Grace Period as shown in screenshot
    case 'Inactive':
      return 'bg-red-100 text-red-800 hover:bg-red-100'; // Red for Inactive
    case 'Pending':
      return 'bg-yellow-100 text-amber-800 hover:bg-yellow-100'; // Yellow for Pending Renewal as in screenshot
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Helper function to get timer color and icon based on status
const getTimerColorAndIcon = (referral: Referral) => {
  if (!referral.timeLeft) return { color: 'text-gray-600', icon: null };
  
  if (referral.timeLeft.expired || referral.status === 'Inactive' || referral.renewalStatus === 'Missed Renewal') {
    return { 
      color: 'text-red-500', 
      icon: <AlertCircle className="h-4 w-4 text-red-500 mr-1" /> 
    };
  }
  
  if (referral.isWithinGracePeriod || referral.status === 'Pending Renewal' || referral.status === 'Grace Period' || referral.renewalStatus === 'Awaiting Renewal') {
    return { 
      color: 'text-amber-500', 
      icon: <AlertCircle className="h-4 w-4 text-amber-500 mr-1" /> 
    };
  }
  
  if (referral.status === 'Active' && referral.renewalStatus === 'Renewed') {
    return { 
      color: 'text-green-500', 
      icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> 
    };
  }
  
  return { 
    color: 'text-green-500', 
    icon: <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> 
  };
};

// Helper function to format time display for countdown
const formatTimeDisplay = (referral: Referral) => {
  if (!referral.timeLeft) return '';
  
  if (referral.renewalStatus === 'Missed Renewal') {
    return '1 Day Remaining'; // For grace period last day
  }
  
  if (referral.isWithinGracePeriod || referral.status === 'Pending Renewal' || referral.status === 'Grace Period' || referral.renewalStatus === 'Awaiting Renewal') {
    return `${referral.timeLeft.days} Days Warning`;
  }
  
  return `${referral.timeLeft.days} Days Remaining`;
};

export const ReferralDetailsModal: React.FC<ReferralDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  referrals 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] p-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">Referral Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Track the status of your referrals and their renewal timers
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px]">
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No referrals found.</p>
            </div>
          ) : (
            <div className="pt-2">
              {/* Only show referrals that have been activated through first purchase */}
              {referrals
                .filter(ref => ref.activationDate !== null)
                .map((referral, index) => (
                <div key={referral.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{referral.username}</div>
                    <Badge className={`font-normal ${getStatusBadgeColor(referral.status)}`}>
                      {referral.status === 'Grace Period' ? 'Grace Period' : 
                       referral.status === 'Pending' ? 'Pending Renewal' : 
                       referral.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-500">
                    <div className="flex items-center justify-between">
                      <div>Renewal Status</div>
                      <div className="text-slate-700">
                        {referral.status === 'Grace Period' ? 'Awaiting Renewal' : referral.renewalStatus}
                      </div>
                    </div>
                    
                    {(referral.status === 'Grace Period' || referral.isWithinGracePeriod) ? (
                      <div className="flex items-center justify-between">
                        <div>Warning Timer</div>
                        <div className={`flex items-center ${getTimerColorAndIcon(referral).color}`}>
                          {getTimerColorAndIcon(referral).icon}
                          {formatTimeDisplay(referral)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>Timer</div>
                        <div className={`flex items-center ${getTimerColorAndIcon(referral).color}`}>
                          {getTimerColorAndIcon(referral).icon}
                          {formatTimeDisplay(referral)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      onClick={() => {
                        // This would be connected to messaging functionality
                        console.log(`Send message to ${referral.username}`);
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </Button>
                  </div>
                  
                  {index < referrals.length - 1 && <Separator className="mt-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralDetailsModal;