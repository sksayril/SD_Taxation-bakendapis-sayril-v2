/**
 * Seed script for Payroll module
 * 
 * This script:
 * 1. Creates a sample SalaryStructure for existing companies
 * 2. Optionally creates sample Payslip records for 2 existing employees
 * 
 * Usage: node scripts/seed_payroll.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SalaryStructure = require('../HR/models/SalaryStructure');
const Payslip = require('../HR/models/Payslip');
const Employee = require('../Employees/models/Employee');
const Company = require('../Super_Admin/models/Company');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://kabitadas67069_db_user:kabita%4022@cluster0.vongyjy.mongodb.net/sdtaxation';

async function seedPayroll() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all companies
    const companies = await Company.find();
    if (companies.length === 0) {
      console.log('⚠️  No companies found. Please create a company first.');
      process.exit(0);
    }

    console.log(`📋 Found ${companies.length} company(ies)\n`);

    // Create salary structure for each company
    for (const company of companies) {
      console.log(`🏢 Processing company: ${company.company_name} (${company._id})`);

      // Check if default salary structure already exists
      const existingStructure = await SalaryStructure.findOne({
        company: company._id,
        name: 'Default'
      });

      if (existingStructure) {
        console.log('   ⚠️  Default salary structure already exists, skipping...\n');
        continue;
      }

      // Create default salary structure
      const salaryStructure = await SalaryStructure.create({
        company: company._id,
        name: 'Default',
        baseForPercent: 'CTC',
        isDefault: true, // Mark as default structure
        components: [
          // Earnings
          { name: 'Basic', type: 'earning', kind: 'percent', value: 50 },
          { name: 'HRA', type: 'earning', kind: 'percent', value: 20 },
          { name: 'Transport Allowance', type: 'earning', kind: 'fixed', value: 2000 },
          { name: 'Medical Allowance', type: 'earning', kind: 'fixed', value: 1500 },
          { name: 'Special Allowance', type: 'earning', kind: 'percent', value: 10 },
          // Deductions (optional, can be added here)
          // { name: 'Insurance', type: 'deduction', kind: 'fixed', value: 500 }
        ]
      });

      console.log(`   ✅ Created default salary structure: ${salaryStructure._id}`);
      console.log(`      Components: ${salaryStructure.components.length} (${salaryStructure.components.filter(c => c.type === 'earning').length} earnings, ${salaryStructure.components.filter(c => c.type === 'deduction').length} deductions)\n`);

      // Get employees for this company
      const employees = await Employee.find({ company: company._id }).limit(2);
      
      if (employees.length === 0) {
        console.log('   ⚠️  No employees found for this company, skipping payslip creation\n');
        continue;
      }

      console.log(`   👥 Found ${employees.length} employee(s), creating sample payslips...`);

      // Create sample payslips for current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      const currentYear = currentDate.getFullYear();

      for (const employee of employees) {
        // Check if payslip already exists
        const existingPayslip = await Payslip.findByEmployeeAndPeriod(
          company._id,
          employee._id,
          currentMonth,
          currentYear
        );

        if (existingPayslip) {
          console.log(`      ⚠️  Payslip already exists for ${employee.fullname} (${employee.empCode}), skipping...`);
          continue;
        }

        // Create sample payslip
        // Note: In real scenario, use calculatePayslip from payrollCalculator
        // For seed, we'll create a simple draft payslip
        const samplePayslip = await Payslip.create({
          company: company._id,
          employee: employee._id,
          period: { month: currentMonth, year: currentYear },
          earnings: [
            { name: 'Basic', amount: employee.salary ? employee.salary * 0.5 : 20000 },
            { name: 'HRA', amount: employee.salary ? employee.salary * 0.2 : 8000 },
            { name: 'Transport Allowance', amount: 2000 },
            { name: 'Medical Allowance', amount: 1500 }
          ],
          deductions: [
            { name: 'Provident Fund (PF)', amount: employee.salary ? employee.salary * 0.5 * 0.12 : 1200 },
            { name: 'Professional Tax', amount: 200 }
          ],
          gross: employee.salary || 40000,
          totalDeductions: employee.salary ? employee.salary * 0.5 * 0.12 + 200 : 1400,
          netPay: employee.salary ? employee.salary - (employee.salary * 0.5 * 0.12 + 200) : 38600,
          status: 'draft'
        });

        console.log(`      ✅ Created sample payslip for ${employee.fullname} (${employee.empCode})`);
        console.log(`         Payslip ID: ${samplePayslip._id}`);
        console.log(`         Net Pay: ₹${samplePayslip.netPay.toFixed(2)}`);
        console.log(`         Status: ${samplePayslip.status}\n`);
      }
    }

    console.log('✅ Payroll seed completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test payroll run: POST /api/payroll/run');
    console.log('   2. View payslips: GET /api/payroll?companyId=<id>&month=<month>&year=<year>');
    console.log('   3. Approve payslip: POST /api/payroll/<payslipId>/approve');
    console.log('   4. Mark as paid: POST /api/payroll/<payslipId>/pay');
    console.log('   5. Export bank file: GET /api/payroll/bank-export?companyId=<id>&month=<month>&year=<year>\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seed script
console.log('🚀 Starting payroll seed script...\n');
seedPayroll();

