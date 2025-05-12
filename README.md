# tv-practical

## Objective
This project implements the back-end services required for a customer to connect their TV to fibertime™ using a mobile device. It provides secure, scalable APIs for:
- Generating and validating TV pairing codes.
- User authentication via phone number and OTP.
- Managing the connection between TV and mobile device.
- Retrieving and displaying user bundle information.

## Features
- RESTful API built with NestJS (Node.js).
- MongoDB for data storage, with indexes for efficient querying.
- JWT authentication and role-based access control.
- Rate limiting on OTP endpoints.
- Real-time updates via WebSockets and polling.
- Redis caching for performance.
- Dockerized for easy setup and deployment.
- API documentation via Swagger (`/api/docs`).
- Postman collection for easy testing.
- Database seeding for development/demo.

## Prerequisites
- Docker and Docker Compose installed.
- Ensure nothing is running on port `27012`.

## Project Walkthrough (Audio)
A narrated walkthrough of the project is available in the included `fibertime.mp3` file.  
This audio recording explains the architecture, security, and user flow, and guides you through the main features and API endpoints.  
You can listen to this file for a concise overview of how the system works and how to use the provided APIs.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Dee66/tv-practical.git
   cd tv-practical
   ```
2. Start the application using Docker Compose:
   ```bash
   docker compose up
   ```
3. Access the application:
   - **Frontend:** http://localhost/
   - **API Docs (Swagger):** http://localhost:3000/api/docs
4. Stop the application:
   ```bash
   docker compose down
   ```

## API Usage

### Device Management

#### POST `/api/device/create-device-code`
Generates a random 4-character alphanumeric pairing code and stores it.
```json
Request Body:
{
  "mac_address": "string"
}
Response:
{
  "deviceId": "string",
  "pairingCode": "string",
  "expiresAt": "ISODate",
  "status": "string"
}
```

#### GET `/api/device/device`
Retrieves a device by pairing code.
```json
Query Parameters:
device-code: string

Response:
{
  "deviceId": "string",
  "macAddress": "string",
  "status": "string",
  "expiresAt": "ISODate",
  "code": "string"
}
```

#### POST `/api/device/connect-device`
Connects a device to a bundle.
```json
Request Body:
{
  "deviceId": "string",
  "bundleId": "string"
}
Response:
{
  "deviceId": "string",
  "status": "string",
  "bundle": "string"
}
```

#### GET `/api/device/connection-status`
Checks if the connection is successful.
```json
Query Parameters:
deviceId: string

Response:
{
  "deviceId": "string",
  "status": "string",
  "connected": "boolean"
}
```

### Authentication

#### POST `/api/auth/request-otp`
Creates a client if they do not exist and generates an OTP.
```json
Request Body:
{
  "cellNumber": "string"
}
Response:
{
  "message": "OTP sent successfully"
}
```

#### POST `/api/auth/login`
Validates the client’s cell number with the OTP.
```json
Request Body:
{
  "cellNumber": "string",
  "otp": "string"
}
Response:
{
  "accessToken": "string"
}
```

### Bundle Management

#### GET `/api/user/user-bundle`
Retrieves the authenticated user's active bundle(s).
```json
Headers:
Authorization: Bearer <JWT>

Response:
{
  "bundles": [ ... ]
}
```

## Database Schema

### Device Collection
| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| mac_address | String | Unique MAC address of the device         |
| code        | String | Pairing code                             |
| status      | String | Device status (`active`, `expired`, `connected`) |
| expires_at  | Date   | Expiration time of the pairing code      |
| bundle      | String | Associated bundle ID (or `null`)         |

### User Collection
| Field       | Type           | Description                              |
|-------------|----------------|------------------------------------------|
| cell_number | String         | Unique phone number of the user          |
| devices     | [ObjectId]     | List of associated device IDs            |
| bundles     | [ObjectId]     | List of associated bundle IDs            |
| createdAt   | Date           | Timestamp when the user was created      |
| updatedAt   | Date           | Timestamp when the user was last updated |

### OTP Collection
| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| cell_number | String | Phone number associated with the OTP      |
| otp         | String | One-time password                        |
| status      | String | OTP status (`active`, `used`)            |
| expires_at  | Date   | Expiration time of the OTP               |

## Additional Notes

- Pairing codes expire after 5 minutes and are automatically removed.
- Rate limiting is applied to OTP requests to prevent abuse.
- JWT is used for authentication, with a 15-minute expiration.
- Real-time updates are available via WebSockets.
- Redis is used for caching frequently accessed data.
- All endpoints are documented in Swagger (`/api/docs`).

## Testing

- Use the provided Postman collection (`fibertime_be/postman.json`) to test the APIs.
- Run unit tests:
  ```bash
  npm run test
  ```

## License

This project is licensed under the MIT License.