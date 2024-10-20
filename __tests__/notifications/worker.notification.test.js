const { NOTIFICATION_MODEL } = require('../../models/UTIL.model.js');
const cron = require('node-cron');
const { HANDLE_EMAIL_NOTIFICATIONS, QUEUE_NOTIFICATION } = require('../../controllers/notifications/index');
const { PROCEESS_NOTIFICATION_QUEUE } = require('../../controllers/notifications/worker.js');
const mongoose = require('mongoose');

describe('PROCEESS_NOTIFICATION_QUEUE', () => {
	// TEST DATA
	const mockSignUpPayload = {
        type: 'user.created',
		subject: "Welcome to Prokemia",
        name: 'John',
        email: 'dennissammy77@gmail.com',
        _id: ''
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
            NOTIFICATION_MODEL.deleteMany(),
        ]);
    });


	describe('EMAIL NOTIFICATION ', () => {
		test('Should process welcome email',async()=>{
			const emailPayload = {
				type: 'user.created',
				subject: "Welcome to Prokemia",
				name: 'John',
				email: 'dennissammy77@gmail.com',
				_id: '' 
			};

			await HANDLE_EMAIL_NOTIFICATIONS(emailPayload);
			/*
			await QUEUE_NOTIFICATION('',false,'email',emailPayload);
			// Verify database entries
            const existing_notifications = await NOTIFICATION_MODEL.find();
			expect(existing_notifications).toBeDefined();
			expect(Array.isArray(existing_notifications)).toBe(true);
			expect(existing_notifications?.length).toBe(1);
			// Process NOTIFICATION using worker
			await PROCEESS_NOTIFICATION_QUEUE();
			*/
		});
	})
});
