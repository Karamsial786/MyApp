
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CurrencyConverter } from '@/components/CurrencyConverter';
import { useReferralRewards } from '@/hooks/use-referral-rewards';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

type PaymentInfo = {
  accountNumber?: string;
  accountHolder?: string;
  walletAddress?: string;
};

export function WithdrawDialog({ open, onOpenChange, availableBalance }: WithdrawDialogProps) {
  const { toast } = useToast();
  const { requestWithdrawal, isRequestingWithdrawal, stats } = useReferralRewards();
  
  const [withdrawalMethod, setWithdrawalMethod] = useState<string | undefined>();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [cincAmount, setCincAmount] = useState<number>(0);
  const [userAccountNumber, setUserAccountNumber] = useState('');
  const [userAccountHolder, setUserAccountHolder] = useState('');
  const [adminPaymentInfo, setAdminPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoadingAdminInfo, setIsLoadingAdminInfo] = useState(false);
  const [isValidAmount, setIsValidAmount] = useState(false);
  const [errors, setErrors] = useState({
    amount: '',
    method: '',
    accountNumber: '',
    accountHolder: ''
  });

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
  // Process and validate withdrawal amount changes
  useEffect(() => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!withdrawalAmount || isNaN(amount) || amount <= 0) {
      setCincAmount(0);
      setIsValidAmount(false);
    } else if (amount > availableBalance) {
      setCincAmount(amount);
      setIsValidAmount(false);
    } else {
      setCincAmount(amount);
      setIsValidAmount(true);
    }
  }, [withdrawalAmount, availableBalance]);

  useEffect(() => {
    if (!withdrawalMethod) {
      setAdminPaymentInfo(null);
      return;
    }

    setIsLoadingAdminInfo(true);
    
    // Simulated API response
    setTimeout(() => {
      setAdminPaymentInfo({
        accountNumber: '03001234567',
        accountHolder: 'John Doe'
      });
      setIsLoadingAdminInfo(false);
    }, 800);
    
  }, [withdrawalMethod]);

  const resetForm = () => {
    setWithdrawalMethod(undefined);
    setWithdrawalAmount('');
    setCincAmount(0);
    setIsValidAmount(false);
    setUserAccountNumber('');
    setUserAccountHolder('');
    setAdminPaymentInfo(null);
    setErrors({
      amount: '',
      method: '',
      accountNumber: '',
      accountHolder: ''
    });
  };

  const setMaxAmount = () => {
    setWithdrawalAmount(availableBalance.toString());
  };

  const validateForm = () => {
    const newErrors = {
      amount: '',
      method: '',
      accountNumber: '',
      accountHolder: ''
    };

    let isValid = true;

    if (!withdrawalAmount || isNaN(parseFloat(withdrawalAmount))) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (parseFloat(withdrawalAmount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
      isValid = false;
    } else if (parseFloat(withdrawalAmount) > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
      isValid = false;
    }

    if (!withdrawalMethod) {
      newErrors.method = 'Please select a withdrawal method';
      isValid = false;
    }

    if (withdrawalMethod && !userAccountNumber) {
      newErrors.accountNumber = 'Please enter your account number';
      isValid = false;
    }

    if (withdrawalMethod && !userAccountHolder) {
      newErrors.accountHolder = 'Please enter the account holder name';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Use the hook to submit withdrawal request
      requestWithdrawal({
        requestAmount: parseFloat(withdrawalAmount),
        paymentMethod: withdrawalMethod || '',
        accountNumber: userAccountNumber,
        accountHolder: userAccountHolder,
        notes: `Withdrawal from Total Earnings wallet`
      });
      
      // Dispatch event to update the parent component with new balance
      // Only update totalEarnings (Master Wallet) since withdrawal is only from Total Earnings
      const event = new CustomEvent('updateTotalEarnings', {
        detail: { 
          totalEarnings: availableBalance - parseFloat(withdrawalAmount),
          coinBalance: stats?.coinBalance || 0 // Keep CINC balance unchanged
        }
      });
      window.dispatchEvent(event);
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting withdrawal request:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Withdraw Your Earnings</DialogTitle>
          <DialogDescription>
            Select your preferred withdrawal method and enter the required details to request a payout.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Withdrawal Amount - Always visible */}
          <div className="space-y-2">
            <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
            <div className="flex space-x-2">
              <Input
                id="withdrawal-amount"
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                className={errors.amount ? 'border-red-500' : ''}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={setMaxAmount}
              >
                MAX
              </Button>
            </div>
            {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            
            {/* Currency conversion if amount is entered */}
            {cincAmount > 0 && (
              <div className={`flex justify-center mt-2 ${!isValidAmount ? "opacity-60" : ""}`}>
                <CurrencyConverter cincAmount={cincAmount} />
              </div>
            )}
          </div>

          {/* Withdrawal Method Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="withdrawal-method">Select Your Withdrawal Method</Label>
            <Select onValueChange={setWithdrawalMethod} value={withdrawalMethod}>
              <SelectTrigger id="withdrawal-method" className={errors.method ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a withdrawal method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="ltc" disabled>LTC (Litecoin)</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-xs text-red-500">{errors.method}</p>}
          </div>

          {/* Admin Details - Only shown after method selection */}
          {withdrawalMethod && (
            <div className="space-y-2 border rounded-md p-3 bg-slate-50">
              <h3 className="text-sm font-medium text-slate-600">Admin Details</h3>
              {isLoadingAdminInfo ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Admin Number:</span>
                    <span className="font-medium">{adminPaymentInfo?.accountNumber || ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Holder Name:</span>
                    <span className="font-medium">{adminPaymentInfo?.accountHolder || ''}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Payment Details - Only shown after method selection */}
          {withdrawalMethod && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="account-number">
                  {withdrawalMethod === 'easypaisa' ? 'Your EasyPaisa Account Number' : 
                   withdrawalMethod === 'jazzcash' ? 'Your JazzCash Account Number' : 
                   'Your Account Number'}
                </Label>
                <Input
                  id="account-number"
                  type="text"
                  value={userAccountNumber}
                  onChange={(e) => setUserAccountNumber(e.target.value)}
                  placeholder={withdrawalMethod === 'easypaisa' ? 'Enter your EasyPaisa account number' : 
                               withdrawalMethod === 'jazzcash' ? 'Enter your JazzCash account number' : 
                               'Enter your account number'}
                  className={errors.accountNumber ? 'border-red-500' : ''}
                />
                {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-holder">Holder Name</Label>
                <Input
                  id="account-holder"
                  type="text"
                  value={userAccountHolder}
                  onChange={(e) => setUserAccountHolder(e.target.value)}
                  placeholder="Enter account holder name"
                  className={errors.accountHolder ? 'border-red-500' : ''}
                />
                {errors.accountHolder && <p className="text-xs text-red-500">{errors.accountHolder}</p>}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isRequestingWithdrawal || !withdrawalMethod || 
                      !withdrawalAmount || !userAccountNumber || 
                      !userAccountHolder || parseFloat(withdrawalAmount) > availableBalance}
          >
            {isRequestingWithdrawal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Withdrawal Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
