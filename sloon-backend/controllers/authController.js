const User = require("./models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Handle User Login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if username exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET, // Use a secret key from your environment
            { expiresIn: "1h" } // Token expiration time (optional)
        );

        // Send the token back to the client
        res.status(200).json({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }
};
