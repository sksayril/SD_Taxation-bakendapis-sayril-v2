const { toPaise, toRupees, roundToPaise } = require('./helpers');

/**
 * Calculate payslip for an employee
 * All calculations are done in paise to avoid floating-point errors
 * 
 * @param {Object} params
 * @param {Object} params.employee - Employee document
 * @param {Object} params.salaryStructure - SalaryStructure document
 * @param {Number} params.workingDays - Total working days in the month (default: 26)
 * @param {Number} params.absentDays - Days absent (default: 0)
 * @param {Object} params.statutoryRates - Statutory deduction rates
 * @param {Number} params.statutoryRates.pfPercent - PF percentage (default: 12)
 * @param {Number} params.statutoryRates.professionalTax - Professional tax amount (default: 0)
 * 
 * @returns {Object} Payslip calculation result
 * @returns {Array} returns.earnings - Array of {name, amount} in rupees
 * @returns {Array} returns.deductions - Array of {name, amount} in rupees
 * @returns {Number} returns.gross - Gross salary in rupees
 * @returns {Number} returns.totalDeductions - Total deductions in rupees
 * @returns {Number} returns.netPay - Net pay in rupees
 * @returns {Object} returns._internal - Internal paise values for testing
 */
const calculatePayslip = ({
  employee,
  salaryStructure,
  workingDays = 26,
  absentDays = 0,
  statutoryRates = {}
}) => {
  // Extract statutory rates with defaults
  const pfPercent = statutoryRates.pfPercent || 12;
  const professionalTax = statutoryRates.professionalTax || 0;

  // Convert all inputs to paise at start
  const professionalTaxPaise = toPaise(professionalTax);

  // Determine monthly base in paise
  let monthlyBasePaise;
  if (employee.ctcAnnual) {
    // If employee has ctcAnnual, calculate monthly base
    monthlyBasePaise = roundToPaise(toPaise(employee.ctcAnnual) / 12);
  } else if (employee.salary) {
    // Otherwise use employee.salary as monthly base
    monthlyBasePaise = toPaise(employee.salary);
  } else {
    throw new Error('Employee must have either ctcAnnual or salary');
  }

  // Calculate base for percentage calculations
  // Note: We'll calculate this after processing earnings if baseForPercent is 'Basic'
  let baseForPercentPaise = monthlyBasePaise; // Default to CTC

  // Calculate earnings in paise
  const earningsPaise = [];
  let grossPaise = 0;

  // If baseForPercent is 'Basic', we need to calculate Basic first
  if (salaryStructure.baseForPercent === 'Basic') {
    const basicComponent = salaryStructure.components.find(
      c => c.type === 'earning' && c.name.toLowerCase() === 'basic'
    );
    if (basicComponent) {
      if (basicComponent.kind === 'fixed') {
        baseForPercentPaise = toPaise(basicComponent.value);
      } else {
        // If Basic is a percentage, it's calculated on monthlyBase
        baseForPercentPaise = roundToPaise(monthlyBasePaise * basicComponent.value / 100);
      }
    }
    // If Basic not found, fallback to monthlyBase
  }

  for (const component of salaryStructure.components) {
    if (component.type === 'earning') {
      let amountPaise;
      if (component.kind === 'fixed') {
        amountPaise = toPaise(component.value);
      } else {
        // percent
        amountPaise = roundToPaise(baseForPercentPaise * component.value / 100);
      }
      earningsPaise.push({
        name: component.name,
        amountPaise: amountPaise
      });
      grossPaise += amountPaise;
    }
  }

  // Calculate deductions in paise
  const deductionsPaise = [];

  // Process deduction components from salary structure
  for (const component of salaryStructure.components) {
    if (component.type === 'deduction') {
      let amountPaise;
      if (component.kind === 'fixed') {
        amountPaise = toPaise(component.value);
      } else {
        // percent
        amountPaise = roundToPaise(baseForPercentPaise * component.value / 100);
      }
      deductionsPaise.push({
        name: component.name,
        amountPaise: amountPaise
      });
    }
  }

  // Absent adjustment
  if (absentDays > 0 && workingDays > 0) {
    const perDayPaise = roundToPaise(grossPaise / workingDays);
    const absentDeductPaise = roundToPaise(perDayPaise * absentDays);
    deductionsPaise.push({
      name: 'Absent Adjustment',
      amountPaise: absentDeductPaise
    });
    // Adjust gross after absent deduction
    grossPaise = Math.max(0, grossPaise - absentDeductPaise);
  }

  // Statutory deductions

  // PF: applied on Basic (if present) else fallback to 50% of gross
  let pfBasePaise;
  const basicEarning = earningsPaise.find(e => e.name.toLowerCase() === 'basic');
  if (basicEarning) {
    pfBasePaise = basicEarning.amountPaise;
  } else {
    // Fallback to 50% of gross
    pfBasePaise = roundToPaise(grossPaise / 2);
  }
  const pfPaise = roundToPaise(pfBasePaise * pfPercent / 100);
  if (pfPaise > 0) {
    deductionsPaise.push({
      name: 'Provident Fund (PF)',
      amountPaise: pfPaise
    });
  }

  // Professional Tax (fixed amount)
  if (professionalTaxPaise > 0) {
    deductionsPaise.push({
      name: 'Professional Tax',
      amountPaise: professionalTaxPaise
    });
  }

  // TODO: TDS calculation placeholder
  // const tdsPaise = calculateTDS(grossPaise, employee.taxCategory);
  // if (tdsPaise > 0) {
  //   deductionsPaise.push({
  //     name: 'Tax Deducted at Source (TDS)',
  //     amountPaise: tdsPaise
  //   });
  // }

  // Calculate total deductions
  const totalDeductionsPaise = deductionsPaise.reduce((sum, d) => sum + d.amountPaise, 0);

  // Calculate net pay
  const netPaise = Math.max(0, grossPaise - totalDeductionsPaise);

  // Convert back to rupees for database storage
  const earnings = earningsPaise.map(e => ({
    name: e.name,
    amount: toRupees(e.amountPaise)
  }));

  const deductions = deductionsPaise.map(d => ({
    name: d.name,
    amount: toRupees(d.amountPaise)
  }));

  return {
    earnings,
    deductions,
    gross: toRupees(grossPaise),
    totalDeductions: toRupees(totalDeductionsPaise),
    netPay: toRupees(netPaise),
    // Internal paise values for unit tests
    _internal: {
      monthlyBasePaise,
      baseForPercentPaise,
      grossPaise,
      totalDeductionsPaise,
      netPaise,
      earningsPaise,
      deductionsPaise
    }
  };
};

module.exports = {
  calculatePayslip
};

