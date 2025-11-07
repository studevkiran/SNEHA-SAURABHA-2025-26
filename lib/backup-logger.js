/**
 * Backup Logger - Writes registration data to log files
 * Creates daily log files for backup and audit purposes
 */

const fs = require('fs');
const path = require('path');

// Log directory (will be created in /tmp on Vercel)
const LOG_DIR = process.env.LOG_DIR || '/tmp/registration-logs';

/**
 * Ensure log directory exists
 */
function ensureLogDirectory() {
    try {
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
            console.log('✅ Created log directory:', LOG_DIR);
        }
        return true;
    } catch (error) {
        console.error('❌ Failed to create log directory:', error);
        return false;
    }
}

/**
 * Get today's log filename
 */
function getTodayLogFile() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(LOG_DIR, `registrations-${today}.log`);
}

/**
 * Log registration to file
 */
function logRegistration(registrationData) {
    try {
        ensureLogDirectory();
        
        const logFile = getTodayLogFile();
        const timestamp = new Date().toISOString();
        
        // Create log entry
        const logEntry = {
            timestamp: timestamp,
            type: 'REGISTRATION',
            data: registrationData
        };
        
        // Append to log file (one JSON object per line)
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');
        
        console.log('✅ Logged to file:', logFile);
        return { success: true, file: logFile };
        
    } catch (error) {
        console.error('❌ Failed to log registration:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log payment verification
 */
function logPaymentVerification(orderId, status, details) {
    try {
        ensureLogDirectory();
        
        const logFile = getTodayLogFile();
        const timestamp = new Date().toISOString();
        
        const logEntry = {
            timestamp: timestamp,
            type: 'PAYMENT_VERIFICATION',
            order_id: orderId,
            status: status,
            details: details
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');
        
        console.log('✅ Logged payment verification:', orderId);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Failed to log payment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Log WhatsApp confirmation sent
 */
function logWhatsAppSent(registrationId, mobile, status) {
    try {
        ensureLogDirectory();
        
        const logFile = getTodayLogFile();
        const timestamp = new Date().toISOString();
        
        const logEntry = {
            timestamp: timestamp,
            type: 'WHATSAPP_SENT',
            registration_id: registrationId,
            mobile: mobile,
            status: status
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFile, logLine, 'utf8');
        
        console.log('✅ Logged WhatsApp send:', registrationId);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Failed to log WhatsApp:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Read today's log file
 */
function readTodayLog() {
    try {
        const logFile = getTodayLogFile();
        
        if (!fs.existsSync(logFile)) {
            return { success: true, entries: [] };
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        const entries = lines.map(line => JSON.parse(line));
        
        return { success: true, entries: entries };
        
    } catch (error) {
        console.error('❌ Failed to read log:', error);
        return { success: false, error: error.message, entries: [] };
    }
}

/**
 * Get log file for specific date
 */
function getLogForDate(dateString) {
    try {
        const logFile = path.join(LOG_DIR, `registrations-${dateString}.log`);
        
        if (!fs.existsSync(logFile)) {
            return { success: true, entries: [] };
        }
        
        const content = fs.readFileSync(logFile, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        const entries = lines.map(line => JSON.parse(line));
        
        return { success: true, entries: entries };
        
    } catch (error) {
        console.error('❌ Failed to read log for date:', error);
        return { success: false, error: error.message, entries: [] };
    }
}

/**
 * List all log files
 */
function listLogFiles() {
    try {
        ensureLogDirectory();
        
        const files = fs.readdirSync(LOG_DIR);
        const logFiles = files.filter(file => file.endsWith('.log'));
        
        return {
            success: true,
            files: logFiles.map(file => ({
                filename: file,
                path: path.join(LOG_DIR, file),
                date: file.replace('registrations-', '').replace('.log', '')
            }))
        };
        
    } catch (error) {
        console.error('❌ Failed to list log files:', error);
        return { success: false, error: error.message, files: [] };
    }
}

module.exports = {
    logRegistration,
    logPaymentVerification,
    logWhatsAppSent,
    readTodayLog,
    getLogForDate,
    listLogFiles
};
