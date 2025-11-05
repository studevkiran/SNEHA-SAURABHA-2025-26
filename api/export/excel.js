// API: Export all registrations to Excel
const ExcelJS = require('exceljs');
const { sql } = require('@vercel/postgres');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Require authentication
    const authResult = requireAuth(req);
    if (!authResult.authenticated) {
      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    // Get all registrations
    const result = await sql`
      SELECT 
        confirmation_id,
        registration_type,
        full_name,
        mobile,
        email,
        club_name,
        meal_preference,
        amount,
        transaction_id,
        upi_id,
        payment_status,
        attended,
        check_in_time,
        registration_date,
        manually_added
      FROM registrations
      ORDER BY registration_date DESC
    `;

    const registrations = result.rows;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = 'SNEHA-SAURABHA 2025-26';
    workbook.created = new Date();
    
    // Main registrations sheet
    const sheet = workbook.addWorksheet('Registrations', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
    });

    // Define columns
    sheet.columns = [
      { header: 'Confirmation ID', key: 'confirmationId', width: 20 },
      { header: 'Registration Type', key: 'registrationType', width: 20 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Club Name', key: 'clubName', width: 30 },
      { header: 'Meal Preference', key: 'mealPreference', width: 15 },
      { header: 'Amount (₹)', key: 'amount', width: 12 },
      { header: 'Transaction ID', key: 'transactionId', width: 25 },
      { header: 'UPI ID', key: 'upiId', width: 25 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Attended', key: 'attended', width: 12 },
      { header: 'Check-in Time', key: 'checkInTime', width: 20 },
      { header: 'Registration Date', key: 'registrationDate', width: 20 },
      { header: 'Manual Entry', key: 'manuallyAdded', width: 12 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD97706' } // Amber color
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    registrations.forEach(reg => {
      const row = sheet.addRow({
        confirmationId: reg.confirmation_id,
        registrationType: reg.registration_type,
        fullName: reg.full_name,
        mobile: reg.mobile,
        email: reg.email,
        clubName: reg.club_name || '',
        mealPreference: reg.meal_preference,
        amount: reg.amount,
        transactionId: reg.transaction_id || '',
        upiId: reg.upi_id || '',
        paymentStatus: reg.payment_status,
        attended: reg.attended ? 'Yes' : 'No',
        checkInTime: reg.check_in_time ? new Date(reg.check_in_time).toLocaleString('en-IN') : '',
        registrationDate: new Date(reg.registration_date).toLocaleString('en-IN'),
        manuallyAdded: reg.manually_added ? 'Yes' : 'No'
      });

      // Color code payment status
      const paymentCell = row.getCell('paymentStatus');
      if (reg.payment_status === 'completed') {
        paymentCell.font = { color: { argb: 'FF10B981' } }; // Green
      } else if (reg.payment_status === 'pending') {
        paymentCell.font = { color: { argb: 'FFF59E0B' } }; // Yellow
      } else {
        paymentCell.font = { color: { argb: 'FFEF4444' } }; // Red
      }

      // Color code attendance
      const attendedCell = row.getCell('attended');
      if (reg.attended) {
        attendedCell.font = { color: { argb: 'FF10B981' } }; // Green
      }
    });

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Calculate statistics
    const totalReg = registrations.length;
    const totalPaid = registrations.filter(r => r.payment_status === 'completed').length;
    const totalPending = registrations.filter(r => r.payment_status === 'pending').length;
    const totalAttended = registrations.filter(r => r.attended).length;
    const totalRevenue = registrations
      .filter(r => r.payment_status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    // Add summary data
    summarySheet.addRow(['SNEHA-SAURABHA 2025-26']);
    summarySheet.addRow(['Conference Registration Summary']);
    summarySheet.addRow([]);
    summarySheet.addRow(['Export Date:', new Date().toLocaleString('en-IN')]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Registrations:', totalReg]);
    summarySheet.addRow(['Payments Completed:', totalPaid]);
    summarySheet.addRow(['Payments Pending:', totalPending]);
    summarySheet.addRow(['Total Attended:', totalAttended]);
    summarySheet.addRow(['Total Revenue (₹):', totalRevenue.toLocaleString('en-IN')]);

    // Style summary sheet
    summarySheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFD97706' } };
    summarySheet.getCell('A2').font = { size: 14, bold: true };
    summarySheet.getColumn(1).width = 30;
    summarySheet.getColumn(2).width = 20;

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers for file download
    const filename = `SNEHA-SAURABHA-Registrations-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);

    console.log(`📊 Excel export generated: ${totalReg} registrations`);

    return res.status(200).send(buffer);

  } catch (error) {
    console.error('❌ Excel export error:', error);
    return res.status(500).json({
      success: false,
      error: 'Excel export failed'
    });
  }
};
