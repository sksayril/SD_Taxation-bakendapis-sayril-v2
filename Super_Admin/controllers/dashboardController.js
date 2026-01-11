const Company = require('../models/Company');
const CompanySubscription = require('../models/CompanySubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Ledgers = require('../models/Ledgers');
const Vouchers = require('../models/Vouchers');
const Admin = require('../../Admin/models/Admin');
const HR = require('../../HR/models/HR');
const Employee = require('../../Employees/models/Employee');

// Helper function to calculate company balance from ledgers and vouchers
const calculateCompanyBalance = async (companyId) => {
  try {
    // Get all ledgers for the company
    const ledgers = await Ledgers.find({ companyId: companyId.toString() });
    
    // Get all approved vouchers for the company
    const vouchers = await Vouchers.find({ 
      companyId: companyId.toString(),
      status: 'Approved'
    });

    // Initialize balance map
    const ledgerBalances = {};
    
    // Start with opening balances
    ledgers.forEach(ledger => {
      ledgerBalances[ledger.ledgerName] = ledger.openingBalance || 0;
    });

    // Process vouchers to calculate running balances
    vouchers.forEach(voucher => {
      // Process debit entries (increase asset/expense, decrease liability/income)
      voucher.debitEntries.forEach(entry => {
        if (!ledgerBalances[entry.ledgerName]) {
          ledgerBalances[entry.ledgerName] = 0;
        }
        // For assets and expenses, debit increases balance
        // For liabilities and income, debit decreases balance
        const ledger = ledgers.find(l => l.ledgerName === entry.ledgerName);
        if (ledger) {
          if (['Asset', 'Expense', 'Cash', 'Bank'].includes(ledger.ledgerType)) {
            ledgerBalances[entry.ledgerName] += entry.amount;
          } else {
            ledgerBalances[entry.ledgerName] -= entry.amount;
          }
        }
      });

      // Process credit entries (decrease asset/expense, increase liability/income)
      voucher.creditEntries.forEach(entry => {
        if (!ledgerBalances[entry.ledgerName]) {
          ledgerBalances[entry.ledgerName] = 0;
        }
        const ledger = ledgers.find(l => l.ledgerName === entry.ledgerName);
        if (ledger) {
          if (['Asset', 'Expense', 'Cash', 'Bank'].includes(ledger.ledgerType)) {
            ledgerBalances[entry.ledgerName] -= entry.amount;
          } else {
            ledgerBalances[entry.ledgerName] += entry.amount;
          }
        }
      });
    });

    // Calculate total balance (sum of all asset and cash/bank balances)
    let totalBalance = 0;
    ledgers.forEach(ledger => {
      const balance = ledgerBalances[ledger.ledgerName] || 0;
      if (['Asset', 'Cash', 'Bank'].includes(ledger.ledgerType)) {
        totalBalance += balance;
      }
    });

    return {
      totalBalance: totalBalance,
      ledgerBalances: ledgerBalances,
      ledgerCount: ledgers.length,
      voucherCount: vouchers.length
    };
  } catch (error) {
    console.error('Error calculating company balance:', error);
    return {
      totalBalance: 0,
      ledgerBalances: {},
      ledgerCount: 0,
      voucherCount: 0
    };
  }
};

// ✅ Get SuperAdmin Dashboard
exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentYear = new Date(now.getFullYear(), 0, 1);

    // Get all companies
    const companies = await Company.find().select('_id company_name company_email status createdAt');
    
    // Get all subscriptions
    const subscriptions = await CompanySubscription.find()
      .populate('plan', 'planName price')
      .populate('company', 'company_name');

    // Get subscription plans
    const plans = await SubscriptionPlan.find({ isActive: true });

    // Calculate subscription statistics
    const activeSubscriptions = subscriptions.filter(sub => {
      return sub.status === 'active' && 
             sub.startDate <= now && 
             sub.endDate >= now;
    });

    const expiredSubscriptions = subscriptions.filter(sub => sub.status === 'expired' || sub.endDate < now);
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
    const suspendedSubscriptions = subscriptions.filter(sub => sub.status === 'suspended');

    // Calculate subscription revenue
    const totalSubscriptionRevenue = subscriptions.reduce((sum, sub) => {
      return sum + (sub.plan?.price || 0);
    }, 0);

    const activeSubscriptionRevenue = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.plan?.price || 0);
    }, 0);

    // Get user counts
    const totalAdmins = await Admin.countDocuments();
    const totalHR = await HR.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    const activeAdmins = await Admin.countDocuments({ status: 'active' });
    const activeHR = await HR.countDocuments();
    const activeEmployees = await Employee.countDocuments();

    // Get company statistics
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter(c => c.status === 'active').length;
    const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;
    const suspendedCompanies = companies.filter(c => c.status === 'suspended').length;

    // Calculate company balances
    const companyBalances = [];
    let totalSystemBalance = 0;

    for (const company of companies) {
      const balanceData = await calculateCompanyBalance(company._id);
      totalSystemBalance += balanceData.totalBalance;

      // Get company subscription
      const companySub = subscriptions.find(sub => 
        sub.company?._id?.toString() === company._id.toString()
      );

      companyBalances.push({
        companyId: company._id,
        companyName: company.company_name,
        companyEmail: company.company_email,
        status: company.status,
        balance: balanceData.totalBalance,
        ledgerCount: balanceData.ledgerCount,
        voucherCount: balanceData.voucherCount,
        subscription: companySub ? {
          planName: companySub.plan?.planName || 'No Plan',
          status: companySub.status,
          isActive: companySub.isValid(),
          endDate: companySub.endDate
        } : {
          planName: 'No Subscription',
          status: 'none',
          isActive: false
        }
      });
    }

    // Sort companies by balance (highest first)
    companyBalances.sort((a, b) => b.balance - a.balance);

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentVouchers = await Vouchers.find({
      date: { $gte: thirtyDaysAgo },
      status: 'Approved'
    })
      .sort({ date: -1 })
      .limit(10)
      .select('voucherNumber voucherType date totalAmount companyId');
    
    // Map company names to vouchers
    const recentVouchersWithCompany = recentVouchers.map(voucher => {
      const company = companies.find(c => c._id.toString() === voucher.companyId);
      return {
        ...voucher.toObject(),
        companyName: company?.company_name || 'Unknown'
      };
    });

    // Calculate monthly revenue trend (last 6 months)
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthSubscriptions = subscriptions.filter(sub => {
        const subDate = sub.startDate;
        return subDate >= monthStart && subDate <= monthEnd;
      });

      const monthRevenue = monthSubscriptions.reduce((sum, sub) => {
        return sum + (sub.plan?.price || 0);
      }, 0);

      revenueTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        subscriptions: monthSubscriptions.length
      });
    }

    // Service distribution (based on subscription plans)
    const serviceDistribution = {};
    subscriptions.forEach(sub => {
      const planName = sub.plan?.planName || 'Unknown';
      serviceDistribution[planName] = (serviceDistribution[planName] || 0) + 1;
    });

    // Prepare dashboard response
    const dashboard = {
      summary: {
        totalRevenue: totalSubscriptionRevenue,
        activeRevenue: activeSubscriptionRevenue,
        totalBalance: totalSystemBalance,
        activeClients: activeSubscriptions.length,
        totalCompanies: totalCompanies,
        returnsFiled: recentVouchers.length, // Using vouchers as proxy for returns
        taxSaved: 0 // Placeholder - can be calculated from deductions
      },
      kpis: [
        {
          title: 'Total Revenue',
          value: `₹${totalSubscriptionRevenue.toLocaleString('en-IN')}`,
          change: revenueTrend.length > 1 
            ? ((revenueTrend[revenueTrend.length - 1].revenue - revenueTrend[revenueTrend.length - 2].revenue) / 
               (revenueTrend[revenueTrend.length - 2].revenue || 1) * 100).toFixed(1)
            : '0',
          trend: revenueTrend.length > 1 && revenueTrend[revenueTrend.length - 1].revenue > revenueTrend[revenueTrend.length - 2].revenue ? 'up' : 'down',
          icon: 'revenue'
        },
        {
          title: 'Active Clients',
          value: activeSubscriptions.length.toString(),
          change: activeSubscriptions.length > 0 
            ? ((activeSubscriptions.length / totalCompanies) * 100).toFixed(1)
            : '0',
          trend: 'up',
          icon: 'clients'
        },
        {
          title: 'Total Companies',
          value: totalCompanies.toString(),
          change: totalCompanies > 0 ? '100' : '0',
          trend: 'up',
          icon: 'companies'
        },
        {
          title: 'System Balance',
          value: `₹${totalSystemBalance.toLocaleString('en-IN')}`,
          change: '0',
          trend: 'neutral',
          icon: 'balance'
        }
      ],
      subscriptions: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        expired: expiredSubscriptions.length,
        cancelled: cancelledSubscriptions.length,
        suspended: suspendedSubscriptions.length,
        revenue: {
          total: totalSubscriptionRevenue,
          active: activeSubscriptionRevenue,
          expired: expiredSubscriptions.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0)
        }
      },
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        inactive: inactiveCompanies,
        suspended: suspendedCompanies,
        withSubscription: subscriptions.length,
        withoutSubscription: totalCompanies - subscriptions.length
      },
      users: {
        admins: {
          total: totalAdmins,
          active: activeAdmins
        },
        hr: {
          total: totalHR,
          active: activeHR
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees
        },
        total: totalAdmins + totalHR + totalEmployees
      },
      companyBalances: companyBalances,
      revenueTrend: revenueTrend,
      serviceDistribution: Object.entries(serviceDistribution).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / subscriptions.length) * 100).toFixed(1)
      })),
      recentTransactions: recentVouchersWithCompany.map(v => ({
        voucherNumber: v.voucherNumber,
        type: v.voucherType,
        date: v.date,
        amount: v.totalAmount,
        company: v.companyName
      })),
      plans: {
        total: plans.length,
        active: plans.filter(p => p.isActive).length,
        list: plans.map(p => ({
          id: p._id,
          name: p.planName,
          price: p.price,
          duration: p.duration,
          isActive: p.isActive
        }))
      }
    };

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboard
    });
  } catch (err) {
    console.error('Get dashboard error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

