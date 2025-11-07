/**
 * Google Sheets Database Integration
 * Stores all registration data in Google Sheets
 */

const { google } = require('googleapis');

// Initialize Google Sheets API
let sheets = null;
let isInitialized = false;

function initGoogleSheets() {
    if (isInitialized) return sheets;
    
    try {
        // Parse credentials from environment variable
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}');
        
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        sheets = google.sheets({ version: 'v4', auth });
        isInitialized = true;
        console.log('✅ Google Sheets initialized');
        return sheets;
    } catch (error) {
        console.error('❌ Failed to initialize Google Sheets:', error);
        return null;
    }
}

/**
 * Add registration to Google Sheets
 */
async function addRegistrationToSheets(registrationData) {
    try {
        const sheetsApi = initGoogleSheets();
        if (!sheetsApi) {
            throw new Error('Google Sheets not initialized');
        }

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        if (!spreadsheetId) {
            throw new Error('GOOGLE_SHEET_ID not set in environment');
        }

        // Prepare row data
        const row = [
            registrationData.registration_id || '',
            registrationData.order_id || '',
            new Date().toISOString(), // Timestamp
            registrationData.name || '',
            registrationData.mobile || '',
            registrationData.email || '',
            registrationData.club || '',
            registrationData.club_id || '',
            registrationData.registration_type || '',
            registrationData.registration_amount || 0,
            registrationData.meal_preference || '',
            registrationData.payment_status || 'pending',
            registrationData.payment_method || '',
            registrationData.transaction_id || '',
            registrationData.upi_id || '',
            registrationData.registration_status || 'pending',
            registrationData.verified ? 'Yes' : 'No',
            registrationData.manually_added ? 'Yes' : 'No'
        ];

        // Append to sheet
        const response = await sheetsApi.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Registrations!A:R', // A to R columns
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [row]
            }
        });

        console.log('✅ Added to Google Sheets:', registrationData.registration_id);
        return {
            success: true,
            range: response.data.updates.updatedRange
        };

    } catch (error) {
        console.error('❌ Error adding to Google Sheets:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all registrations from Google Sheets
 */
async function getAllRegistrationsFromSheets() {
    try {
        const sheetsApi = initGoogleSheets();
        if (!sheetsApi) {
            throw new Error('Google Sheets not initialized');
        }

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        
        const response = await sheetsApi.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Registrations!A2:R', // Skip header row
        });

        const rows = response.data.values || [];
        
        // Convert rows to objects
        const registrations = rows.map(row => ({
            registration_id: row[0] || '',
            order_id: row[1] || '',
            created_at: row[2] || '',
            name: row[3] || '',
            mobile: row[4] || '',
            email: row[5] || '',
            club: row[6] || '',
            club_id: row[7] || '',
            registration_type: row[8] || '',
            registration_amount: parseFloat(row[9]) || 0,
            meal_preference: row[10] || '',
            payment_status: row[11] || 'pending',
            payment_method: row[12] || '',
            transaction_id: row[13] || '',
            upi_id: row[14] || '',
            registration_status: row[15] || 'pending',
            verified: row[16] === 'Yes',
            manually_added: row[17] === 'Yes'
        }));

        return registrations;

    } catch (error) {
        console.error('❌ Error reading from Google Sheets:', error);
        return [];
    }
}

/**
 * Update registration in Google Sheets by registration_id
 */
async function updateRegistrationInSheets(registrationId, updateData) {
    try {
        const sheetsApi = initGoogleSheets();
        if (!sheetsApi) {
            throw new Error('Google Sheets not initialized');
        }

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        
        // First, find the row with this registration_id
        const response = await sheetsApi.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Registrations!A:A',
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === registrationId);
        
        if (rowIndex === -1) {
            throw new Error('Registration not found');
        }

        // Update the specific row (rowIndex + 1 because sheets are 1-indexed)
        const rowNumber = rowIndex + 1;
        
        // Build update based on what fields are provided
        const updates = [];
        if (updateData.payment_status) {
            updates.push({
                range: `Registrations!L${rowNumber}`,
                values: [[updateData.payment_status]]
            });
        }
        if (updateData.transaction_id) {
            updates.push({
                range: `Registrations!N${rowNumber}`,
                values: [[updateData.transaction_id]]
            });
        }
        if (updateData.registration_status) {
            updates.push({
                range: `Registrations!P${rowNumber}`,
                values: [[updateData.registration_status]]
            });
        }

        // Execute batch update
        if (updates.length > 0) {
            await sheetsApi.spreadsheets.values.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    valueInputOption: 'RAW',
                    data: updates
                }
            });
        }

        console.log('✅ Updated in Google Sheets:', registrationId);
        return { success: true };

    } catch (error) {
        console.error('❌ Error updating Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    addRegistrationToSheets,
    getAllRegistrationsFromSheets,
    updateRegistrationInSheets
};
