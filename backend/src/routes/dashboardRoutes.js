const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    try {
        if (req.user.role !== "STORE_OWNER") {
            return res.status(403).json({
                message: "Only store owners can view dashboard"
            });
        }

        const [stores] = await db.query(
            "SELECT id FROM stores WHERE owner_id = ?",
            [req.user.userId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        const storeId = stores[0].id;

        const [productResult] = await db.query(
            `SELECT COUNT(*) AS totalProducts
             FROM products
             WHERE store_id = ?`,
            [storeId]
        );

        const [orderResult] = await db.query(
            `SELECT COUNT(*) AS totalOrders
             FROM orders
             WHERE store_id = ?`,
            [storeId]
        );

        const [onlineResult] = await db.query(
            `SELECT COUNT(*) AS onlineOrders
             FROM orders
             WHERE store_id = ?
             AND source = 'ONLINE'`,
            [storeId]
        );

        const [posResult] = await db.query(
            `SELECT COUNT(*) AS posOrders
             FROM orders
             WHERE store_id = ?
             AND source = 'POS'`,
            [storeId]
        );

        res.json({
            totalProducts: Number(productResult[0].totalProducts),
            totalOrders: Number(orderResult[0].totalOrders),
            onlineOrders: Number(onlineResult[0].onlineOrders),
            posOrders: Number(posResult[0].posOrders)
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Server error while fetching dashboard"
        });
    }
});

module.exports = router;