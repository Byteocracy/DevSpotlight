import ApiError from "../utils/apiError.js";

export const checkBan = async (req, res, next) => {
    const user = req.user; 

    if (user.isBanned) {
        if (user.banExpiresAt && user.banExpiresAt < Date.now()) {
            user.isBanned = false;
            user.banExpiresAt = null;
            await user.save();
        } else {
            return next(new ApiError(403, "You are banned until " + user.banExpiresAt));
        }
    }
    next();
};
