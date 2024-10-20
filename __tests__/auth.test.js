// tests/controllers/user.controller.test.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../app'); // Your Express app
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('../models/USER.model');
const { CLIENT_MODEL, SUPPLIER_MODEL, ADMIN_MODEL } = require('../models/ACCOUNT.model');
const { HASH_STRING } = require('../middleware/Hash.middleware');
const { AUTH_TOKEN_GENERATOR, CODE_TOKEN_GENERATOR } = require('../middleware/token.handler.middleware');

describe('User Controller Tests', () => {
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
            ADMIN_MODEL.deleteMany()
        ]);
    });

    describe('NEW_USER_ACCOUNT Integration Tests', () => {
        test('Should successfully create a client account', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.status).toBe(200);
            expect(response.body.error).toBe(false);
            expect(response.body.token).toBeDefined();

            // Verify database entries
            const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
            expect(user).toBeDefined();
            expect(user?.first_name).toBe(mockClientData?.first_name);

            const clientAccount = await CLIENT_MODEL.findOne({ user_model_ref: user?._id });
            expect(clientAccount).toBeDefined();

            const accountStatus = await ACCOUNT_STATUS_MODEL.findOne({ user_model_ref: user?._id });
            expect(accountStatus).toBeDefined();
            expect(accountStatus?.approved).toBe(true);
        });

        test('Should successfully create a supplier account', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockSupplierData);

            expect(response.status).toBe(200);
            expect(response.body.error).toBe(false);

            const user = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email });
            const supplierAccount = await SUPPLIER_MODEL.findOne({ user_model_ref: user?._id });
            expect(supplierAccount?.company?.name).toBe(mockSupplierData.supplier?.supplier_company_name);
        });

        test('Should successfully create an admin account', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockAdminData);

            expect(response.status).toBe(200);
            const user = await USER_BASE_MODEL.findOne({ email: mockAdminData?.email });
            const adminAccount = await ADMIN_MODEL.findOne({ user_model_ref: user?._id });
            expect(adminAccount?.role).toBe(mockAdminData?.role);
        });

		test('Should reject duplicate email registration', async () => {
            // First registration
            await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            // Attempt duplicate registration
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain('An account with this email already exists');
        });

        test('Should reject invalid account type', async () => {
            const invalidData = {
                ...mockClientData,
                account_type: 'invalid_type'
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(true);
        });

        test('Should require essential fields', async () => {
            const incompleteData = {
                first_name: 'Test',
                email: 'test@example.com'
                // Missing other required fields
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(incompleteData);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(true);
        });

		test('Should properly hash password', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            const user = await USER_BASE_MODEL.findOne({ email: mockClientData?.email });
            expect(user?.password).not.toBe(mockClientData?.password);
            // Verify that the password is hashed
            expect(user?.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
        });

        test('Should generate valid JWT token', async () => {
            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.body.token).toBeDefined();
            // Add JWT verification logic here
        });

		test('Should handle database connection errors gracefully', async () => {
            // Temporarily break database connection
            await mongoose.disconnect();

            const response = await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe(true);

            // Reconnect for other tests
            await mongoose.connect('mongodb://localhost:27017/test');
        });

        test('Should handle validation errors properly', async () => {
            const invalidData = {
                ...mockClientData,
                email: 'invalid-email' // Invalid email format
            };

            const response = await request(app)
                .post('/api/auth/signup')
                .send(invalidData);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(true);
        });
		
    });

	describe('USER SIGNIN Integration Tests', () => {
		test('Should successfully signin user', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            const response = await request(app)
                .post('/api/auth/signin')
                .send(mockClientData);

            expect(response.status).toBe(200);
			expect(response.body.error).toBe(false);
			expect(response.body.token).toBeDefined();
        });

		test('Should reject non existent user', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

			const mockNonExistClientData = {
				email:		'nonexistuser@example.com',
				password:	'21398742792',
			}

            const response = await request(app)
                .post('/api/auth/signin')
                .send(mockNonExistClientData);

            expect(response.status).toBe(200);
			expect(response.body.error).toBe(true);
        });

		test('Should reject invalid email', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

			const invalidData = {
				email:		'Invalid Email',
				password:	'2139874279243492479',
			}
            const response = await request(app)
                .post('/api/auth/signin')
                .send(invalidData);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(true);
        });

        test('Should require essential fields', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);
            
			const invalidData = {
                account_type: 'invalid_type'
            };

            const response = await request(app)
                .post('/api/auth/signin')
                .send(invalidData);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(true);
        });

		test('Should generate valid JWT token', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);
            
			const response = await request(app)
                .post('/api/auth/signin')
                .send(mockClientData);

            expect(response.body.token).toBeDefined();
            // Add JWT verification logic here
        });

		test('Should handle database connection errors gracefully', async () => {
            // Temporarily break database connection
            await mongoose.disconnect();

            const response = await request(app)
                .post('/api/auth/signin')
                .send(mockClientData);

            expect(response.status).toBe(500);
            expect(response.body.error).toBe(true);

            // Reconnect for other tests
            await mongoose.connect('mongodb://localhost:27017/test');
        });

    });

	describe('USER PASSWORD RESET Integration Tests', () => {
		test('Should successfully send code to user', async () => {
			await request(app)
                .post('/api/auth/signup')
                .send(mockClientData);

            const response = await request(app)
                .get(`/api/auth/password/code?email=${mockClientData?.email}`)

            expect(response.status).toBe(200);
			expect(response.body.error).toBe(false);
			expect(response.body.token).toBeDefined();
        });

		test('Should reject invalid email', async () => {
			const invalidData = {
				email:		'Invalid Email',
				password:	'2139874279243492479',
			}
            const response = await request(app)
                .get(`/api/auth/password/code?email=${invalidData?.email}`)

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(true);
        });

		test('Should handle database connection errors gracefully', async () => {
            // Temporarily break database connection
            await mongoose.disconnect();

            const response = await request(app)
                .get(`/api/auth/password/code?email=${mockClientData?.email}`)

            expect(response.status).toBe(500);
            expect(response.body.error).toBe(true);

            // Reconnect for other tests
            await mongoose.connect('mongodb://localhost:27017/test');
        });

    });
	describe('HELPER FUNCTIONS', () => {
		describe('HASH STRING FUNCTION', ()=>{
			const testString = 'mySecretPassword';

			test('Should return a hashed value', ()=>{
				const hashedString = HASH_STRING(testString);
				expect(hashedString).toBeDefined();
				expect(typeof hashedString).toBe('string');
			});
			
			test('should return a value different from the original string', () => {
				const hashedString = HASH_STRING(testString);
				expect(hashedString).not.toBe(testString);
			});

			test('should produce different hashes for the same input due to salt', () => {
				const hash1 = HASH_STRING(testString);
				const hash2 = HASH_STRING(testString);
				expect(hash1).not.toBe(hash2);
			});

			test('should match the hashed value when compared using bcrypt.compareSync', () => {
				const hashedString = HASH_STRING(testString);
				const isMatch = bcrypt.compareSync(testString, hashedString);
				expect(isMatch).toBe(true);
			});

		});

		describe('AUTH_TOKEN_GENERATOR', ()=>{
			const mockUser = {
				_id: { toHexString: () => '60d21b2f9eb8f7b1f1a2e30e' },
				account_type: 'admin',
				name: 'John Doe'
			};
			test('Should return a valid token',()=>{
				const token = AUTH_TOKEN_GENERATOR(mockUser);
				expect(token).toBeDefined();
				expect(typeof token).toBe('string');
			});

			test('should call jwt.sign with the correct payload and options', () => {
				const jwtSignSpy = jest.spyOn(jwt, 'sign').mockReturnValue('fake_token');

				const token = AUTH_TOKEN_GENERATOR(mockUser);

				const expectedPayload = {
					sub: '60d21b2f9eb8f7b1f1a2e30e',
					name: 'John Doe',
					account_type: 'admin'
				};

				const expectedOptions = {
					expiresIn: 100000,
					header: {
						alg: 'HS256',
						typ: 'JWT'
					}
				};

				expect(jwtSignSpy).toHaveBeenCalledWith(expectedPayload, process.env.ACCESS_TOKEN_KEY, expectedOptions);
				expect(token).toBe('fake_token');
			})
		});

		describe('CODE_TOKEN_GENERATOR', ()=>{
			const testCode = '123456';

			test('Should return a valid token',()=>{
				const token = CODE_TOKEN_GENERATOR(testCode);
				expect(token).toBeDefined();
				expect(typeof token).toBe('string');
			});
		});

	})
});
