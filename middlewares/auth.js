import AdminModel from "../models/Admin.js";
import jwt from "jsonwebtoken";

export const AuthenticateAdmin = async (req, res, next) => {
    const accessToken = req.cookies.educonnectaccesstoken;
    const refreshToken = req.cookies.educonnecttoken;

    console.log("TOKENS", accessToken, refreshToken);

    // Handle Access Token
    if (accessToken) {
        try {
            // Validate the access token
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const user = await AdminModel.findById(decoded.id);
            if (!user) {
                return res.status(403).json({ success: false, data: "User not found" });
            }
            req.user = user; // Attach user to request
            return next();
        } catch (error) {
            // If token expired, fall through to refresh token logic
            if (error.name !== "TokenExpiredError") {
                return res.status(403).json({ success: false, data: "Invalid access token" });
            }
        }
    }

    // Handle Refresh Token if Access Token is missing/expired
    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
            const user = await AdminModel.findById(decodedRefresh.id);

            if (!user) {
                return res.status(403).json({ success: false, data: "Invalid refresh token" });
            }

            // Generate a new access token
            const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
            res.cookie("educonnectaccesstoken", newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            req.user = user; // Attach user to request
            return next(); // Allow request to proceed
        } catch (refreshError) {
            console.log("Refresh token error:", refreshError);
            return res.status(403).json({ success: false, data: "Invalid refresh token" });
        }
    }

    // If both tokens are invalid or missing
    return res.status(401).json({ success: false, data: "Authentication required" });
};
