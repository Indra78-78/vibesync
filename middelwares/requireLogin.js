const jwt = require("jsonwebtoken");
const { Jwt_secret } = require("../keys");
const mongoose = require("mongoose");
const USER = mongoose.model("USER");

module.exports = (req, res, next) => {
    const  {authorization}  = req.headers;

    // console.log("Authorization Header:", authorization);

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header is missing or invalid" });
    }

    // Extract token from Authorization header
    const token = authorization.replace("Bearer ", "");
    // console.log("Token:", token);

    // Verify the token
    jwt.verify(token, Jwt_secret, (err, payload) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(401).json({ error: "Invalid token or you must be logged in" });
        }

        console.log("Payload:", payload);

        // Extract user ID from the payload
        const { _id } = payload;
        console.log("User ID:", _id);

        // Find user by ID
        USER.findById(_id)
            .then(userData => {
                console.log("User Data:", userData);

                if (!userData) {
                    console.error("User not found");
                    return res.status(401).json({ error: "User not found" });
                }

                // If user exists, attach user data to request object for further processing if needed
                req.user = userData;
                // Proceed to the next middleware
                next();
            })
            .catch(err => {
                console.error("Error finding user:", err);
                return res.status(500).json({ error: "Internal server error" });
            });
    });
};
