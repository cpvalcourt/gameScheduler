# Team Invitation API - Postman Testing Guide

This guide shows you how to test the team invitation acceptance service using Postman.

## Prerequisites

1. **Backend server running** on `http://localhost:3001`
2. **Database populated** with test data
3. **Postman** installed and configured

## Authentication

All endpoints require authentication. You'll need to:

1. Register a user or use an existing user
2. Login to get a JWT token
3. Include the token in the Authorization header: `Bearer <your-jwt-token>`

## Test Data Setup

Before testing, ensure you have:

- At least one team created
- A team captain (user who can send invitations)
- A user to invite (different from the captain)

## API Endpoints

### 1. Login to Get JWT Token

**POST** `http://localhost:3001/api/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "testuser@example.com"
  }
}
```

### 2. Send Team Invitation

**POST** `http://localhost:3001/api/team-invitations/send`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

**Body:**

```json
{
  "teamId": 1,
  "email": "inviteduser@example.com",
  "role": "player"
}
```

**Response:**

```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": 1,
    "team_id": 1,
    "team_name": "Test Team",
    "invited_email": "inviteduser@example.com",
    "invited_role": "player",
    "status": "pending",
    "token": "abc123def456...",
    "expires_at": "2024-01-15T10:00:00.000Z",
    "created_at": "2024-01-10T10:00:00.000Z",
    "invited_by_username": "testuser"
  }
}
```

### 3. Get Invitation Details (Service-based)

**GET** `http://localhost:3001/api/team-invitations/service/token/{token}`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "message": "Invitation found",
  "data": {
    "invitation": {
      "id": 1,
      "team_id": 1,
      "team_name": "Test Team",
      "invited_email": "inviteduser@example.com",
      "invited_role": "player",
      "status": "pending",
      "expires_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-10T10:00:00.000Z",
      "invited_by_username": "testuser"
    }
  }
}
```

### 4. Accept Team Invitation (Service-based)

**POST** `http://localhost:3001/api/team-invitations/service/accept/{token}`

**Headers:**

```
Authorization: Bearer <invited-user-jwt-token>
```

**Response:**

```json
{
  "message": "Invitation accepted successfully",
  "data": {
    "invitation": {
      "id": 1,
      "team_id": 1,
      "team_name": "Test Team",
      "invited_role": "player",
      "status": "accepted",
      "expires_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-10T10:00:00.000Z",
      "invited_by_username": "testuser"
    },
    "team": {
      "id": 1,
      "name": "Test Team",
      "description": "A test team"
    },
    "user": {
      "id": 2,
      "username": "inviteduser",
      "email": "inviteduser@example.com"
    }
  }
}
```

### 5. Decline Team Invitation (Service-based)

**POST** `http://localhost:3001/api/team-invitations/service/decline/{token}`

**Headers:**

```
Authorization: Bearer <invited-user-jwt-token>
```

**Response:**

```json
{
  "message": "Invitation declined successfully",
  "data": {
    "invitation": {
      "id": 1,
      "team_id": 1,
      "team_name": "Test Team",
      "invited_role": "player",
      "status": "declined",
      "expires_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-10T10:00:00.000Z",
      "invited_by_username": "testuser"
    }
  }
}
```

### 6. Get User's Invitations

**GET** `http://localhost:3001/api/team-invitations/my-invitations`

**Headers:**

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "invitations": [
    {
      "id": 1,
      "team_id": 1,
      "team_name": "Test Team",
      "invited_role": "player",
      "status": "pending",
      "expires_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-10T10:00:00.000Z",
      "invited_by_username": "testuser"
    }
  ]
}
```

## Error Responses

### 404 - Invitation Not Found

```json
{
  "message": "Invitation not found"
}
```

### 403 - Unauthorized

```json
{
  "message": "You are not authorized to accept this invitation"
}
```

### 400 - Invalid Status

```json
{
  "message": "Invitation is no longer valid. Current status: accepted"
}
```

### 400 - Expired Invitation

```json
{
  "message": "Invitation has expired"
}
```

### 400 - Already Member

```json
{
  "message": "You are already a member of this team"
}
```

## Complete Testing Workflow

1. **Login as team captain** and get JWT token
2. **Send invitation** to another user
3. **Login as invited user** and get their JWT token
4. **Get invitation details** using the token
5. **Accept or decline** the invitation
6. **Verify team membership** (if accepted)

## Postman Collection Variables

Set these environment variables in Postman:

```
base_url: http://localhost:3001/api
captain_token: <jwt-token-for-team-captain>
invited_user_token: <jwt-token-for-invited-user>
invitation_token: <token-from-invitation-response>
```

## Testing Scenarios

### Scenario 1: Successful Invitation Acceptance

1. Send invitation
2. Accept invitation with correct user
3. Verify user is added to team

### Scenario 2: Unauthorized Access

1. Try to accept invitation with wrong user
2. Should get 403 error

### Scenario 3: Expired Invitation

1. Create invitation
2. Wait for expiration (or manually expire in database)
3. Try to accept - should get 400 error

### Scenario 4: Already Member

1. Accept invitation
2. Try to accept same invitation again
3. Should get 400 error

### Scenario 5: Invalid Token

1. Use non-existent token
2. Should get 404 error

## Database Verification

After accepting an invitation, verify in the database:

```sql
-- Check invitation status
SELECT * FROM team_invitations WHERE token = 'your-token';

-- Check team membership
SELECT * FROM team_members WHERE team_id = 1 AND user_id = 2;
```

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check JWT token is valid and not expired
2. **404 Not Found**: Verify invitation token exists and is correct
3. **403 Forbidden**: Ensure the user accepting is the one invited
4. **500 Server Error**: Check server logs for detailed error information

### Debug Steps:

1. Check server logs for detailed error messages
2. Verify database connections and table structure
3. Ensure all required middleware is properly configured
4. Test with Postman's console to see full request/response details
