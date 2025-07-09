const request = require('supertest');
const app = require('../app.js');

describe('USER REGISTERATION', ()=>{
	test('PAYLOAD VALIDATION (FAIL)', (done)=>{
		const MOCK_DATA = {};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(403)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: true,
					message: 'Payload Validation failed'
				})
			})
			.end(done)
	})

	test('NEW CLIENT SIGNUP (SUCCESS)',(done)=>{
		/***
		 *	Creates a new uuser with the client account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe@gmail.com',
			mobile:			'+254759233322',
			account_type:	'client',
			password:		'password'
		};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
	})

	test('NEW SUPPLIER SIGNUP (SUCCESS)',(done)=>{
		/***
		 *	Creates a new uuser with the client account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe1@gmail.com',
			mobile:			'+254759233322',
			account_type:	'supplier',
			password:		'password',
			supplier:		'distributor'
		};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
	})

	test('NEW SALESPERSON SIGNUP (SUCCESS)',(done)=>{
		/***
		 *	Creates a new uuser with the salesperson account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe2@gmail.com',
			mobile:			'+254759233322',
			account_type:	'salesperson',
			password:		'password'
		};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
	})

	test('NEW CONSULTANT SIGNUP (SUCCESS)',(done)=>{
		/***
		 *	Creates a new uuser with the consultant account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe3@gmail.com',
			mobile:			'+254759233322',
			account_type:	'consultant',
			password:		'password'
		};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
	})


	test('USER_EXISTS (SUCCESS)', (done)=>{
		/**
		 * Checks if User Exists: Expected to Fail
		 *
		 * */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe@gmail.com',
			mobile:			'+254759233322',
			account_type:	'client',
			password:		'password'
		};
		request(app)
			.post('/api/signup/v2')
			.send(MOCK_DATA)
			.expect(200)	
			.end(done)
	})


	// test('')
})

describe('USER SIGNIN', ()=>{
	test('PAYLOAD VALIDATION (FAIL)', (done)=>{
		const MOCK_DATA = {};
		request(app)
			.post('/api/signin/v2')
			.send(MOCK_DATA)
			.expect(403)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: true,
					message: 'Payload Validation failed'
				})
			})
			.end(done)
	})
	test('SIGNED IN REGISTERED USER',(done)=>{
		/***
		 *	Creates a new uuser with the client account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'johndoe@gmail.com',
			mobile:			'+254759233322',
			account_type:	'client',
			password:		'password'
		};
		request(app)
			.post('/api/signin/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
	})
	test('UNAUTHORIZE SIGNIN UNREGISTED USER',(done)=>{
		/***
		 *	Creates a new uuser with the client account_type
		 */
		const MOCK_DATA = {
			first_name:		'John',
			last_name:		'Doe',
			email:			'nonexistantuser@gmail.com',
			mobile:			'+254759233322',
			account_type:	'client',
			password:		'password'
		};
		request(app)
			.post('/api/signin/v2')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
		})
})


describe('ACCOUNT_DELETION', ()=>{
	test('PAYLOAD VALIDATION (FAIL)', (done)=>{
		const MOCK_DATA = {};
		request(app)
			.delete('/api/delete/flag')
			.send(MOCK_DATA)
			.expect(403)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: true,
					message: 'Payload Validation failed'
				})
			})
			.end(done)
	})
	test('UNAUTHORIZE UNREGISTERED USER',(done)=>{
		/***
		 *	Does not authorize existing user
		 */
		const MOCK_DATA = {
			reason:	'cause I want to'
		};
		request(app)
			.delete('/api/delete/flag?user_id=6674512cffda1d676ceee6d7')
			.send(MOCK_DATA)
			.expect(200)
			.expect(function(res){
				res.body.hasOwnProperty({
					error: null,
					message: ''
				})
			})
			.end(done)
		})

})
