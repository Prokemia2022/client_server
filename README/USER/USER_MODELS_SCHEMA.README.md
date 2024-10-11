/*
************* USERS***********
* SUPLLIERS
* CLIENTS
* ADMIN
* SALESPEOPLE
* CONSULTANTS
*/

# User Base Model Schema

The `USER_BASE_MODEL_SCHEMA` defines the structure for users within your account system. This schema captures all the essential user information, including personal details, account type, related account models, subscription details, and status tracking. The schema is created using Mongoose and supports references to other models for a modular and relational design.

## Fields

### Personal Information
- **first_name**: `String`  
  The user's first name.

- **last_name**: `String`  
  The user's last name.

- **email**: `String, unique: true`  
  The user's email address. Must be unique across all users.

- **mobile**: `String`  
  The user's mobile phone number.

- **profile_image_url**: `String`  
  The URL to the user's profile image.

### Account Information
- **account_type**: `String`  
  Specifies the type of account. Examples include "admin", "supplier", "client", "salesperson", or "consultant."

- **password**: `String`  
  The user's encrypted password for account access.

- **refresh_token**: `String`  
  Token used for refreshing the user's authentication session.

### Requests
- **requests**: `Array of ObjectId, ref: 'REQUEST'`  
  A list of request references related to the user, such as service requests or support tickets.

### Account References
The user model can reference different types of accounts within the system based on their role.

- **admin_account_model_ref**: `ObjectId, ref: 'ADMIN'`  
  Reference to the admin account model.

- **client_account_model_ref**: `ObjectId, ref: 'CLIENT'`  
  Reference to the client account model.

- **supplier_account_model_ref**: `ObjectId, ref: 'SUPPLIER'`  
  Reference to the supplier account model.

- **salesperson_account_model_ref**: `ObjectId, ref: 'SALESPERSON'`  
  Reference to the salesperson account model.

- **consultant_account_model_ref**: `ObjectId, ref: 'CONSULTANT'`  
  Reference to the consultant account model.

### Subscription & Billing
- **subscription_model_ref**: `ObjectId, ref: 'SUBSCRIPTION'`  
  Reference to the user's subscription details, such as billing cycles or plan type.

### Account Status
- **account_status_model_ref**: `ObjectId, ref: 'ACCOUNT_STATUS'`  
  Reference to the user's account status. This might track if the account is active, suspended, or deactivated.

### Timestamps
- **timestamps**: Automatic `createdAt` and `updatedAt` fields that are managed by Mongoose. These fields help in tracking when the account was created and last updated.

---

## Example Document

```json
{
	"first_name": "John",
	"last_name": "Doe",
	"email": "john.doe@example.com",
	"mobile": "+1234567890",
	"profile_image_url": "https://example.com/images/profile/john.jpg",
	"account_type": "supplier",
	"password": "$2b$10$hashedpassword",
	"refresh_token": "some-refresh-token",
	"requests": ["60d21b4667d0d8992e610c85"],
	"admin_account_model_ref": null,
	"client_account_model_ref": null,
	"supplier_account_model_ref": "60d21b4967d0d8992e610c86",
	"salesperson_account_model_ref": null,
	"consultant_account_model_ref": null,
	"subscription_model_ref": "60d21b4e67d0d8992e610c87",
	"account_status_model_ref": "60d21b5667d0d8992e610c88",
	"createdAt": "2024-10-10T12:00:00.000Z",
	"updatedAt": "2024-10-10T12:00:00.000Z"
}
```

# Account Status Model Schema

The `ACCOUNT_STATUS_MODEL_SCHEMA` defines the structure for tracking the status and activity of a user’s account. This schema helps manage the state of an account in terms of approval, suspension, deletion, and communication preferences (email, SMS, push notifications). It also tracks the completion of the user profile and activity metrics.

## Fields

### User Reference
- **user_model_ref**: `String`  
  A reference to the associated user. This stores the `user_model_ref` of the corresponding user.

### Suspension
- **suspension**:  
  - `status`: `Boolean`  
    Indicates whether the account is suspended.
  - `reason`: `String`  
    The reason for the suspension.

### Account Approval
- **approved**: `Boolean`  
  Indicates if the account has been approved for use (e.g., after verification or admin approval).

### Deletion
- **deletion**:  
  - `status`: `Boolean`  
    Indicates if the account is marked for deletion.
  - `reason`: `String`  
    The reason for the deletion.
  - `date`: `Date`  
    The date when the account is set to be deleted.

### Communication Preferences

- **email**:  
  - `status`: `Boolean`  
    Whether the user's email is verified.
  - `notification`: `Boolean`  
    Whether the user has opted in to receive marketing emails.

- **sms**:  
  - `status`: `Boolean`  
    Whether the user's mobile number is verified.
  - `notification`: `Boolean`  
    Whether the user has opted in to receive marketing or transactional SMS messages.

- **push**:  
  - `status`: `Boolean`  
    Whether the user's push notifications are enabled.
  - `notification`: `Boolean`  
    Whether the user has opted in to receive push notifications.

### Onboarding Status
- **onboarding**: `Boolean`  
  Indicates whether the user has completed the onboarding process.

### Profile Completion
- **complete_profile**: `Boolean`  
  Indicates whether the user has completed their profile.

### Activity Metrics
- **last_active**: `Date`  
  Tracks the last active date of the user. This is useful for determining user engagement and activity.

---

## Example Document

```json
{
	"user_model_ref": "60d21b4967d0d8992e610c86",
	"suspension": {
		"status": false,
		"reason": ""
	},
	"approved": true,
	"deletion": {
		"status": false,
		"reason": "",
		"date": null
	},
	"email": {
		"status": true,
		"notification": true
	},
	"sms": {
		"status": true,
		"notification": false
	},
	"push": {
		"status": true,
		"notification": true
	},
	"onboarding": true,
	"complete_profile": false,
	"last_active": "2024-10-10T12:00:00.000Z"
}
```

# Admin Model Schema

The `ADMIN_MODEL_SCHEMA` defines the structure for admin users in the system. It stores information related to the user's role and links to the user base model.

## Fields

- **user_model_ref**: `ObjectId, ref: 'USER'`  
  Reference to the user associated with the admin account.

- **role**: `String`  
  Specifies the role of the admin (e.g., Super Admin, Moderator).

- **timestamps**: `createdAt` and `updatedAt` fields managed by Mongoose.

```json
{
	"user_model_ref": "60d21b4967d0d8992e610c86",
	"role": "Super Admin",
	"createdAt": "2024-10-10T12:00:00.000Z",
	"updatedAt": "2024-10-10T12:30:00.000Z"
}
```

---

# Client Model Schema

The `CLIENT_MODEL_SCHEMA` defines the structure for client accounts. It links to the user model and stores details about the client's company and associated requests or products.

## Fields

- **user_model_ref**: `ObjectId, ref: 'USER'`  
  Reference to the user associated with the client account.

- **company**:  
  - `name`: `String`  
    Name of the company.
  - `email`: `String`  
    Email address of the company.
  - `mobile`: `String`  
    Mobile number for the company.
  - `address`: `String`  
    Physical address of the company.
  - `position`: `String`  
    Position of the client user in the company.

- **requests**: `Array of ObjectId, ref: 'REQUEST'`  
  List of requests associated with the client.

- **products**: `Array of ObjectId, ref: 'PRODUCT'`  
  List of products associated with the client.

- **timestamps**: `createdAt` and `updatedAt` fields managed by Mongoose.

```json
{
	"user_model_ref": "60d21b4967d0d8992e610c87",
	"company": {
		"name": "Example Corp",
		"email": "info@example.com",
		"mobile": "+123456789",
		"address": "1234 Elm St, Springfield",
		"position": "Procurement Manager"
	},
	"requests": ["60d21b4967d0d8992e610c91", "60d21b4967d0d8992e610c92"],
	"products": ["60d21b4967d0d8992e610c93", "60d21b4967d0d8992e610c94"],
	"createdAt": "2024-10-10T12:00:00.000Z",
	"updatedAt": "2024-10-10T12:30:00.000Z"
}
```
---

# Supplier Model Schema

The `SUPPLIER_MODEL_SCHEMA` defines the structure for supplier accounts. It stores the supplier's company details, products, orders, requests, and other relevant information.

## Fields

- **user_model_ref**: `ObjectId, ref: 'USER'`  
  Reference to the user associated with the supplier account.

- **type**: `String`  
  Specifies whether the supplier is a Distributor or Manufacturer.

- **image_url**: `String`  
  URL for the supplier’s company image.

- **description**: `String`  
  Description of the supplier’s account.

- **company**:  
  - `name`: `String`  
    Name of the company.
  - `email`: `String`  
    Company email address.
  - `mobile`: `String`  
    Company mobile number.
  - `address`: `String`  
    Company address.
  - `position`: `String`  
    The position of the supplier user within the company.
  - `website`: `String`  
    Website of the company.

- **products**: `Array of ObjectId, ref: 'PRODUCT'`  
  List of products offered by the supplier.

- **statistics**:  
  - `views`: `Number`  
    The number of views on the supplier's profile.

- **consultants**: `Array of ObjectId, ref: 'CONSULTANT'`  
  List of consultants associated with the supplier.

- **technology**: `ObjectId, ref: 'MARKET'`  
  Reference to the market or technology category the supplier operates in.

- **industry**: `ObjectId, ref: 'MARKET'`  
  Reference to the industry in which the supplier operates.

- **documents**: `Array of ObjectId, ref: 'DOCUMENT'`  
  List of documents related to the supplier.

- **orders**: `Array of ObjectId, ref: 'ORDER'`  
  List of orders associated with the supplier.

- **requests**: `Array of ObjectId, ref: 'REQUEST'`  
  List of service or product requests linked to the supplier.

- **status**:  
  - `status`: `Boolean`  
    Indicates if the supplier account is active.
  - `stage`: `String`  
    The current stage of the supplier (e.g., pending, approved).
  - `comment`: `String`  
    Comments related to the status of the supplier.

- **timestamps**: `createdAt` and `updatedAt` fields managed by Mongoose.

```json
{
	"user_model_ref": "60d21b4967d0d8992e610c88",
	"type": "Manufacturer",
	"image_url": "https://example.com/image.jpg",
	"description": "A leading manufacturer of specialty chemicals.",
	"company": {
		"name": "ChemCo",
		"email": "contact@chemco.com",
		"mobile": "+987654321",
		"address": "5678 Oak St, Metropolis",
		"position": "CEO",
		"website": "https://chemco.com"
	},
	"products": ["60d21b4967d0d8992e610c95", "60d21b4967d0d8992e610c96"],
	"statistics": {
		"views": 1234
	},
	"consultants": ["60d21b4967d0d8992e610c97"],
	"technology": "60d21b4967d0d8992e610c98",
	"industry": "60d21b4967d0d8992e610c99",
	"documents": ["60d21b4967d0d8992e610c9a"],
	"orders": ["60d21b4967d0d8992e610c9b"],
	"requests": ["60d21b4967d0d8992e610c9c"],
	"status": {
		"status": true,
		"stage": "Active",
		"comment": "Verified and approved."
	},
	"createdAt": "2024-10-10T12:00:00.000Z",
	"updatedAt": "2024-10-10T12:30:00.000Z"
}
```
---

# Mongoose Models for User Roles

The following Mongoose models represent the different user roles in the system: Client, Admin, Supplier, Salesperson, and Consultant. These models are based on the respective schemas defined earlier and can be imported into other modules for database operations.

## Models

### USER_BASE_MODEL
The `USER_BASE_MODEL` represents the users in the system.

```javascript
const SUPPLIER_MODEL = mongoose.model("USER", USER_BASE_MODEL_SCHEMA); 
```
### ACCOUNT_STATUS_MODEL
The `ACCOUNT_STATUS_MODEL` represents the account status in the system.

```javascript
const ACCOUNT_STATUS_MODEL = mongoose.model("ACCOUNT_STATUS_MODEL", ACCOUNT_STATUS_MODEL_SCHEMA); 
```

### Admin Model
The `ADMIN_MODEL` represents the admin users in the system.

```javascript
const ADMIN_MODEL = mongoose.model("ADMIN", ADMIN_MODEL_SCHEMA);
```
### CLIENT_MODEL
The `CLIENT_MODEL` represents the client users in the system.

```javascript
const CLIENT_MODEL = mongoose.model("CLIENT", CLIENT_MODEL_SCHEMA);
```

### SUPPLIER_MODEL
The `SUPPLIER_MODEL` represents the suppliers users in the system.

```javascript
const SUPPLIER_MODEL = mongoose.model("SUPPLIER", SUPPLIER_MODEL_SCHEMA); 
```

## Usage Example
```javascript
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('./models/USER.model.js');
```

## Usage Example
```javascript
const { ADMIN_MODEL, CLIENT_MODEL, SUPPLIER_MODEL } = require('./models/ACCOUNT.model.js');
```

