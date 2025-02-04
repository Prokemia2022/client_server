const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Your Express app
const {
	HANDLE_GET_NEXT_30_DAYS
} = require('../controllers/user/user.delete.controller.js');
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../models/USER.model.js");
const { 
    DOCUMENT_MODEL, 
    PRODUCT_MODEL, 
    REQUEST_MODEL, 
    MARKET_MODEL 
} = require("../models/PRODUCT.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL, ADMIN_MODEL, SALESPERSON_MODEL } = require("../models/ACCOUNT.model.js");
const { mockClientData,mockSalespersonData,mockAdminData,mockSupplierData } = require('./mock_data.js');

describe('Account Deletion Controller', () => {

    beforeAll(async () => {
        // Setup in-memory MongoDB for testing
        await mongoose.connect('mongodb://localhost:27017/test');
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        await Promise.all([
            USER_BASE_MODEL.deleteMany(),
            ACCOUNT_STATUS_MODEL.deleteMany(),
            CLIENT_MODEL.deleteMany(),
            SUPPLIER_MODEL.deleteMany(),
            ADMIN_MODEL.deleteMany(),
			PRODUCT_MODEL.deleteMany(),
			REQUEST_MODEL.deleteMany(),
			DOCUMENT_MODEL.deleteMany()
        ]);
    });

    describe('HANDLE_FLAG_ACCOUNT_DELETION', () => {
        test('should successfully flag a client account for deletion', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.status).toBe(200);
            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
            expect(user).toBeDefined();

			const flag_response = await request(app)
                .put(`/api/user/flag/delete/account?account_id=${user?._id}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
 
			expect(flag_response.status).toBe(200);
            expect(flag_response.body.error).toBe(false);

			const accountStatus = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
            expect(accountStatus).toBeDefined();
            expect(accountStatus?.deletion?.status).toBe(true);
        });

        test('should successfully flag a supplier account for deletion', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockSupplierData);

            expect(response.status).toBe(200);
            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email });
            expect(user).toBeDefined();

			const flag_response = await request(app)
                .put(`/api/user/flag/delete/account?account_id=${user?._id}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
 
			expect(flag_response.status).toBe(200);
            expect(flag_response.body.error).toBe(false);

			const accountStatus = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
            expect(accountStatus).toBeDefined();
            expect(accountStatus?.deletion?.status).toBe(true);
        });

        test('should successfully flag a salesperson account for deletion', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockSalespersonData);

            expect(response.status).toBe(200);
            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockSalespersonData?.email });
            expect(user).toBeDefined();

			const flag_response = await request(app)
                .put(`/api/user/flag/delete/account?account_id=${user?._id}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
 
			expect(flag_response.status).toBe(200);
            expect(flag_response.body.error).toBe(false);

			const accountStatus = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
            expect(accountStatus).toBeDefined();
            expect(accountStatus?.deletion?.status).toBe(true);
        });

        test('should successfully flag a admin account for deletion', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockAdminData);

            expect(response.status).toBe(200);
            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockAdminData?.email });
            expect(user).toBeDefined();

			const flag_response = await request(app)
                .put(`/api/user/flag/delete/account?account_id=${user?._id}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
 
			expect(flag_response.status).toBe(200);
            expect(flag_response.body.error).toBe(false);

			const accountStatus = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
            expect(accountStatus).toBeDefined();
            expect(accountStatus?.deletion?.status).toBe(true);
        });

        
    });

    describe('HANDLE_ACCOUNT_DELETION', () => {
        test('should successfully delete a client account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockClientData)

			expect(response.status).toBe(200);
				// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
			expect(user).toBeDefined();

			const deletion_response = await request(app)
				.delete(`/api/user/delete/account?account_id=${user?._id}&account_type=${user?.account_type}`)
				.set('Authorization', `Bearer ${response?.body?.token}`);
 
			expect(deletion_response.status).toBe(200);
			expect(deletion_response.body.error).toBe(false);

                
            const check_if_user_exists = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
			const check_if_user_account_status_exists = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
			const check_if_user_client_model_exists = await CLIENT_MODEL.findOne({ user_model_ref: user?._id });
			expect(check_if_user_exists).toBe(null);
			expect(check_if_user_account_status_exists).toBe(null);
			expect(check_if_user_client_model_exists).toBe(null);
        });

		test('should successfully delete a supplier account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockSupplierData);

			expect(response.status).toBe(200);
				// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email });
			expect(user).toBeDefined();

			const deletion_response = await request(app)
				.delete(`/api/user/delete/account?account_id=${user?._id}&account_type=${user?.account_type}`)
				.set('Authorization', `Bearer ${response?.body?.token}`);
 
			expect(deletion_response.status).toBe(200);
			expect(deletion_response.body.error).toBe(false);

                
            const check_if_user_exists = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email });
			const check_if_user_account_status_exists = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
			const check_if_user_client_model_exists = await CLIENT_MODEL.findOne({ user_model_ref: user?._id });
			expect(check_if_user_exists).toBe(null);
			expect(check_if_user_account_status_exists).toBe(null);
			expect(check_if_user_client_model_exists).toBe(null);
        });

        test('should successfully delete a salesperson account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockSalespersonData);

			expect(response.status).toBe(200);
				// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockSalespersonData?.email });
			expect(user).toBeDefined();

			const deletion_response = await request(app)
				.delete(`/api/user/delete/account?account_id=${user?._id}&account_type=${user?.account_type}`)
				.set('Authorization', `Bearer ${response?.body?.token}`);
 
			expect(deletion_response.status).toBe(200);
			expect(deletion_response.body.error).toBe(false);

                
            const check_if_user_exists = await USER_BASE_MODEL.findOne({ email: mockSalespersonData?.email });
			const check_if_user_account_status_exists = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
			const check_if_user_salesperson_model_exists = await SALESPERSON_MODEL.findOne({ user_model_ref: user?._id });
			expect(check_if_user_exists).toBe(null);
			expect(check_if_user_account_status_exists).toBe(null);
			expect(check_if_user_salesperson_model_exists).toBe(null);
        });

        test('should successfully delete a admin account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockAdminData);

			expect(response.status).toBe(200);
				// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockAdminData?.email });
			expect(user).toBeDefined();

			const deletion_response = await request(app)
				.delete(`/api/user/delete/account?account_id=${user?._id}&account_type=${user?.account_type}`)
				.set('Authorization', `Bearer ${response?.body?.token}`);
 
			expect(deletion_response.status).toBe(200);
			expect(deletion_response.body.error).toBe(false);

                
            const check_if_user_exists = await USER_BASE_MODEL.findOne({ email: mockAdminData?.email });
			const check_if_user_account_status_exists = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
			const check_if_user_admin_model_exists = await ADMIN_MODEL.findOne({ user_model_ref: user?._id });
			expect(check_if_user_exists).toBe(null);
			expect(check_if_user_account_status_exists).toBe(null);
			expect(check_if_user_admin_model_exists).toBe(null);
        });
    });

	describe('HANDLE HELPER FUNCTIONS', () => {
        test('should return a date 30 days in the future', () => {
            const now = new Date();
            const result = HANDLE_GET_NEXT_30_DAYS();
            const expectedDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                
            expect(result).toBe(expectedDate.getTime());
        });
    });
});
