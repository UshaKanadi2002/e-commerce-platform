const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();
//CREATE
router.post("/", authenticate, async (req, res) => {
    try {
        const {
        name,
        category,
        price,
        stock_quantity,
        description,
        image_url
        } = req.body;

    // 1. Validate required fields
    if (
        !name ||
        !category ||
        price === undefined ||
        stock_quantity === undefined
    ) {
        return res.status(400).json({
            message: "Name, category, price and stock quantity are required"
        });
    }

    // 2. Only store owners can create products
    if (req.user.role !== "STORE_OWNER") {
        return res.status(403).json({
            message: "Only store owners can create products"
        });
    }

    // 3. Find the store belonging to the logged-in user
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

    // 4. Create product
        const [result] = await db.query(
        `INSERT INTO products
        (
            store_id,
            name,
            category,
            price,
            stock_quantity,
            description,
            image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            storeId,
            name,
            category,
            price,
            stock_quantity,
            description || null,
            image_url || null
        ]
    );

    // 5. Return created product
    res.status(201).json({
        message: "Product created successfully",
        product: {
        id: result.insertId,
        store_id: storeId,
        name,
        category,
        price,
        stock_quantity,
        description: description || null,
        image_url: image_url || null
        }
    });

    } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
        message: "Server error while creating product"
    });
    }
});

//READ
router.get("/", authenticate, async (req, res) => {
try {
    // Find the store belonging to the logged-in owner
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

    // Get only this store's products
    const [products] = await db.query(
        `SELECT
        id,
        name,
        category,
        price,
        stock_quantity,
        description,
        image_url,
        is_active,
        created_at,
        updated_at
        FROM products
        WHERE store_id = ?
        ORDER BY created_at DESC`,
        [storeId]
    );

    res.json({
        products
    });

    } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
        message: "Server error while fetching products"
    });
    }
});
//public product route
router.get("/store/:storeId", async (req, res) => {
    try {
        const storeId = req.params.storeId;

        const [products] = await db.query(
        `SELECT
            id,
            name,
            category,
            price,
            stock_quantity,
            description,
            image_url
        FROM products
        WHERE store_id = ?
        AND is_active = TRUE
        ORDER BY created_at DESC`,
        [storeId]
        );

        res.json({
        products
        });

    } catch (error) {
        console.error("Public products error:", error);

        res.status(500).json({
        message: "Server error while fetching products"
        });
    }
});
//UPDATE
router.put("/:id", authenticate, async (req, res) => {
    try {
    const productId = req.params.id;

    const {
        name,
        category,
        price,
        stock_quantity,
        description,
        image_url,
        is_active
    } = req.body;

    // 1. Find the logged-in owner's store
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

    // 2. Check whether product belongs to this store
    const [products] = await db.query(
        "SELECT id FROM products WHERE id = ? AND store_id = ?",
        [productId, storeId]
    );

    if (products.length === 0) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    // 3. Update product
    await db.query(
        `UPDATE products
        SET
            name = ?,
            category = ?,
            price = ?,
            stock_quantity = ?,
            description = ?,
            image_url = ?,
            is_active = ?
        WHERE id = ? AND store_id = ?`,
        [
        name,
        category,
        price,
        stock_quantity,
        description || null,
        image_url || null,
        is_active !== undefined ? is_active : true,
        productId,
        storeId
        ]
    );

    res.json({
        message: "Product updated successfully"
    });

} catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
        message: "Server error while updating product"
    });
    }
});

//DELETE
router.delete("/:id", authenticate, async (req, res) => {
    try {
    const productId = req.params.id;

    // Find owner's store
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

    // Delete only if product belongs to this store
    const [result] = await db.query(
        "DELETE FROM products WHERE id = ? AND store_id = ?",
        [productId, storeId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json({
        message: "Product deleted successfully"
    });

} catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
        message: "Server error while deleting product"
    });
}
});

//client
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    const [products] = await db.query(
      `SELECT
        id,
        store_id,
        name,
        category,
        price,
        stock_quantity,
        description,
        image_url,
        is_active
       FROM products
       WHERE id = ?
       AND is_active = TRUE`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      product: products[0]
    });

  } catch (error) {
    console.error("Product details error:", error);

    res.status(500).json({
      message: "Server error while fetching product"
    });
  }
});

module.exports = router;