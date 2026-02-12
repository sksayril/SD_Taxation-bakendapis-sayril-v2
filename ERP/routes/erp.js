const express = require('express');
const router = express.Router();
const auth = require('../../Admin/middleware/auth');
const { checkModulePermission } = require('../../Admin/middleware/permissions');
const {
  getAllERP,
  getERPById,
  createERP,
  updateERP,
  deleteERP
} = require('../controllers/erpController');

// All routes require authentication and ERP module access
router.get('/', auth, checkModulePermission('erp', 'read'), getAllERP);
router.get('/:id', auth, checkModulePermission('erp', 'read'), getERPById);
router.post('/', auth, checkModulePermission('erp', 'create'), createERP);
router.post('/update/:id', auth, checkModulePermission('erp', 'update'), updateERP);
router.post('/delete/:id', auth, checkModulePermission('erp', 'delete'), deleteERP);

module.exports = router;
