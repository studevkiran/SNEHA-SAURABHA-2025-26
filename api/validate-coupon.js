
const VALID_COUPONS = {
    'TEST1': {
        type: 'fixed',
        value: 1,
        description: 'Sets the price to ₹1 for testing purposes.'
    }
};
module.exports = async (req, res) => {
    const { couponCode, registrationType } = req.body;

    if (!couponCode || !registrationType) {
        return res.status(400).json({
            success: false,
            error: 'Coupon code and registration type are required.'
        });
    }

    const coupon = VALID_COUPONS[couponCode.toUpperCase()];

    if (coupon) {
        res.status(200).json({
            success: true,
            newPrice: coupon.value,
            message: coupon.description
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Invalid coupon code.'
        });
    }
};