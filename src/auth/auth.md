# Auth Module

### Module responsible for managing authentication, authorization, and secure session handling throughout the application.

The `AuthModule` centralizes all logic related to verifying user identities and controlling access to protected resources. It ensures that only authenticated and authorized users can perform specific actions, based on their permissions.

Key Responsibilities:
- User Authentication: Validates user credentials and issues secure access tokens.
- Authorization: Enforces role-based access control (RBAC) across the application.
- Session Management: Tracks active sessions using the UserSession entity to allow secure login and logout flows.
- Token Lifecycle: Supports token refresh mechanisms to extend user sessions securely.
- Password Recovery: Provides secure endpoints for forgotten password requests and password reset flows.

## Endpoints

| Method | Endpoint                                  | Description                                                         | Auth Required |
|:--------:|:-------------------------------------------|:---------------------------------------------------------------------|:----------------:|
| POST   | `/auth/login`                         | Authenticate a user by its credentials            | ❌             |
| POST   | `/auth/logout`                         | Finish the user's session            | ✅             |
| POST   | `/auth/refresh`                         | Refresh the user's session            | ✅             |
| POST   | `/auth/forgot-password`                         | Initiate password recovery process            | ❌             |
| POST   | `/auth/reset-password`                         | Reset the user's password            | ✅             |

---

## Example Payloads

### Do Login
```json
POST /auth/login

{
  "email": "jonh.doe@example.com",
  "password": "randomPassword123"
}
