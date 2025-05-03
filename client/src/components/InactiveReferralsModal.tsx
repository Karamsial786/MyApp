import React from 'react';
import { AlertTriangle, Clock, ChevronRight, CalendarDays, Users, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Referral } from './ReferralDetailsModal';

interface InactiveReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrals: Referral[];
}

export const InactiveReferralsModal: React.FC<InactiveReferralsModalProps> = ({ 
  isOpen, 
  onClose, 
  referrals 
}) => {
  // Filter to only show inactive referrals (those awaiting admin activation)
  const inactiveReferrals = referrals.filter(ref => ref.isInactive);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            Inactive Referrals
          </DialogTitle>
          <DialogDescription>
            Referrals that need admin approval and first purchase to become active.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-50 p-3 rounded-md mb-4 border border-slate-200">
          <div className="text-sm text-slate-700">
            <p className="mb-2"><strong>Note:</strong> Inactive referrals don't count toward "Total Refers" or milestone rewards.</p>
            <p>Once a referral makes their first purchase and is approved by admin, they will move to your active referrals list and contribute to milestone rewards.</p>
          </div>
        </div>
        
        {inactiveReferrals.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto bg-slate-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-3">
              <Users className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No Inactive Referrals</h3>
            <p className="text-sm text-slate-500 mt-1">All your referrals are currently active.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[350px] overflow-auto pr-3">
            <div className="space-y-3">
              {inactiveReferrals.map((referral) => (
                <div 
                  key={referral.id} 
                  className="border rounded-lg p-3 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="mr-3 bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center text-slate-800 font-medium">
                        {referral.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{referral.username}</div>
                        <div className="text-xs text-slate-500">ID: {referral.referredUserId}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Inactive
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="flex items-center text-slate-500">
                      <CalendarDays className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Awaiting first purchase</span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Pending admin approval</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="flex justify-end mt-4">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InactiveReferralsModal;