import { useState, useEffect } from 'react';
import { Eye, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { formatDate, formatDetailedCountdown, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { IpAccount } from '@shared/schema';

interface IPDetailsModalProps {
  ipAccount: IpAccount;
  isOpen: boolean;
  onClose: () => void;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | undefined;
}

export function IPDetailsModal({ ipAccount, isOpen, onClose, timeLeft }: IPDetailsModalProps) {
  const { toast } = useToast();
  const [visibleFields, setVisibleFields] = useState({
    ipAddress: false,
    username: false,
    password: false,
  });
  
  const [copyStatus, setCopyStatus] = useState({
    ipAddress: false,
    port: false,
    username: false,
    password: false,
  });

  // Reset visibility and copy states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setVisibleFields({
        ipAddress: false,
        username: false,
        password: false,
      });
      setCopyStatus({
        ipAddress: false,
        port: false,
        username: false,
        password: false,
      });
    }
  }, [isOpen]);

  // Toggle field visibility
  const toggleVisibility = (field: keyof typeof visibleFields) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Copy field value to clipboard
  const handleCopy = async (field: keyof typeof copyStatus, value: string) => {
    const success = await copyToClipboard(value);
    
    if (success) {
      setCopyStatus((prev) => ({
        ...prev,
        [field]: true,
      }));
      
      toast({
        title: "Copied to clipboard",
        description: `${field} has been copied to clipboard`,
      });
      
      // Reset copy status after 2 seconds
      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [field]: false,
        }));
      }, 2000);
    }
  };

  // Copy all details to clipboard
  const copyAllDetails = async () => {
    const allDetails = `IP: ${ipAccount.ipAddress}\nPort: ${ipAccount.port}\nUsername: ${ipAccount.username}\nPassword: ${ipAccount.password}`;
    
    const success = await copyToClipboard(allDetails);
    
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "All details have been copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ipAccount.platform} Account Details</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* IP Address Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">IP Address</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => handleCopy('ipAddress', ipAccount.ipAddress)}
              >
                <Copy className="mr-1 h-3 w-3" />
                <span>{copyStatus.ipAddress ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="secure-field flex items-center font-mono">
              {visibleFields.ipAddress ? (
                <span className="text-sm font-medium text-slate-700">{ipAccount.ipAddress}</span>
              ) : (
                <span className="text-sm font-medium text-slate-700">**********</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 text-xs text-primary"
                onClick={() => toggleVisibility('ipAddress')}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Port Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Port</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => handleCopy('port', ipAccount.port)}
              >
                <Copy className="mr-1 h-3 w-3" />
                <span>{copyStatus.port ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="secure-field font-mono">
              <span className="text-sm font-medium text-slate-700">{ipAccount.port}</span>
            </div>
          </div>
          
          {/* Username Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Username</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => handleCopy('username', ipAccount.username)}
              >
                <Copy className="mr-1 h-3 w-3" />
                <span>{copyStatus.username ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="secure-field flex items-center font-mono">
              {visibleFields.username ? (
                <span className="text-sm font-medium text-slate-700">{ipAccount.username}</span>
              ) : (
                <span className="text-sm font-medium text-slate-700">**********</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 text-xs text-primary"
                onClick={() => toggleVisibility('username')}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Password Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Password</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary"
                onClick={() => handleCopy('password', ipAccount.password)}
              >
                <Copy className="mr-1 h-3 w-3" />
                <span>{copyStatus.password ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
            <div className="secure-field flex items-center font-mono">
              {visibleFields.password ? (
                <span className="text-sm font-medium text-slate-700">{ipAccount.password}</span>
              ) : (
                <span className="text-sm font-medium text-slate-700">**********</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 h-6 w-6 text-xs text-primary"
                onClick={() => toggleVisibility('password')}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Expiry Date Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Expiry Date & Timer</label>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{formatDate(ipAccount.expiryDate)}</p>
              <p className="countdown text-xs text-slate-500 mt-1">
                {timeLeft ? formatDetailedCountdown(timeLeft) : 'Calculating...'}
              </p>
            </div>
          </div>
          
          {/* Account Type Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Account Type</label>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{ipAccount.platform}</p>
            </div>
          </div>
          
          {/* Security Status Field */}
          <div className="border border-slate-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-500">Security Status</label>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <span className="text-sm font-medium text-green-700">Fully Secure & Undetectable</span>
            </div>
          </div>
          
          {/* Copy All Button */}
          <Button
            className="w-full bg-primary hover:bg-blue-600 text-white"
            onClick={copyAllDetails}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy All Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default IPDetailsModal;
