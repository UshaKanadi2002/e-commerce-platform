const authenticate = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");


const router = express.Router();

//auth 
router.get("/profile", authenticate, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, name, email, role
            FROM users
            WHERE id = ?`,
            [req.user.userId]
        );
        if (users.length === 0) {
            return res.status(404).json({
                message: "user not found",
            });
        }
        res.json({
            user: users[0],
        });
    } catch (error) {
        console.error("profile error:", error);
        res.status(500).json({
            message: "server error",
        });
    }
});

//post api/auth/register
router.post("/register", async (req, res) => {
    try {
        const{name, email, password, storeName } = req.body;
        
        //1.validate required feilds
        if (!name || !email || !password || !storeName) {
            return res.status(400).json({
                message : "ALL FEILDS ARE REQUIRED",
            });
        }

        //2.check if email already exists in the db
        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "EMAIL ALREADY Resgistered",
            });
        }

        // 3. Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        //4.Create store owner
        const [userResult] = await db.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'STORE_OWNER')`,
            [name, email, passwordHash]
        );

        const userId = userResult.insertId;

        //5.create Store
        const [storeResult] = await db.query(
            `INSERT INTO stores (owner_id, store_name) VALUES (?, ?)`,
            [userId, storeName]
        );

        res.status(201).json({
            message: "store owner registered successfully",
            user: {
                id: userId,
                name,
                email,
                role: "STORE_OWNER",
            },
            store: {
                id: storeResult.insertId,
                name: storeName,
            },
        });
    } catch (error) {
        console.error("Error during registration:", error);

        res.status(500).json({
            message: "Interal server error during registration",
        });
    }
});
//customer-registration
router.post("/register-customer", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
        }

        const [existingUsers] = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
        );

        if (existingUsers.length > 0) {
        return res.status(409).json({
            message: "Email already registered"
        });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
        `INSERT INTO users
        (name, email, password_hash, role)
        VALUES (?, ?, ?, 'CUSTOMER')`,
        [name, email, passwordHash]
        );

        res.status(201).json({
        message: "Customer registered successfully",
        user: {
            id: result.insertId,
            name,
            email,
            role: "CUSTOMER"
        }
        });

    } catch (error) {
        console.error("Customer registration error:", error);

        res.status(500).json({
        message: "Server error during customer registration"
        });
    }
});
//login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

    // 1. Validate fields
    if (!email || !password) {
        return res.status(400).json({
        message: "Email and password are required",
        });
    }

    // 2. Find user
    const [users] = await db.query(
        `SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = ?`,
        [email]
    );

    if (users.length === 0) {
        return res.status(401).json({
        message: "Invalid email or password",
        });
    }

    const user = users[0];

    // 3. Compare password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        return res.status(401).json({
        message: "Invalid email or password",
        });
    }

    // 4. Create JWT
    const token = jwt.sign(
    {
        userId: user.id,
        role: user.role,
    },
        process.env.JWT_SECRET,
    {
        expiresIn: "1d",
    }
    );

    // 5. Return token
    res.json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
} catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
        message: "Server error during login",
    });
}
});

module.exports = router;