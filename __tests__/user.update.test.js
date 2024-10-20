const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app'); // Your Express app
const {
	IS_PRODUCT_SAVED
} = require('../controllers/user/user.update.controller.js');
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../models/USER.model.js");
const { 
    PRODUCT_MODEL, 
} = require("../models/PRODUCT.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL } = require("../models/ACCOUNT.model.js");

describe('Account Update Controller', () => {
    // Test data
    const mockClientData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        mobile: '1234567890',
        password: 'securePassword',
        account_type: 'client',
        client: {
            client_company_name: 'Test Company',
            client_company_email: 'company@example.com',
            client_company_mobile: '9876543210',
            client_company_address: '123 Test St',
            client_company_website: 'www.example.com',
            client_company_handler_position: 'Manager'
        }
    };

    const mockSupplierData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        mobile: '0987654321',
        password: 'securePassword',
        account_type: 'supplier',
        supplier: {
            supplier_type: 'manufacturer',
            supplier_description: 'Test supplier',
            supplier_company_name: 'Supply Co',
            supplier_company_email: 'supply@example.com',
            supplier_company_mobile: '5555555555',
            supplier_company_address: '456 Supply St',
            supplier_company_website: 'www.supply.com',
            supplier_company_handler_position: 'Owner',
            supplier_approval_status: true,
            supplier_status_stage: 'approved'
        }
    };

    const mockAdminData = {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        mobile: '1112223333',
        password: 'adminPass789',
        account_type: 'admin',
        role: 'super_admin'
    };

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
//            ADMIN_MODEL.deleteMany(),
			PRODUCT_MODEL.deleteMany(),
		]);
    });

    describe('UPDATE_USER_DETAILS', () => {
        test('should successfully update a user account', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.status).toBe(200);
            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
            expect(user).toBeDefined();

			const update_response = await request(app)
                .put(`/api/user/update/details?user_id=${user?._id}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
				.send({
					first_name: 'edited name',
					last_name:	'edited last_name',
					mobile:		'0987654321'
				})
 
			expect(update_response.status).toBe(200);
            expect(update_response.body.error).toBe(false);

            const edited_user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });

			expect(edited_user?.first_name).toBe('edited name');
			expect(edited_user?.last_name).toBe('edited last_name');
			expect(edited_user?.mobile).toBe('0987654321');
        });
    });
    describe('UPDATE_USER_ACCOUNT_DETAILS', () => {
        test('should successfully update a client account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockClientData);

			expect(response.status).toBe(200);
			// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
			expect(user).toBeDefined();

			const update_response = await request(app)
				.put(`/api/user/update/account/details?account_id=${user?._id}&account_type=${user?.account_type}`)

				.set('Authorization', `Bearer ${response?.body?.token}`)
				.send({
					name:	'innovation core',
					email:	'innovationcore@co.ke',
					mobile:	'0987654321',
					address:'Nairobi, Kenya',
					position:'Manager',
				})
 
			expect(update_response.status).toBe(200);
			expect(update_response.body.error).toBe(false);
 
			const client_model_updated = await CLIENT_MODEL.findOne({ user_model_ref: user?._id });
			expect(client_model_updated?.company?.name).toBe('innovation core');
			expect(client_model_updated?.company?.email).toBe('innovationcore@co.ke');
			expect(client_model_updated?.company?.mobile).toBe('0987654321');
			expect(client_model_updated?.company?.address).toBe('Nairobi, Kenya');
			expect(client_model_updated?.company?.position).toBe('Manager');
        });
		test('should successfully update a supplier account', async () => {
			const response = await request(app)
				.post('/api/auth/signup')
				.send(mockSupplierData);

			expect(response.status).toBe(200);
				// Verify database entries
			const user = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email });
			expect(user).toBeDefined();

			const update_response = await request(app)
				.put(`/api/user/update/account/details?account_id=${user?._id}&account_type=${user?.account_type}`)
				.set('Authorization', `Bearer ${response?.body?.token}`)
				.send({
					name:	'innovation core',
					email:	'innovationcore@co.ke',
					mobile:	'0987654321',
					address:'Nairobi, Kenya',
					position:'Manager',
					website: 'https://prokemia.com',
					description:'A description',
				})
 
			expect(update_response.status).toBe(200);
			expect(update_response.body.error).toBe(false);

                
            const supplier_model_updated = await SUPPLIER_MODEL.findOne({ user_model_ref: user?._id });
			expect(supplier_model_updated?.company?.name).toBe('innovation core');
			expect(supplier_model_updated?.company?.email).toBe('innovationcore@co.ke');
			expect(supplier_model_updated?.company?.mobile).toBe('0987654321');
			expect(supplier_model_updated?.company?.address).toBe('Nairobi, Kenya');
			expect(supplier_model_updated?.company?.position).toBe('Manager');
			expect(supplier_model_updated?.company?.website).toBe('https://prokemia.com');
			expect(supplier_model_updated?.description).toBe('A description');
        });
		

    });
	/*
	describe('HANDLE_ACCOUNT_SAVED_PRODUCTS', ()=>{
	
	});
	describe('HANDLE HELPER FUNCTIONS', () => {
        it('should return a date 30 days in the future', () => {
            const now = new Date();
            const result = HANDLE_GET_NEXT_30_DAYS();
            const expectedDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                
            expect(result).toBe(expectedDate.getTime());
        });
		it('should prepare notification payload correctly', async () => {
            const mockUser = {
                _id: 'user-id',
                first_name: 'John',
                email: 'john@example.com'
            };

            await HANDLE_NOTIFICATIONS(mockUser);
            // Add assertions here when message broker is implemented
            // For now, we can verify the function doesn't throw errors
            //expect(async () => await HANDLE_NOTIFICATIONS(mockUser)).not.toThrow();
        });
    });
	*/
});
