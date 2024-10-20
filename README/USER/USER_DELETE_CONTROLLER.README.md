# User Account Deletion Documentation

## Overview

This document outlines the process of user account deletion in our system. The deletion process is implemented in two stages: flagging an account for deletion and performing the actual deletion. The system supports two types of accounts: client and supplier.

## Flagging an Account for Deletion

### Function: `HANDLE_FLAG_ACCOUNT_DELETION`

This function marks an account for deletion, scheduling it to be removed after 30 days.

#### Process:
1. Retrieve the account ID from the request query.
2. Find the existing account in the database.
3. Update the account status in `ACCOUNT_STATUS_MODEL`:
   - Set deletion status to true
   - Set deletion reason (if provided)
   - Set deletion date to 30 days from now
4. Send a notification to the user.
5. Log the successful operation.

#### Error Handling:
- If any error occurs, log it and return a 500 status with an error message.

## Performing Account Deletion

### Function: `HANDLE_ACCOUNT_DELETION`

This function performs the actual deletion of an account and its associated data.

#### Process:
1. Retrieve the account ID and type from the user object in the request.
2. Based on the account type:
   - For client accounts: Call `DELETE_CLIENT_MODELS`
   - For supplier accounts: 
     - Retrieve the supplier account details
     - Call `DELETE_SUPPLIER_MODELS` with account ID, products, and documents
3. Log the successful operation.

#### Error Handling:
- If a `ValidationError` occurs, return a 400 status with the error message.
- For any other error, log it and return a 500 status with an error message.

### Helper Functions:

#### `DELETE_CLIENT_MODELS`
- Update related requests to inactive status
- Delete the client model
- Delete the account status
- Delete the base user model

#### `DELETE_SUPPLIER_MODELS`
- Update related requests to inactive status
- Delete associated products
- Delete associated documents
- Remove product and document references from markets
- Delete the supplier model
- Delete the account status
- Delete the base user model

## Additional Helper Functions

### `HANDLE_GET_NEXT_30_DAYS`
Calculates the timestamp for 30 days from the current date.

### `HANDLE_NOTIFICATIONS`
Prepares the payload for sending a notification about account deletion. (Note: Actual sending is commented out, pending message broker implementation)

## Error Handling

The system uses a custom `ValidationError` for handling validation-related errors. All other errors are treated as server errors and logged accordingly.

## Logging

The system uses a custom `LOGGER` to log both successful operations and errors, which is crucial for monitoring and debugging the account deletion process.

## Important Notes

- The account flagging process gives users a 30-day window before actual deletion, allowing them to reconsider or recover their account if needed.
- Different procedures are followed for client and supplier accounts to ensure all related data is properly handled during deletion.
- Proper error handling and logging are implemented throughout the process to maintain system integrity and provide debugging information.
