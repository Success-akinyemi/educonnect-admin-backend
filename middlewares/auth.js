import AdminModel from "../models/Admin.js";
import jwt from 'jsonwebtoken';

export const AuthenticateAdmin = async (req, res, next) => {
    const accessToken = req.cookies.educonnectaccesstoken;
    const refreshToken = req.cookies.educonnecttoken;

    //console.log('TOKENS', accessToken, refreshToken)

    if (!accessToken) {
        return res.status(401).json({ success: false, data: 'Access token required' });
    }

    try {
        // Validate the access token
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await AdminModel.findById(decoded.id);
        req.user = user;
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Access token expired; validate the refresh token
            if (!refreshToken) {
                return res.status(403).json({ success: false, data: 'Refresh token required' });
            }

            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await AdminModel.findById(decodedRefresh.id);
                if (!user || user.refreshToken !== refreshToken) {
                    return res.status(403).json({ success: false, data: 'Invalid refresh token' });
                }

                // Generate a new access token
                const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
                res.cookie('apostolicadminaccesstoken', newAccessToken, {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: true,
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });
                req.user = { id: user._id };
                return next();
            } catch (refreshError) {
                return res.status(403).json({ success: false, data: 'Invalid refresh token' });
            }
        } else {
            return res.status(403).json({ success: false, data: 'Invalid access token' });
        }
    }
};
