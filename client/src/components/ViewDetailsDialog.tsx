
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Eye, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import { IpAccount } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { apiRequest } from '../lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

interface ViewDetailsDialogProps {
  ipAccount: IpAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean; // This flag is no longer used as all editing is done from backend
}

export default function ViewDetailsDialog({ ipAccount, open, onOpenChange, isAdmin = false }: ViewDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [visibleFields, setVisibleFields] = useState({
    ip: false,
    username: false,
    password: false,
    accountPassword: false,
    methodPassword: false
  });

  const [copyStatus, setCopyStatus] = useState({
    ip: false,
    port: false,
    username: false,
    password: false,
    accountPassword: false,
    methodPassword: false
  });
  
  // State for editing fields - only for admin use
  const [isEditing, setIsEditing] = useState({
    platform: false,
    accountPassword: false,
    methodPlatform: false,
    methodPassword: false
  });
  
  // State for edited values
  const [editedValues, setEditedValues] = useState({
    platform: ipAccount.platform || '',
    accountPassword: ipAccount.accountPassword || '',
    methodPlatform: ipAccount.methodPlatform || '',
    methodPassword: ipAccount.methodPassword || ''
  });
  
  // For saving edited fields
  const [isSaving, setIsSaving] = useState(false);

  const copyToClipboard = async (text: string, field: keyof typeof copyStatus) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({ ...prev, [field]: true }));
      toast({ description: 'Copied to clipboard!' });
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      toast({ description: 'Failed to copy', variant: 'destructive' });
    }
  };
  
  // Log the ipAccount data to help debug
  console.log("IPAccount data:", ipAccount);

  const toggleVisibility = (field: keyof typeof visibleFields) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const toggleEditing = (field: keyof typeof isEditing) => {
    // Only allow admins to toggle editing mode
    if (isAdmin) {
      setIsEditing(prev => ({ ...prev, [field]: !prev[field] }));
    } else {
      toast({ 
        description: 'Only administrators can edit these fields',
        variant: 'destructive'
      });
    }
  };
  
  const handleInputChange = (field: keyof typeof editedValues, value: string) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };
  
  const saveChanges = async (field: keyof typeof isEditing) => {
    // Only allow admin to save changes
    if (!isAdmin) {
      toast({ 
        description: 'Only administrators can modify these fields',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const sessionId = localStorage.getItem('sessionId');
      const updates: Record<string, string> = {};
      
      // Only update the fields that have been edited
      if (field === 'platform' && editedValues.platform !== ipAccount.platform) {
        updates.platform = editedValues.platform;
      }
      else if (field === 'accountPassword') {
        updates.accountPassword = editedValues.accountPassword;
      }
      else if (field === 'methodPlatform') {
        updates.methodPlatform = editedValues.methodPlatform;
      }
      else if (field === 'methodPassword') {
        updates.methodPassword = editedValues.methodPassword;
      }
      
      if (Object.keys(updates).length > 0) {
        await apiRequest({
          url: `/api/ip-accounts/${ipAccount.id}`,
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        });
        
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['/api/ip-accounts'] });
        
        toast({ 
          description: 'Changes saved successfully!',
          variant: 'default'
        });
        
        // Close editing mode
        toggleEditing(field);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({ 
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyAllDetails = async () => {
    // Format as IP:Port:Username:Password exactly as required
    const allDetails = `${ipAccount.ipAddress}:${ipAccount.port}:${ipAccount.username}:${ipAccount.password}`;
    try {
      await navigator.clipboard.writeText(allDetails);
      toast({ description: 'All details copied to clipboard!' });
    } catch (err) {
      toast({ description: 'Failed to copy all details', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">{ipAccount.platform} Account Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 mt-2">
          {/* Connection Details Card */}
          <div className="border border-blue-200 rounded-lg p-5 bg-gradient-to-r from-blue-50 to-slate-50">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Proxy Details</h3>
            <div className="space-y-4">
              {/* IP Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-500">IP Address</label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => copyToClipboard(ipAccount.ipAddress, 'ip')}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      <span>{copyStatus.ip ? 'Copied!' : 'Copy'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => toggleVisibility('ip')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded">
                  {visibleFields.ip ? ipAccount.ipAddress : '•'.repeat(15)}
                </div>
              </div>

              {/* Port */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-500">Port</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary"
                    onClick={() => copyToClipboard(ipAccount.port, 'port')}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    <span>{copyStatus.port ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded">
                  {ipAccount.port}
                </div>
              </div>

              {/* Username */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-500">Username</label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => copyToClipboard(ipAccount.username, 'username')}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      <span>{copyStatus.username ? 'Copied!' : 'Copy'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => toggleVisibility('username')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded">
                  {visibleFields.username ? ipAccount.username : '•'.repeat(10)}
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-500">Password</label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => copyToClipboard(ipAccount.password, 'password')}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      <span>{copyStatus.password ? 'Copied!' : 'Copy'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => toggleVisibility('password')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-white p-2 rounded">
                  {visibleFields.password ? ipAccount.password : '•'.repeat(10)}
                </div>
              </div>
            </div>
          </div>

          
          
          {/* Account Details Field */}
          <div className="border border-green-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-slate-50">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slate-700">Account</label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => copyToClipboard(ipAccount.accountPassword || '', 'accountPassword')}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  <span>{copyStatus.accountPassword ? 'Copied!' : 'Copy'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => toggleVisibility('accountPassword')}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="bg-white rounded p-3 border border-green-100">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-xs font-medium text-slate-500">Platform</span>
                  <div className="font-medium text-sm">{ipAccount.platform}</div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Password</span>
                  <div className="font-mono text-sm mt-1 bg-green-50/50 p-1.5 rounded">
                    {visibleFields.accountPassword 
                      ? (ipAccount.accountPassword || 'Not set') 
                      : (ipAccount.accountPassword ? '•'.repeat(10) : 'Not set')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Method Field */}
          <div className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-slate-50">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slate-700">Attached Method</label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => copyToClipboard(ipAccount.methodPassword || '', 'methodPassword')}
                >
                  <Copy className="mr-1 h-3 w-3" />
                  <span>{copyStatus.methodPassword ? 'Copied!' : 'Copy'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => toggleVisibility('methodPassword')}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="bg-white rounded p-3 border border-purple-100">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-xs font-medium text-slate-500">Platform</span>
                  <div className="font-medium text-sm">{ipAccount.methodPlatform || 'Not set'}</div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Password</span>
                  <div className="font-mono text-sm mt-1 bg-purple-50/50 p-1.5 rounded">
                    {visibleFields.methodPassword 
                      ? (ipAccount.methodPassword || 'Not set') 
                      : (ipAccount.methodPassword ? '•'.repeat(10) : 'Not set')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copy All Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg h-11 mt-2 shadow-sm"
            onClick={copyAllDetails}
          >
            <Copy className="mr-2 h-5 w-5" />
            Copy All Proxy Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
