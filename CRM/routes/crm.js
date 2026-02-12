const express = require('express');
const router = express.Router();
const auth = require('../../Admin/middleware/auth');
const { checkModulePermission } = require('../../Admin/middleware/permissions');
const {
  getAllCRM,
  getCRMById,
  createCRM,
  updateCRM,
  deleteCRM
} = require('../controllers/crmController');

// All routes require authentication and CRM module access
router.get('/', auth, checkModulePermission('crm', 'read'), getAllCRM);
router.get('/:id', auth, checkModulePermission('crm', 'read'), getCRMById);
router.post('/', auth, checkModulePermission('crm', 'create'), createCRM);
router.post('/update/:id', auth, checkModulePermission('crm', 'update'), updateCRM);
router.post('/delete/:id', auth, checkModulePermission('crm', 'delete'), deleteCRM);

module.exports = router;
