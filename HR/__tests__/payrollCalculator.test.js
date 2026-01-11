const { calculatePayslip } = require('../lib/payrollCalculator');

describe('payrollCalculator', () => {
  // Test case 1: No absent, basic percent present, PF policy
  test('should calculate payslip correctly with no absent days', () => {
    const employee = {
      _id: '507f1f77bcf86cd799439011',
      fullname: 'John Doe',
      salary: 50000, // Monthly salary in rupees
      ctcAnnual: null
    };

    const salaryStructure = {
      _id: '507f1f77bcf86cd799439012',
      baseForPercent: 'CTC',
      components: [
        { name: 'Basic', type: 'earning', kind: 'percent', value: 50 },
        { name: 'HRA', type: 'earning', kind: 'percent', value: 20 },
        { name: 'Transport Allowance', type: 'earning', kind: 'fixed', value: 2000 },
        { name: 'Medical Allowance', type: 'earning', kind: 'fixed', value: 1500 }
      ]
    };

    const workingDays = 26;
    const absentDays = 0;
    const statutoryRates = {
      pfPercent: 12,
      professionalTax: 200
    };

    const result = calculatePayslip({
      employee,
      salaryStructure,
      workingDays,
      absentDays,
      statutoryRates
    });

    // Verify structure
    expect(result).toHaveProperty('earnings');
    expect(result).toHaveProperty('deductions');
    expect(result).toHaveProperty('gross');
    expect(result).toHaveProperty('totalDeductions');
    expect(result).toHaveProperty('netPay');
    expect(result).toHaveProperty('_internal');

    // Verify earnings
    expect(Array.isArray(result.earnings)).toBe(true);
    expect(result.earnings.length).toBeGreaterThan(0);

    // Calculate expected values in paise
    const monthlyBasePaise = 50000 * 100; // 5000000 paise
    const basicPaise = Math.round(monthlyBasePaise * 50 / 100); // 2500000 paise
    const hraPaise = Math.round(monthlyBasePaise * 20 / 100); // 1000000 paise
    const transportPaise = 2000 * 100; // 200000 paise
    const medicalPaise = 1500 * 100; // 150000 paise
    const expectedGrossPaise = basicPaise + hraPaise + transportPaise + medicalPaise; // 3850000 paise

    // Verify gross (with tolerance for rounding)
    expect(result._internal.grossPaise).toBe(expectedGrossPaise);
    expect(result.gross).toBeCloseTo(expectedGrossPaise / 100, 2);

    // Verify deductions
    expect(Array.isArray(result.deductions)).toBe(true);
    
    // PF should be calculated on Basic (50% of gross fallback if Basic not found, but we have Basic)
    const pfBasePaise = basicPaise; // PF on Basic
    const expectedPfPaise = Math.round(pfBasePaise * 12 / 100); // 300000 paise
    const pfDeduction = result.deductions.find(d => d.name.includes('PF'));
    expect(pfDeduction).toBeDefined();
    expect(pfDeduction.amount).toBeCloseTo(expectedPfPaise / 100, 2);

    // Professional Tax
    const ptDeduction = result.deductions.find(d => d.name.includes('Professional Tax'));
    expect(ptDeduction).toBeDefined();
    expect(ptDeduction.amount).toBe(200);

    // No absent adjustment
    const absentDeduction = result.deductions.find(d => d.name.includes('Absent'));
    expect(absentDeduction).toBeUndefined();

    // Verify net pay
    const expectedTotalDeductionsPaise = expectedPfPaise + (200 * 100); // PF + PT
    const expectedNetPaise = expectedGrossPaise - expectedTotalDeductionsPaise;
    expect(result._internal.netPaise).toBe(expectedNetPaise);
    expect(result.netPay).toBeCloseTo(expectedNetPaise / 100, 2);

    // Verify net pay is positive
    expect(result.netPay).toBeGreaterThan(0);
  });

  // Test case 2: Absent days > 0 - assert "Absent Adjustment" deduction present and net decreased
  test('should calculate payslip correctly with absent days', () => {
    const employee = {
      _id: '507f1f77bcf86cd799439013',
      fullname: 'Jane Smith',
      salary: 40000, // Monthly salary in rupees
      ctcAnnual: null
    };

    const salaryStructure = {
      _id: '507f1f77bcf86cd799439014',
      baseForPercent: 'CTC',
      components: [
        { name: 'Basic', type: 'earning', kind: 'percent', value: 60 },
        { name: 'HRA', type: 'earning', kind: 'percent', value: 30 },
        { name: 'Transport Allowance', type: 'earning', kind: 'fixed', value: 1500 }
      ]
    };

    const workingDays = 26;
    const absentDays = 2;
    const statutoryRates = {
      pfPercent: 12,
      professionalTax: 150
    };

    const result = calculatePayslip({
      employee,
      salaryStructure,
      workingDays,
      absentDays,
      statutoryRates
    });

    // Verify absent adjustment deduction is present
    const absentDeduction = result.deductions.find(d => d.name === 'Absent Adjustment');
    expect(absentDeduction).toBeDefined();
    expect(absentDeduction.amount).toBeGreaterThan(0);

    // Calculate expected absent deduction
    const monthlyBasePaise = 40000 * 100; // 4000000 paise
    const basicPaise = Math.round(monthlyBasePaise * 60 / 100); // 2400000 paise
    const hraPaise = Math.round(monthlyBasePaise * 30 / 100); // 1200000 paise
    const transportPaise = 1500 * 100; // 150000 paise
    const grossBeforeAbsentPaise = basicPaise + hraPaise + transportPaise; // 3750000 paise
    const perDayPaise = Math.round(grossBeforeAbsentPaise / workingDays); // ~144230 paise
    const expectedAbsentDeductPaise = Math.round(perDayPaise * absentDays); // ~288460 paise
    const grossAfterAbsentPaise = grossBeforeAbsentPaise - expectedAbsentDeductPaise; // ~3461540 paise

    // Verify absent deduction amount (with tolerance for rounding)
    expect(absentDeduction.amount).toBeCloseTo(expectedAbsentDeductPaise / 100, 0);

    // Verify gross is reduced after absent deduction
    expect(result._internal.grossPaise).toBe(grossAfterAbsentPaise);
    expect(result.gross).toBeCloseTo(grossAfterAbsentPaise / 100, 2);

    // Verify net pay is less than it would be without absent days
    const pfBasePaise = basicPaise; // PF on Basic
    const pfPaise = Math.round(pfBasePaise * 12 / 100);
    const totalDeductionsPaise = pfPaise + (150 * 100) + expectedAbsentDeductPaise;
    const expectedNetPaise = grossAfterAbsentPaise - totalDeductionsPaise;

    expect(result._internal.netPaise).toBe(expectedNetPaise);
    expect(result.netPay).toBeCloseTo(expectedNetPaise / 100, 2);

    // Verify net pay is positive
    expect(result.netPay).toBeGreaterThan(0);
  });

  // Test case 3: Employee with ctcAnnual instead of salary
  test('should use ctcAnnual when available', () => {
    const employee = {
      _id: '507f1f77bcf86cd799439015',
      fullname: 'Bob Johnson',
      salary: null,
      ctcAnnual: 600000 // Annual CTC in rupees
    };

    const salaryStructure = {
      _id: '507f1f77bcf86cd799439016',
      baseForPercent: 'CTC',
      components: [
        { name: 'Basic', type: 'earning', kind: 'percent', value: 50 }
      ]
    };

    const result = calculatePayslip({
      employee,
      salaryStructure,
      workingDays: 26,
      absentDays: 0,
      statutoryRates: { pfPercent: 12, professionalTax: 0 }
    });

    // Monthly base should be ctcAnnual / 12
    const expectedMonthlyBasePaise = Math.round((600000 * 100) / 12); // 5000000 paise
    expect(result._internal.monthlyBasePaise).toBe(expectedMonthlyBasePaise);

    // Basic should be 50% of monthly base
    const expectedBasicPaise = Math.round(expectedMonthlyBasePaise * 50 / 100); // 2500000 paise
    const basicEarning = result.earnings.find(e => e.name === 'Basic');
    expect(basicEarning).toBeDefined();
    expect(basicEarning.amount).toBeCloseTo(expectedBasicPaise / 100, 2);
  });

  // Test case 4: PF fallback to 50% of gross when Basic not found
  test('should use 50% of gross for PF when Basic component not found', () => {
    const employee = {
      _id: '507f1f77bcf86cd799439017',
      fullname: 'Alice Brown',
      salary: 30000,
      ctcAnnual: null
    };

    const salaryStructure = {
      _id: '507f1f77bcf86cd799439018',
      baseForPercent: 'CTC',
      components: [
        { name: 'Salary', type: 'earning', kind: 'fixed', value: 30000 }
      ]
    };

    const result = calculatePayslip({
      employee,
      salaryStructure,
      workingDays: 26,
      absentDays: 0,
      statutoryRates: { pfPercent: 12, professionalTax: 0 }
    });

    // PF should be calculated on 50% of gross (since no Basic)
    const grossPaise = 30000 * 100; // 3000000 paise
    const pfBasePaise = Math.round(grossPaise / 2); // 1500000 paise
    const expectedPfPaise = Math.round(pfBasePaise * 12 / 100); // 180000 paise

    const pfDeduction = result.deductions.find(d => d.name.includes('PF'));
    expect(pfDeduction).toBeDefined();
    expect(pfDeduction.amount).toBeCloseTo(expectedPfPaise / 100, 2);
  });

  // Test case 5: Edge case - all absent days
  test('should handle case when absent days equal working days', () => {
    const employee = {
      _id: '507f1f77bcf86cd799439019',
      fullname: 'Charlie Wilson',
      salary: 25000,
      ctcAnnual: null
    };

    const salaryStructure = {
      _id: '507f1f77bcf86cd799439020',
      baseForPercent: 'CTC',
      components: [
        { name: 'Basic', type: 'earning', kind: 'fixed', value: 25000 }
      ]
    };

    const result = calculatePayslip({
      employee,
      salaryStructure,
      workingDays: 26,
      absentDays: 26, // All days absent
      statutoryRates: { pfPercent: 12, professionalTax: 0 }
    });

    // Gross should be zero after absent deduction
    expect(result.gross).toBe(0);
    expect(result.netPay).toBe(0);
  });
});

