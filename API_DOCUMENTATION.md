# Account Renewal API Documentation

This document outlines the API endpoints and workflow for the account renewal process.

## Full Renewal Workflow

The account renewal process follows these steps:

1. **User Initiates Renewal**: User clicks "Renew" on an inactive account and is redirected to the Renewal Form.
2. **Form Submission**: User fills in required fields and selects payment method.
3. **Admin Review**: Admin reviews renewal request and approves or rejects it.
4. **Countdown Timers**: After approval, a 30-day timer begins. After expiration, a 7-day warning timer starts.
5. **Auto-Deletion**: If not renewed within the warning period, the account is permanently deleted.

## API Endpoints

### User Endpoints

#### 1. Renew IP Account

Submits a renewal request for an expired IP account.

- **URL**: `/api/ip-accounts/:id/renew`
- **Method**: `POST`
- **Authentication**: Required
- **Parameters**:
  - `id`: ID of the IP account to renew
- **Request Body**:
  - `paymentMethod`: Payment method (CINC, Easypaisa, JazzCash)
  - For payment methods other than CINC:
    - `userPaymentNumber`: User's payment account number
    - `accountHolderName`: Account holder name
    - `transactionId`: Transaction ID
    - `proofScreenshot`: Payment proof (file upload)
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Renewal request submitted successfully",
      "accountRequest": { /* Account request object */ },
      "renewalDeadline": "2025-05-14T12:00:00.000Z" // For manual payments
      // or
      "newBalance": "3050" // For CINC payments
    }
    ```
  - Error (400, 403, 404, 500)

#### 2. Check IP Account Status

Checks if an IP account is active, expired, or in the renewal period.

- **URL**: `/api/ip-accounts/:id/status`
- **Method**: `GET`
- **Authentication**: Required
- **Parameters**:
  - `id`: ID of the IP account
- **Response**:
  - Success (200):
    ```json
    {
      "status": "active | expired | renewal_period | warning | deleted",
      "accountId": 1,
      "expiryDate": "2025-05-14T12:00:00.000Z",
      "renewalDeadline": "2025-05-21T12:00:00.000Z", // Only for expired accounts
      "timeLeft": {
        "days": 30,
        "hours": 0,
        "minutes": 0,
        "seconds": 0,
        "expired": false
      }
    }
    ```
  - Error (400, 403, 404, 500)

### Admin Endpoints

#### 1. Approve Account Renewal Request

Approves a renewal request and activates the account.

- **URL**: `/api/admin/account-requests/:id/approve`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: ID of the account request
- **Request Body**:
  - Optional update fields:
    - `ipAddress`: New IP address (if changing)
    - `port`: New port (if changing)
    - `username`: New username (if changing)
    - `password`: New password (if changing)
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Account renewal approved successfully",
      "accountRequest": { /* Updated account request object */ },
      "ipAccount": { /* Updated IP account object */ },
      "isRenewal": true
    }
    ```
  - Error (400, 404, 500)

#### 2. Reject Account Renewal Request

Rejects a renewal request.

- **URL**: `/api/admin/account-requests/:id/reject`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: ID of the account request
- **Request Body**:
  - `notes`: Optional rejection reason
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Renewal request rejected",
      "accountRequest": { /* Updated account request object */ },
      "isRenewal": true,
      "refund": { // Only for CINC payments
        "amount": "7000",
        "status": "completed"
      }
    }
    ```
  - Error (400, 404, 500)

#### 3. Edit IP Account Details

Updates an IP account's details.

- **URL**: `/api/admin/ip-accounts/:id`
- **Method**: `PATCH`
- **Authentication**: Required (Admin)
- **Parameters**:
  - `id`: ID of the IP account
- **Request Body**:
  - `ipAddress`: IP address to update
  - `port`: Port to update
  - `username`: Username to update
  - `password`: Password to update
  - `isActive`: Activation status
  - `expiryDate`: New expiry date
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Account updated successfully",
      "ipAccount": { /* Updated IP account object */ }
    }
    ```
  - Error (400, 404, 500)

#### 4. Check Expired Accounts

Checks for expired accounts, automatically inactivates them after 30 days, and deletes them after the 7-day warning period.

- **URL**: `/api/admin/check-expired-accounts`
- **Method**: `POST`
- **Authentication**: Required (Admin)
- **Response**:
  - Success (200):
    ```json
    {
      "message": "Expired accounts check completed",
      "expiredAccounts": [1, 2, 3],
      "accountsToDelete": [4, 5]
    }
    ```
  - Error (500)

## Data Structures

### IP Account

```typescript
{
  id: number;
  userId: number;
  platformId: number;
  platform: string;
  ipAddress: string;
  port: string;
  username: string;
  password: string;
  expiryDate: Date;
  isActive: boolean;
  renewalDeadline: Date | null;
}
```

### Account Request

```typescript
{
  id: number;
  userId: number;
  platformId: number | null;
  platform: string;
  paymentMethod: string;
  userPaymentNumber: string | null;
  accountHolderName: string | null;
  transactionId: string | null;
  proofScreenshot: string | null;
  paymentAmount: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  approvalDate: Date | null;
  notes: string | null;
  isCincPayment: boolean;
}
```

## Renewal States

1. **Active**: Account is active and operational
2. **Warning**: Account is active but will expire within 3 days
3. **Expired**: Account has expired but still exists in the system
4. **Renewal Period**: Account is in the 7-day window for renewal after expiration
5. **Deleted**: Account has been permanently deleted after the renewal period ended

## Automatic Processes

1. **Auto-Inactivation**: After the 30-day timer ends, the account is automatically marked as inactive
2. **Renewal Deadline**: A 7-day timer starts after inactivation
3. **Auto-Deletion**: If not renewed within the 7-day window, the account is permanently deleted