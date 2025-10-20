# Soft Delete Implementation

This document explains the soft delete functionality implemented for user accounts in the Magick app.

## Overview

Instead of permanently deleting user accounts from the authentication system (which is not possible with Supabase Auth), we implement a "soft delete" approach where we mark accounts as deleted in our user profiles table while preserving the authentication data.

## Database Schema

The `user_profiles` table now includes a `deleted_at` field:

```sql
ALTER TABLE user_profiles ADD COLUMN deleted_at TIMESTAMP NULL;
```

## Implementation Details

### 1. User Types (`types/user.ts`)

The `UserProfile` interface now includes:
```typescript
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;  // New field
  consent: ConsentSettings;
  theme: 'light' | 'dark';
  favorite_categories: string[];
}
```

### 2. Consent Manager Functions (`lib/consent-manager.ts`)

Added the following functions:

- `softDeleteUser(userId: string)`: Marks a user as deleted by setting `deleted_at` timestamp
- `restoreUser(userId: string)`: Restores a deleted user by setting `deleted_at` to null
- `isUserDeleted(userId: string)`: Checks if a user account is soft deleted
- `getUserProfile(userId: string)`: Returns user profile only if not deleted

### 3. Authentication Functions (`lib/auth.ts`)

Updated authentication functions to check for deleted accounts:

- `signIn()`: Now checks if the account is deleted and prevents sign-in if so
- `getCurrentUser()`: Automatically signs out users with deleted accounts
- `deleteAccount()`: New function that soft deletes the current user's account

### 4. Settings UI (`app/(tabs)/settings.tsx`)

Updated the delete account functionality to use the new soft delete system with appropriate messaging.

## Usage Examples

### Soft Delete a User Account
```typescript
import { deleteAccount } from '../lib/auth';

// This will soft delete the current user's account and sign them out
await deleteAccount();
```

### Check if User is Deleted
```typescript
import { isUserDeleted } from '../lib/consent-manager';

const deleted = await isUserDeleted(userId);
if (deleted) {
  console.log('User account is deleted');
}
```

### Restore a Deleted Account
```typescript
import { restoreUser } from '../lib/consent-manager';

// This would typically be done by an admin or support
await restoreUser(userId);
```

## Security Considerations

1. **Authentication Data Preserved**: The actual Supabase Auth user remains intact, allowing for potential restoration
2. **Automatic Sign-out**: Deleted users are automatically signed out when detected
3. **Sign-in Prevention**: Deleted users cannot sign in even with valid credentials
4. **Data Access Control**: All user profile queries exclude deleted accounts

## Benefits

1. **Reversible**: Accounts can be restored if needed
2. **Audit Trail**: Maintains record of when accounts were deleted
3. **Compliance**: Helps with data retention and privacy requirements
4. **User Experience**: Clear messaging about account deletion and restoration options

## Database Migration

To implement this in your Supabase database, run:

```sql
-- Add the deleted_at column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN deleted_at TIMESTAMP NULL;

-- Create an index for better query performance
CREATE INDEX idx_user_profiles_deleted_at ON user_profiles(deleted_at);

-- Update existing records to have null deleted_at (not deleted)
UPDATE user_profiles SET deleted_at = NULL WHERE deleted_at IS NULL;
```

## Future Enhancements

1. **Admin Panel**: Create admin interface to view and restore deleted accounts
2. **Automatic Cleanup**: Implement scheduled cleanup of accounts deleted for extended periods
3. **Deletion Reasons**: Track why accounts were deleted (user request, admin action, etc.)
4. **Notification System**: Notify users before permanent cleanup of their data



