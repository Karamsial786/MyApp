import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileX, AlertCircle } from "lucide-react";
import { type AccountRequest } from "@shared/schema";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AccountRequestsTable() {
  const [, navigate] = useLocation();
  const { data: allAccountRequests, isLoading, error } = useQuery({
    queryKey: ['/api/account-requests'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('sessionId');
      return await apiRequest<AccountRequest[]>('/api/account-requests', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      });
    }
  });
  
  // Organize requests by status
  const pendingRequests = React.useMemo(() => {
    if (!allAccountRequests || !Array.isArray(allAccountRequests)) return [];
    return allAccountRequests.filter(request => request.status === 'pending');
  }, [allAccountRequests]);
  
  const rejectedRequests = React.useMemo(() => {
    if (!allAccountRequests || !Array.isArray(allAccountRequests)) return [];
    return allAccountRequests.filter(request => request.status === 'rejected');
  }, [allAccountRequests]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5 inline-block"></span>
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block"></span>
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5 inline-block"></span>
            Rejected
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border border-gray-200 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gray-500 mr-1.5 inline-block"></span>
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-5">Account Purchase Requests</h2>
        <Card className="w-full border border-slate-200 shadow-sm rounded-lg">
          <CardContent className="flex justify-center items-center h-36 sm:h-48">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500">Loading requests...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-5">Account Purchase Requests</h2>
        <Card className="w-full border border-slate-200 shadow-sm rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4">
            <div className="rounded-full bg-red-50 p-3 sm:p-4 mb-3 sm:mb-4">
              <FileX className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Error Loading Requests</h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4">
              Failed to load account requests. Please try again.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              size="sm"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle the case when there are no requests at all
  const hasNoRequests = !allAccountRequests || !Array.isArray(allAccountRequests) || allAccountRequests.length === 0;
  
  if (hasNoRequests) {
    return (
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-5">Account Purchase Requests</h2>
        <Card className="w-full border border-slate-200 shadow-sm rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4">
            <div className="rounded-full bg-blue-50 p-3 sm:p-4 mb-3 sm:mb-4">
              <FileX className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">No Requests Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4">
              You haven't made any account purchase requests yet.
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/buy-account')}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm"
            >
              Make New Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the tabs with pending and rejected requests
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-5 flex items-center">
        Account Purchase Requests
        {pendingRequests.length > 0 && (
          <span className="ml-2 sm:ml-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
            {pendingRequests.length}
          </span>
        )}
      </h2>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-3 sm:mb-4 grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger value="pending" className="flex items-center text-xs sm:text-sm">
            Pending 
            {pendingRequests.length > 0 && (
              <span className="ml-1 sm:ml-2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center text-xs sm:text-sm">
            Rejected
            {rejectedRequests.length > 0 && (
              <span className="ml-1 sm:ml-2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {rejectedRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Pending Requests Tab Content */}
        <TabsContent value="pending" className="mt-0">
          {pendingRequests.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                    <TableRow>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Platform</TableHead>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Date</TableHead>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request: AccountRequest) => (
                      <TableRow key={request.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4 font-medium text-slate-700 text-xs sm:text-sm">{request.platform}</TableCell>
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4 text-slate-600 text-xs sm:text-sm">{formatDate(new Date(request.requestDate))}</TableCell>
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4">{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Card className="w-full border border-slate-200 shadow-sm rounded-lg">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4">
                <div className="rounded-full bg-blue-50 p-3 sm:p-4 mb-3 sm:mb-4">
                  <FileX className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">No Pending Requests</h3>
                <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4">
                  You don't have any pending account requests at the moment.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/buy-account')}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm"
                >
                  Make New Request
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Rejected Requests Tab Content */}
        <TabsContent value="rejected" className="mt-0">
          {rejectedRequests.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-red-50 to-slate-50">
                    <TableRow>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Platform</TableHead>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Date</TableHead>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">Reason</TableHead>
                      <TableHead className="py-3 px-2 sm:py-4 sm:px-4 text-xs font-semibold text-slate-600 uppercase">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequests.map((request: AccountRequest) => (
                      <TableRow key={request.id} className="hover:bg-red-50/20 transition-colors">
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4 font-medium text-slate-700 text-xs sm:text-sm">{request.platform}</TableCell>
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4 text-slate-600 text-xs sm:text-sm">{formatDate(new Date(request.requestDate))}</TableCell>
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4 text-slate-600 max-w-[100px] sm:max-w-xs">
                          {request.notes ? (
                            <div className="flex items-start">
                              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1 sm:mr-1.5 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-red-700 break-words line-clamp-2">
                                {request.notes.includes('Rejected') ? 
                                  request.notes : 
                                  `Rejected: ${request.notes}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs sm:text-sm italic">None</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-2 sm:py-4 sm:px-4">{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <Card className="w-full border border-slate-200 shadow-sm rounded-lg">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 px-3 sm:px-4">
                <div className="rounded-full bg-slate-50 p-3 sm:p-4 mb-3 sm:mb-4">
                  <FileX className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">No Rejected Requests</h3>
                <p className="text-xs sm:text-sm text-slate-500 text-center mb-3 sm:mb-4">
                  You don't have any rejected account requests.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}