/**
 * API: View Log Files
 * Admin endpoint to view recent logs
 */

const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, date, lines } = req.query;
    
    // Default to today's date
    const logDate = date || new Date().toISOString().split('T')[0];
    const logType = type || 'requests'; // requests, responses, errors, database, whatsapp, payments, system
    const maxLines = parseInt(lines) || 100;
    
    // Construct log file path
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, `${logType}-${logDate}.log`);
    
    // Check if log file exists
    if (!fs.existsSync(logFile)) {
      return res.status(404).json({
        success: false,
        error: `No logs found for ${logType} on ${logDate}`,
        availableFiles: fs.existsSync(logsDir) ? fs.readdirSync(logsDir) : []
      });
    }
    
    // Read log file
    const logContent = fs.readFileSync(logFile, 'utf8');
    const logLines = logContent.split('\n').filter(line => line.trim());
    
    // Get last N lines
    const recentLogs = logLines.slice(-maxLines);
    
    return res.status(200).json({
      success: true,
      logType: logType,
      date: logDate,
      totalLines: logLines.length,
      returnedLines: recentLogs.length,
      logs: recentLogs.join('\n')
    });
    
  } catch (error) {
    console.error('Error reading logs:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
