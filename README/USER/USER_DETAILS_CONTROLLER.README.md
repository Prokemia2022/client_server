# User Data Controller Documentation

This controller is responsible for retrieving a user's account data based on their account type. It uses different models depending on whether the user is a client, supplier, or admin, and populates related data.

## Dependencies

### Models
- **`USER_BASE_MODEL`**: The primary model for user data.
- **`ACCOUNT_STATUS_MODEL`**: The model for tracking account status.
- **`DOCUMENT_MODEL`**: The model for storing product-related documents.
- **`PRODUCT_MODEL`**: The model for storing product data.
- **`REQUEST_MODEL`**: The model for handling product requests.
- **`MARKET_MODEL`**: The model for storing market information.
- **`SUPPLIER_MODEL`**: The model for storing supplier-specific information.
- **`CLIENT_MODEL`**: The model for storing client-specific information.

### Libraries
- **`LOGGER`**: A logging utility for recording errors and events.

## Function: `FETCH_USER_DATA`

### Description:
This asynchronous function fetches the user's account data based on their `account_type` (client, supplier, or admin) and returns the populated data.

### Request Parameters:
- **`USER_ID`**: The ID of the user, extracted from the JWT `sub` field (`req.user?.sub`).

### Workflow:
1. **Determine Account Type**: Based on the user's `account_type`, the function queries the appropriate references and populates the necessary fields.
    - **Client**: Retrieves the user's client account information and populates associated `products`, `lister`, `seller`, `supplier`, `documents`, `industry`, and `technology`.
    - **Supplier**: Retrieves the user's supplier account and populates `industry` and `technology`.
    - **Admin**: Retrieves the admin account data.
2. **Send Response**: On success, the populated account data is returned in the response.

### Account Type Breakdown:

1. **Client**:
   - Populates the user's associated `account_status_model_ref` and `client_account_model_ref`.
   - Populates the `products` field inside the `client_account_model_ref` with:
     - **Lister**: Populates `company` information.
     - **Seller**: Populates `company` information.
     - **Supplier**: Populates `company` information.
   - Selects key fields from products: `name`, `lister`, `seller`, `supplier`, `documents`, `industry`, and `technology`.

2. **Supplier**:
   - Populates the user's associated `account_status_model_ref` and `supplier_account_model_ref`.
   - Populates the `supplier_account_model_ref` with:
     - **Industry**: Selects `title` field.
     - **Technology**: Selects `title` field.

3. **Admin**:
   - Populates the user's associated `account_status_model_ref` and `admin_account_model_ref`.

### Example Response:
```json
{
	"error": null,
	"data": {
		"_id": "60c72b2f9b1e8a4d2c7a9d34",
		"first_name": "John",
		"last_name": "Doe",
		"client_account_model_ref": {
			"products": [
				{
					"name": "Product A",
					"lister": { "company": "Lister Company A" },
					"seller": { "company": "Seller Company A" },
					"supplier": { "company": "Supplier Company A" },
					"documents": [...],
					"industry": "Chemical",
					"technology": "Biotech"
				}
			]
		}
	}
}
```

