# User Account Creation Controller Documentation

## Overview
This controller handles the creation of new user accounts in the system. It supports multiple account types (client, supplier, admin) and manages the creation of associated models and account statuses.

## Dependencies

### Middleware
- `Hash.middleware.js` - Password hashing functionality
- `token.handler.middleware.js` - Authentication token generation
- `MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js` - Message broker integration

### Libraries
- `logger.lib.js` - Logging functionality
- `error.lib.js` - Custom error handling (ValidationError)

### Models
- `USER.model.js`
  - `USER_BASE_MODEL` - Base user information
  - `ACCOUNT_STATUS_MODEL` - Account status tracking
- `ACCOUNT.model.js`
  - `CLIENT_MODEL` - Client-specific information
  - `SUPPLIER_MODEL` - Supplier-specific information
  - `ADMIN_MODEL` - Administrator information

## Constants
```javascript
const ALLOWED_ACCOUNT_TYPES = ['client', 'supplier', 'admin'];
```

## Main Function: NEW_USER_ACCOUNT

### Purpose
Creates a new user account with associated models based on the account type.

### Endpoint
```
POST /api/auth/signup
```

### Request Body Schema
```javascript
{
    first_name: String,
    last_name: String,
    email: String,
    mobile: String,
    password: String,
    account_type: String, // 'client' | 'supplier' | 'admin'
    
    // Optional fields based on account_type
    client?: {
        client_company_name: String,
        client_company_email: String,
        client_company_mobile: String,
        client_company_address: String,
        client_company_website: String,
        client_company_handler_position: String
    },
    supplier?: {
        supplier_type: String,
        supplier_description: String,
        supplier_company_name: String,
        supplier_company_email: String,
        supplier_company_mobile: String,
        supplier_company_address: String,
        supplier_company_website: String,
        supplier_company_handler_position: String,
        supplier_approval_status: Boolean,
        supplier_status_stage: String
    },
    role?: String // for admin accounts
}
```

### Response Format
```javascript
// Success Response (200)
{
    error: false,
    message: 'sign up successful',
    token: 'JWT_TOKEN'
}

// Validation Error Response (400)
{
    error: true,
    message: 'Error description'
}

// Server Error Response (500)
{
    error: true,
    message: 'We could not create your account at this time.'
}
```

## Helper Functions

### VALIDATE_ACCOUNT_TYPES
Validates that the provided account type is allowed.
```javascript
VALIDATE_ACCOUNT_TYPES(accountType: string) => void
```

### CHECK_EXISTING_ACCOUNT
Checks if an account with the provided email already exists.
```javascript
CHECK_EXISTING_ACCOUNT(email: string) => Promise<void>
```

### CREATE_BASE_USER
Creates the base user model with common fields.
```javascript
CREATE_BASE_USER(payload: Object, hashedPassword: string) => Promise<UserModel>
```

### CREATE_SPECIFIC_ACCOUNT
Creates the specific account type model (client, supplier, or admin).
```javascript
CREATE_SPECIFIC_ACCOUNT(user: UserModel, payload: Object) => Promise<void>
```

### CREATE_ACCOUNT_STATUS
Creates and links an account status model to the user.
```javascript
CREATE_ACCOUNT_STATUS(user: UserModel) => Promise<void>
```

## Account Type Specific Functions

### CREATE_ADMIN_MODEL
Creates an admin account with specified role.
```javascript
CREATE_ADMIN_MODEL(user: UserModel, role?: string) => Promise<void>
```

### CREATE_CLIENT_MODEL
Creates a client account with optional company details.
```javascript
CREATE_CLIENT_MODEL(user: UserModel, clientData: Object | null) => Promise<void>
```

### CREATE_SUPPLIER_MODEL
Creates a supplier account with optional company and supplier-specific details.
```javascript
CREATE_SUPPLIER_MODEL(user: UserModel, supplierData: Object | null, type?: string) => Promise<void>
```

## Data Formatting Functions

### formatClientData
Formats client company data for database storage.
```javascript
formatClientData(clientData: Object) => Object | null
```

### formatSupplierData
Formats supplier company data for database storage.
```javascript
formatSupplierData(supplierData: Object) => Object | null
```

## Error Handling
The controller uses a custom ValidationError class for handling validation errors and includes comprehensive error logging. Errors are categorized as:
- Validation errors (400)
- Server errors (500)

## Notifications
The controller supports email notifications through a message broker system (currently commented out):
```javascript
handleNewUserNotifications(user: UserModel, payload: Object) => Promise<void>
```

## Account Status Details
New accounts are created with the following default status:
- Clients: Automatically approved
- Suppliers and Admins: Require manual approval
- All accounts start with:
  - No suspension
  - No deletion status
  - Email notifications enabled
  - SMS and push notifications enabled
  - Onboarding incomplete
  - Profile incomplete

## Usage Example
```javascript
const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        mobile: '1234567890',
        password: 'secure_password',
        account_type: 'client',
        client: {
            client_company_name: 'Example Corp',
            client_company_email: 'info@example.com',
            // ... other client details
        }
    })
});
```

# User Sign-In Controller Documentation

This controller is responsible for handling the sign-in process of a user. It validates the user's credentials, generates an authentication token, updates the account activity status, and sends notifications.

## Dependencies

### Middlewares
- **`AUTH_TOKEN_GENERATOR`**: Middleware to generate authentication tokens for user sessions.
- **`PUBLISH_MESSAGE_TO_BROKER`**: Middleware for publishing messages to a message broker (used for notifications).

### Models
- **`USER_BASE_MODEL`**: The model for storing general user information.
- **`ACCOUNT_STATUS_MODEL`**: The model for tracking the user's account status and activity.

### Libraries
- **`LOGGER`**: A logging utility for recording events and errors.
- **`ValidationError`**: A custom error class for handling validation errors.

## Function: `SIGN_IN_USER`

### Description:
This asynchronous function handles the user sign-in process by:
1. Validating the user's credentials.
2. Generating an authentication token if the credentials are valid.
3. Sending a notification to the user.
4. Updating the last active status of the user's account.
5. Returning a success response with the authentication token.

### Request Payload:
- **`email`**: The email address of the user attempting to sign in.
- **`password`**: The password associated with the user's email.

### Workflow:
1. **Validation**: The function queries the `USER_BASE_MODEL` to find a user with the provided email and checks if the password matches the stored hashed password using `bcrypt`.
2. **Authentication Token Generation**: If the credentials are valid, an authentication token is generated using the `AUTH_TOKEN_GENERATOR` middleware.
3. **Handle Notifications**: The `handleNewUserNotifications` function is called to send notifications (e.g., welcome back email) using the message broker.
4. **Update Last Active Status**: The `ACCOUNT_STATUS_MODEL` is updated to set the `last_active` timestamp for the user.
5. **Success Response**: A success response is returned with the message and the generated authentication token.

### Example Request:
```json
{
	"email": "johndoe@example.com",
	"password": "securePassword"
}
```

# Account Email Verification Module

This module handles user email verification by generating verification codes, sending them via email, and verifying the user's email address. The process includes two main functions: `GET_VERIFICATION_CODE_EMAIL` and `VERIFY_USER_ACCOUNT`.

## Utilities

### Middleware

- **PUBLISH_MESSAGE_TO_BROKER**: Publishes messages to a specified message broker queue (used for email delivery).

### Libraries

- **LOGGER**: Used for logging system events and errors.
- **VERIFY_USER_ACCOUNT_ERROR_HTML_TEMPLATE**: Template for displaying an error when email verification fails.
- **VERIFY_USER_ACCOUNT_SUCCESS_HTML_TEMPLATE**: Template for displaying success when email verification succeeds.
- **CODE_GENERATOR_FUNC**: Generates a unique verification code.

### Models

- **USER_BASE_MODEL**: User model used to query the database for user data.
- **ACCOUNT_STATUS_MODEL**: Model used to track and update the status of user accounts (e.g., email verification status).

## Functions

### `GET_VERIFICATION_CODE_EMAIL(req, res)`

This function generates a verification code and sends it to the user's email address if the account has not been verified yet.

#### Parameters

- `req.query.email`: The email address for which the verification code is requested.

#### Workflow

1. **Check Email Verification Status**:  
   Queries the database for the user's account using the provided email. If the email is already verified, a message is returned to the user.
   
2. **Generate Verification Code**:  
   If the email is not verified, a verification code is generated using the `CODE_GENERATOR_FUNC()`.

3. **Publish to Message Broker**:  
   An email payload containing the user's name, email, and the generated verification code is sent to the email queue via the `PUBLISH_MESSAGE_TO_BROKER` middleware.

4. **Response**:  
   Returns a success message indicating that the verification code has been sent.

#### Response

- **200 OK**: Verification code sent successfully.
- **500 Internal Server Error**: System error while sending the verification email.

---

### `VERIFY_USER_ACCOUNT(req, res)`

This function verifies the user's email address by checking the verification status and updating the account if necessary.

#### Parameters

- `req.query.email`: The email address to be verified.

#### Workflow

1. **Retrieve User Account**:  
   Fetches the user account from the database using the provided email. If no account exists, an error template is returned.

2. **Check Email Verification Status**:  
   If the email is already verified, a success template is returned.

3. **Update Account Status**:  
   If the email is not yet verified, the account status is updated to mark the email as verified, and the success template is returned.

4. **Logging**:  
   Logs success or error messages depending on the outcome.

#### Response

- **200 OK**: Email successfully verified or already verified.
- **500 Internal Server Error**: System error while verifying the email.

## Usage

