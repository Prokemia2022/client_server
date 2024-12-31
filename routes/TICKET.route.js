const express = require('express');
const { CREATE_TICKET, DELETE_TICKET, UPDATE_TICKET, FETCH_TICKET_DATA, FETCH_TICKETS } = require('../controllers/tickets/ticket.controller.js');

const router = express.Router();

router.post('/create',CREATE_TICKET);
router.get('/all',FETCH_TICKETS);
router.get('/data',FETCH_TICKET_DATA);
router.put('/update',UPDATE_TICKET);
router.get('/delete',DELETE_TICKET);

module.exports = router
