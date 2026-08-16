const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all stores
router.get("/", async (req, res) => {
    try {
        const [stores] = await db.query(
            `SELECT
                id,
                store_name
            FROM stores
            ORDER BY id ASC`
        );

        res.json({
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            message: "Server error while fetching stores",
            error: String(error),
            sdetails: error
        });
        
    }
});

module.exports = router;