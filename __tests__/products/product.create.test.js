const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app'); // Your Express app
const { 
    DOCUMENT_MODEL, 
    PRODUCT_MODEL, 
    REQUEST_MODEL, 
    MARKET_MODEL 
} = require("../../models/PRODUCT.model.js");
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL } = require("../../models/ACCOUNT.model.js");

describe('PRODUCT CREATION CONTROLLER', () => {
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
	const mockMarketData = {
		title: "Renewable Energy",
		description: "A sector focusing on clean, renewable energy sources like solar, wind, and hydro.",
		image_url: "https://example.com/images/renewable_energy.jpg",
		type: "industry", // can also be "technology"
		status: {
			status: true,
			stage: "approved", // options: pending, approved, suspension
			comment: "Approved for public listing",
			date: new Date("2023-10-10"),
			approver: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef470") // reference to an approver
		}
	}
	const mockProductData = {
		name: "Polyethylene Glycol",
		image_url: "https://example.com/images/polyethylene_glycol.png",
		expiry: {
			status: false,
			date: new Date("2025-12-31")
		},
		//lister: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef456"),
		//supplier: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef457"),
		//seller: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef458"),
		consultants: [
			new mongoose.Types.ObjectId("653fd7612f8a3b001cdef459"),
			new mongoose.Types.ObjectId("653fd7612f8a3b001cdef460")
		],
		description: "A versatile chemical used in various pharmaceutical formulations.",
		chemical_name: "Polyethylene Glycol",
		function: "Emulsifying agent",
		brand: "ChemBrand X",
		features: "High solubility, non-toxic, biocompatible",
		application: "Used in pharmaceutical formulations and cosmetics",
		packaging: "Available in 50kg drums",
		storage: "Store in a cool, dry place away from direct sunlight.",
		documents: [
			{
				title:				"Safety Data Sheet",
				url:				"https://example.com/docs/sds_polyethylene_glycol.pdf",
				type:				"pdf",
			},
		],
		industry: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef463"),
		technology: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef464"),
		status: {
			status: true,
			stage: "pending",
			comment: "Approved for sale",
			date: new Date("2023-10-10"),
			approver: new mongoose.Types.ObjectId("653fd7612f8a3b001cdef465")
		},
		sponsored: {
			status: true
		},
		statistics: {
			views:	0,
			search: 0
		},
		requests: [
			new mongoose.Types.ObjectId("653fd7612f8a3b001cdef466"),
			new mongoose.Types.ObjectId("653fd7612f8a3b001cdef467")
		]
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
            SUPPLIER_MODEL.deleteMany(),
//            ADMIN_MODEL.deleteMany(),
			PRODUCT_MODEL.deleteMany(),
			REQUEST_MODEL.deleteMany(),
			DOCUMENT_MODEL.deleteMany(),
			MARKET_MODEL.deleteMany()
        ]);
    });
	test('should successfully create a new product', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send(mockSupplierData);

        expect(response.status).toBe(200);
        // Verify database entries
        const user = await USER_BASE_MODEL.findOne({ email: mockSupplierData?.email })
			.populate('supplier_account_model_ref')
			.exec();

        expect(user).toBeDefined();
	
		// Create a market to attach a market reference for the product
		mockProductData.seller = user?.supplier_account_model_ref?._id
		mockProductData.lister = user?.supplier_account_model_ref?._id
		mockProductData.supplier = user?.supplier_account_model_ref?._id

		const new_product_response = await request(app)
            .post(`/api/product/create?account_id=${user?._id}&account_type=${user?.account_type}`)
			.set('Authorization', `Bearer ${response?.body?.token}`)
			.send(mockProductData)
 
		expect(new_product_response.status).toBe(200);
        expect(new_product_response.body.error).toBe(false);

		const existing_product = await PRODUCT_MODEL.findOne({ name: mockProductData?.name })
			.populate('documents')
			.populate('supplier')
			.populate('lister')
			.populate('seller')
			.exec();

        expect(existing_product).toBeDefined();
		expect(existing_product?.name).toBe(mockProductData?.name);
		expect(existing_product?.description).toBe(mockProductData?.description);
		expect(existing_product?.expiry?.status).toBe(mockProductData?.expiry?.status);
		expect(existing_product?.supplier?.company?.name).toBe(user?.supplier_account_model_ref?.company?.name);
		expect(existing_product?.lister?.company?.name).toBe(user?.supplier_account_model_ref?.company?.name);
		expect(existing_product?.seller?.company?.name).toBe(user?.supplier_account_model_ref?.company?.name);
		expect(existing_product?.industry).toBeDefined();
		expect(existing_product?.technology).toBeDefined();
		expect(existing_product?.chemical_name).toBe(mockProductData?.chemical_name);
		expect(existing_product?.function).toBe(mockProductData?.function);
		expect(existing_product?.brand).toBe(mockProductData?.brand);
		expect(existing_product?.features).toBe(mockProductData?.features);
		expect(existing_product?.application).toBe(mockProductData?.application);
		expect(existing_product?.packaging).toBe(mockProductData?.packaging);
		expect(existing_product?.storage).toBe(mockProductData?.storage);
		expect(existing_product?.status?.status).toBe(mockProductData?.status?.status);
		expect(existing_product?.status?.stage).toBe(mockProductData?.status?.stage);
		expect(existing_product?.sponsored?.status).toBe(mockProductData?.sponsored?.status);
		expect(existing_product?.statistics?.views).toBe(mockProductData?.statistics?.views);
		expect(existing_product?.documents[0]?.title).toBe(mockProductData?.documents[0]?.title);
		expect(existing_product?.documents[0]?.url).toBe(mockProductData?.documents[0]?.url);
		expect(existing_product?.documents[0]?.type).toBe(mockProductData?.documents[0]?.type);

		// check documents have been created
		const existing_documents = await DOCUMENT_MODEL.find({ product_model_ref : existing_product?._id });
		expect(existing_documents).toBeDefined();
		expect(Array.isArray(existing_documents)).toBe(true);
    });
});
