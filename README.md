# tv-practical

## Objective
This project is a back-end system that enables users to connect their TV to fibertime™ using a mobile device. It provides APIs for:
- Generating and validating TV pairing codes.
- User authentication via phone number and OTP.
- Managing the connection between the TV and mobile device.
- Retrieving user bundle information.

## Prerequisites
- Ensure Docker and Docker Compose are installed on your system.
- Ensure nothing is running on port `27012`.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/Dee66/tv-practical.git
   cd tv-practical


Start the application using Docker Compose:


docker compose up
Access the application:


Frontend: http://localhost/
Backend: http://localhost/api/
Stop the application:


docker compose down
<hr></hr>
API Usage
Endpoints
Device Management
POST /api/device/create-device-code


Description: 
Generates a random 4-character alphanumeric pairing code and stores it.

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

GET /api/device/device


Description: Retrieves a device by pairing code.

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

POST /api/device/connect-device


Description: Connects a device to a bundle.
Request Body:
{
"deviceCode": "string",
"bundleId": "string"
}
Response:
{
"deviceId": "string",
"status": "string",
"bundle": "string"
}
GET /api/device/connection-status


Description: Checks if the connection is successful.
Query Parameters:
device-id: string
Response:
{
"deviceId": "string",
"status": "string",
"connected": "boolean"
}
Authentication
POST /api/auth/request-otp


Description: Creates a client if they do not exist and generates an OTP.
Request Body:
{
"cell_number": "string"
}
Response:
{
"message": "OTP sent successfully"
}
POST /api/auth/login


Description: Validates the client’s cell number with the OTP.
Request Body:
{
"cell_number": "string",
"otp": "string"
}
Response:
{
"token": "string"
}
<hr></hr>
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
| devices     | [ObjectId]     | List of associated device IDs (references `Device`) |
| bundles     | [ObjectId]     | List of associated bundle IDs (references `Bundle`) |
| createdAt   | Date           | Timestamp when the user was created      |
| updatedAt   | Date           | Timestamp when the user was last updated |

### OTP Collection
| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| cell_number | String | Phone number associated with the OTP      |
| otp         | String | One-time password                        |
| status      | String | OTP status (`active`, `used`)             |
| expires_at  | Date   | Expiration time of the OTP                |
<hr></hr>
Additional Notes

- Pairing codes expire after 5 minutes and are automatically removed from the database.
- Rate limiting is applied to OTP requests to prevent abuse.
- JWT is used for authentication, with a 15-minute expiration time.
<hr></hr>
Testing

Use the provided Postman collection (postman_collection.json) to test the APIs.
Run unit tests:
npm run test
<hr></hr>
License

This project is licensed under the MIT License.