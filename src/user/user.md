# User Module

### Entity that represents the main user of the application

This entity represents the core user of the application. The entity includes essential personal information, authentication credentials, and relations to appointments, services, availability schedules, and session data. It serves as the foundation for user-related operations, supporting both client-side and administrative features.

## Endpoints

| Method | Endpoint                                  | Description                                                         | Auth Required |
|:--------:|:-------------------------------------------|:---------------------------------------------------------------------|:----------------:|
| GET    | `/users`                         | List all users                                    | ✅             |
| POST   | `/users`                         | Create a new user            | ❌             |
| GET    | `/users/:id`          | Find user by the provided id  | ✅             |
| GET    | `/users/email/:email`      | Find user by the provided email                          | ✅             |
| GET    | `/users/me`      | Get the current user                          | ✅             |
| PUT    | `/users/:id`                     | Update an existing user                           | ✅             |
| PATCH    | `/users/:id/password`                     | Update the password of an existing user                           | ✅             |
| DELETE | `/users/:id`                     | Delete an existing user                           | ✅             |

---

## Example Payloads

### Create User
POST /users

```json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "photo": "profile-picture.jpg" // Optional
}

```