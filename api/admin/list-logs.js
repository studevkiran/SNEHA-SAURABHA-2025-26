/**
 * API: List Available Log Files
 * Admin endpoint to see all available logs
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
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return res.status(200).json({
        success: true,
        message: 'No logs directory found - will be created on first log',
        files: []
      });
    }
    
    // Read all files in logs directory
    const files = fs.readdirSync(logsDir);
    
    // Get file details
    const logFiles = files.map(file => {
      const filePath = path.join(logsDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        type: file.split('-')[0], // Extract type from filename
        date: file.split('-')[1]?.replace('.log', '') // Extract date from filename
      };
    });
    
    // Sort by modified date (newest first)
    logFiles.sort((a, b) => b.modified - a.modified);
    
    // Group by type
    const logsByType = logFiles.reduce((acc, log) => {
      if (!acc[log.type]) {
        acc[log.type] = [];
      }
      acc[log.type].push(log);
      return acc;
    }, {});
    
    return res.status(200).json({
      success: true,
      totalFiles: logFiles.length,
      totalSizeKB: logFiles.reduce((sum, f) => sum + parseFloat(f.sizeKB), 0).toFixed(2),
      files: logFiles,
      byType: logsByType,
      types: Object.keys(logsByType)
    });
    
  } catch (error) {
    console.error('Error listing logs:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
