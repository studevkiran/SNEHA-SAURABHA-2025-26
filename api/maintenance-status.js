/**
 * Maintenance Mode Status API
 * Returns whether registration is currently allowed
 * Toggle via Vercel Environment Variable: MAINTENANCE_MODE
 */

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Check maintenance mode from environment variable
        const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
        
        // Custom message from environment (optional)
        const message = process.env.MAINTENANCE_MESSAGE || 
            'Registrations temporarily paused due to payment gateway maintenance. We will resume shortly!';
        
        const expectedResume = process.env.MAINTENANCE_RESUME || 
            '17th January 2026, 10:00 AM';

        res.status(200).json({
            success: true,
            maintenanceMode: isMaintenanceMode,
            message: message,
            expectedResume: expectedResume,
            registrationAllowed: !isMaintenanceMode,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Maintenance status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check maintenance status',
            // Fail-safe: allow registrations if check fails
            maintenanceMode: false,
            registrationAllowed: true
        });
    }
};
