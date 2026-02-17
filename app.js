var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');


var app = express();

app.use(cors());
// Middleware setup (order matters!)
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
var superAdminRouter = require('./Super_Admin/routes/superAdmin');
var companyRouter = require('./Super_Admin/routes/company');
var groupsRouter = require('./Super_Admin/routes/groups');
var ledgersRouter = require('./Super_Admin/routes/ledgers');
var vouchersRouter = require('./Super_Admin/routes/vouchers');
var stockGroupsRouter = require('./Super_Admin/routes/stockGroups');
var stockItemsRouter = require('./Super_Admin/routes/stockItems');
var stockVouchersRouter = require('./Super_Admin/routes/stockVouchers');
var payrollVouchersRouter = require('./Super_Admin/routes/payrollVouchers');
var subscriptionPlansRouter = require('./Super_Admin/routes/subscriptionPlans');
var companySubscriptionsRouter = require('./Super_Admin/routes/companySubscriptions');
var departmentRouter = require('./Super_Admin/routes/department');
var adminRouter = require('./Admin/routes/admin');
var employeeRouter = require('./Employees/routes/employee');
var hrRouter = require('./HR/routes/adminHr');
var payrollRouter = require('./HR/routes/payroll');
var crmRouter = require('./CRM/routes/crm');
var erpRouter = require('./ERP/routes/erp');
var unifiedRouter = require('./routes/unified');

app.use('/api/superadmin', superAdminRouter);
app.use('/api/companies', companyRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/ledgers', ledgersRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/stock-groups', stockGroupsRouter);
app.use('/api/stock-items', stockItemsRouter);
app.use('/api/stock-vouchers', stockVouchersRouter);
app.use('/api/payroll-vouchers', payrollVouchersRouter);
app.use('/api/subscription-plans', subscriptionPlansRouter);
app.use('/api/company-subscriptions', companySubscriptionsRouter);
app.use('/api/superadmin/departments', departmentRouter);
app.use('/api/superadmin', adminRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', employeeRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/admin', hrRouter);
app.use('/api/hr', hrRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/crm', crmRouter);
app.use('/api/erp', erpRouter);

// Unified routes (works for all user types)
app.use('/api', unifiedRouter);

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


