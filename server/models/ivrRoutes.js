const express = require('express');
const router = express.Router();
const ivrController = require('../controllers/ivrController');

router.post('/ivr-incoming', ivrController.handleIncomingCall);
router.post('/ivr-menu', ivrController.handleMenu);
router.post('/ivr-category', ivrController.handleCategory);
router.post('/ivr-location', ivrController.handleLocation);
router.post('/ivr-save-complaint', ivrController.saveComplaint);
router.post('/ivr-status-option', ivrController.handleStatusOption);
router.post('/ivr-status-by-id', ivrController.checkStatusById);
router.post('/ivr-status-by-phone', ivrController.checkStatusByPhone);

module.exports = router;
