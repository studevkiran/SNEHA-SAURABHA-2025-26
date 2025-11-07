/**
 * Admin Login API
 * Validates admin credentials against environment variables
 */

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        // Get credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Trim and compare (case-sensitive)
        const usernameMatch = username.trim() === adminUsername;
        const passwordMatch = password.trim() === adminPassword;

        if (usernameMatch && passwordMatch) {
            return res.status(200).json({
                success: true,
                message: 'Login successful'
            });
        } else {
            return res.status(401).json({
                success: false,
                error: 'Invalid username or password'
            });
        }

    } catch (error) {
        console.error('❌ Admin login error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
