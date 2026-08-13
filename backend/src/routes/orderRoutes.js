const express = require("express");
const db = require("../config/db");
const authenticate = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/email");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    try {
        if (req.user.role !== "STORE_OWNER") {
        return res.status(403).json({
            message: "Only store owners can view orders"
        });
        }

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

        // Get all orders for this store
        const [orders] = await db.query(
        `SELECT
            id,
            customer_id,
            customer_email,
            source,
            status,
            subtotal,
            tax,
            total,
            created_at,
            updated_at
        FROM orders
        WHERE store_id = ?
        ORDER BY created_at DESC`,
        [storeId]
        );

        res.json({
        orders
        });

    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
        message: "Server error while fetching orders"
        });
    }
});

router.get("/my-orders", authenticate, async (req, res) => {
    try {
        if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({
            message: "Only customers can view their orders"
        });
        }

        const [orders] = await db.query(
        `SELECT
            id,
            store_id,
            customer_email,
            source,
            status,
            subtotal,
            tax,
            total,
            created_at,
            updated_at
        FROM orders
        WHERE customer_id = ?
        AND source = 'ONLINE'
        ORDER BY created_at DESC`,
        [req.user.userId]
        );

        res.json({
        orders
        });

    } catch (error) {
        console.error("My orders error:", error);

        res.status(500).json({
        message: "Server error while fetching your orders"
        });
    }
});

router.post("/online", authenticate, async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { items } = req.body;

        if (!items || items.length === 0) {
            connection.release();

            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Only customers can place online orders
        if (req.user.role !== "CUSTOMER") {
            connection.release();

            return res.status(403).json({
                message: "Only customers can place online orders"
            });
        }

        await connection.beginTransaction();

        // Get customer details
        const [customers] = await connection.query(
            `SELECT id, email
             FROM users
             WHERE id = ? AND role = 'CUSTOMER'`,
            [req.user.userId]
        );

        if (customers.length === 0) {
            throw new Error("Customer not found");
        }

        const customer = customers[0];

        /*
         * Group cart items by store
         *
         * Example:
         *
         * Store 1:
         *   Product A
         *   Product B
         *
         * Store 2:
         *   Product C
         */
        const itemsByStore = {};

        for (const item of items) {
            if (!item.productId || !item.quantity || !item.storeId) {
                throw new Error(
                    "Each cart item must contain productId, quantity and storeId"
                );
            }

            if (Number(item.quantity) <= 0) {
                throw new Error("Quantity must be greater than zero");
            }

            if (!itemsByStore[item.storeId]) {
                itemsByStore[item.storeId] = [];
            }

            itemsByStore[item.storeId].push(item);
        }

        const createdOrders = [];

        /*
         * Create one order for each store
         */
        for (const storeId of Object.keys(itemsByStore)) {

            // Verify store exists
            const [stores] = await connection.query(
                `SELECT id
                 FROM stores
                 WHERE id = ?`,
                [storeId]
            );

            if (stores.length === 0) {
                throw new Error(`Store ${storeId} not found`);
            }

            let subtotal = 0;
            const orderItems = [];

            /*
             * Check products and deduct stock
             */
            for (const item of itemsByStore[storeId]) {

                const [products] = await connection.query(
                    `SELECT
                        id,
                        name,
                        price,
                        stock_quantity
                     FROM products
                     WHERE id = ?
                     AND store_id = ?
                     AND is_active = TRUE
                     FOR UPDATE`,
                    [item.productId, storeId]
                );

                if (products.length === 0) {
                    throw new Error(
                        `Product ${item.productId} not found in store ${storeId}`
                    );
                }

                const product = products[0];

                const quantity = Number(item.quantity);

                if (product.stock_quantity < quantity) {
                    throw new Error(
                        `Insufficient stock for ${product.name}`
                    );
                }

                const itemSubtotal =
                    Number(product.price) * quantity;

                subtotal += itemSubtotal;

                orderItems.push({
                    productId: product.id,
                    quantity,
                    unitPrice: Number(product.price),
                    subtotal: itemSubtotal
                });

                // Deduct inventory
                await connection.query(
                    `UPDATE products
                     SET stock_quantity = stock_quantity - ?
                     WHERE id = ?
                     AND store_id = ?`,
                    [
                        quantity,
                        product.id,
                        storeId
                    ]
                );
            }

            const tax = 0;
            const total = subtotal + tax;

            /*
             * Create order for this store
             */
            const [orderResult] = await connection.query(
                `INSERT INTO orders
                (
                    store_id,
                    customer_id,
                    customer_email,
                    source,
                    status,
                    subtotal,
                    tax,
                    total
                )
                VALUES (?, ?, ?, 'ONLINE', 'PENDING', ?, ?, ?)`,
                [
                    storeId,
                    customer.id,
                    customer.email,
                    subtotal,
                    tax,
                    total
                ]
            );

            const orderId = orderResult.insertId;

            /*
             * Create order items
             */
            for (const item of orderItems) {

                await connection.query(
                    `INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        unit_price,
                        subtotal
                    )
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.productId,
                        item.quantity,
                        item.unitPrice,
                        item.subtotal
                    ]
                );
            }

            createdOrders.push({
                id: orderId,
                store_id: Number(storeId),
                source: "ONLINE",
                status: "PENDING",
                customer_email: customer.email,
                subtotal,
                tax,
                total,
                items: orderItems
            });
        }

        /*
         * Everything succeeded
         */
/*
 * Everything succeeded
 */
await connection.commit();

/*
 * Send order confirmation email
 *
 * One email contains all orders created
 * from the customer's cart.
 */
try {
    const orderSummary = createdOrders
        .map((order) => `
            <div style="margin-bottom: 20px;">
                <h3>Order #${order.id}</h3>

                <p>
                    <strong>Status:</strong> ${order.status}<br>
                    <strong>Subtotal:</strong> ₹${Number(order.subtotal).toLocaleString("en-IN")}<br>
                    <strong>Tax:</strong> ₹${Number(order.tax).toLocaleString("en-IN")}<br>
                    <strong>Total:</strong> ₹${Number(order.total).toLocaleString("en-IN")}
                </p>

                <p><strong>Items:</strong></p>

                <ul>
                    ${order.items
                        .map(
                            (item) => `
                                <li>
                                    Product #${item.productId}
                                    — Qty: ${item.quantity}
                                    — ₹${Number(item.subtotal).toLocaleString("en-IN")}
                                </li>
                            `
                        )
                        .join("")}
                </ul>
            </div>
        `)
        .join("");

    await sendEmail({
        to: customer.email,

        subject: "Order Confirmation - E-Commerce POS",

        text: `
Thank you for your order!

${createdOrders
    .map(
        (order) => `
Order #${order.id}
Status: ${order.status}
Subtotal: ₹${order.subtotal}
Tax: ₹${order.tax}
Total: ₹${order.total}
`
    )
    .join("\n")}

Your order has been successfully placed.
        `,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 20px;
            ">

                <h2>Order Confirmed 🎉</h2>

                <p>
                    Thank you for your order!
                </p>

                ${orderSummary}

                <hr>

                <p>
                    Your order has been successfully placed.
                </p>

                <p>
                    Thank you for shopping with us!
                </p>

            </div>
        `
    });

    console.log(
        "Order confirmation email sent to:",
        customer.email
    );

} catch (emailError) {

    /*
     * Order is already committed.
     * Do NOT rollback the order if email fails.
     */
    console.error(
        "Order created but confirmation email failed:",
        emailError.message
    );
}

res.status(201).json({
    message: "Online orders placed successfully",
    orders: createdOrders
});

    } catch (error) {

        /*
         * If ANY store/order fails,
         * rollback EVERYTHING.
         */
        await connection.rollback();

        console.error("Online checkout error:", error);

        res.status(400).json({
            message: error.message
        });

    } finally {
        connection.release();
    }
});

router.post("/pos", authenticate, async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { items, tax = 0 } = req.body;

        if (!items || items.length === 0) {
        connection.release();

        return res.status(400).json({
            message: "Cart is empty"
        });
        }

        if (req.user.role !== "STORE_OWNER") {
        connection.release();

        return res.status(403).json({
            message: "Only store owners can use POS"
        });
        }

        // Start database transaction
        await connection.beginTransaction();

        // Find owner's store
        const [stores] = await connection.query(
        "SELECT id FROM stores WHERE owner_id = ?",
        [req.user.userId]
        );

        if (stores.length === 0) {
        throw new Error("Store not found");
        }

        const storeId = stores[0].id;

        let subtotal = 0;
        const orderItems = [];

        // Check every product
        for (const item of items) {

        const [products] = await connection.query(
            `SELECT id, name, price, stock_quantity
            FROM products
            WHERE id = ? AND store_id = ?
            FOR UPDATE`,
            [item.productId, storeId]
        );

        if (products.length === 0) {
            throw new Error(
            `Product ${item.productId} not found`
            );
        }

        const product = products[0];

        // Check stock
        if (product.stock_quantity < item.quantity) {
            throw new Error(
            `Insufficient stock for ${product.name}`
            );
        }

        const itemSubtotal =
            Number(product.price) * Number(item.quantity);

        subtotal += itemSubtotal;

        orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            unitPrice: product.price,
            subtotal: itemSubtotal
        });

        // Deduct inventory
        await connection.query(
            `UPDATE products
            SET stock_quantity = stock_quantity - ?
            WHERE id = ? AND store_id = ?`,
            [item.quantity, product.id, storeId]
        );
        }

        const total = subtotal + Number(tax);

        // Create order
        const [orderResult] = await connection.query(
        `INSERT INTO orders
        (
            store_id,
            customer_email,
            source,
            status,
            subtotal,
            tax,
            total
        )
        VALUES (?, ?, 'POS', 'CONFIRMED', ?, ?, ?)`,
        [
            storeId,
            "walk-in@pos.local",
            subtotal,
            tax,
            total
        ]
        );

        const orderId = orderResult.insertId;

        // Create order items
        for (const item of orderItems) {
        await connection.query(
            `INSERT INTO order_items
            (
            order_id,
            product_id,
            quantity,
            unit_price,
            subtotal
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
            orderId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.subtotal
            ]
        );
        }

        // Everything succeeded
        await connection.commit();

        res.status(201).json({
        message: "POS purchase completed successfully",
        order: {
            id: orderId,
            source: "POS",
            subtotal,
            tax,
            total,
            items: orderItems
        }
        });

    } catch (error) {

        // Undo everything if something failed
        await connection.rollback();

        console.error("POS checkout error:", error);

        res.status(400).json({
        message: error.message
        });

    } finally {
        connection.release();
    }
});

router.put("/:id/status", authenticate, async (req, res) => {
    try {
        if (req.user.role !== "STORE_OWNER") {
        return res.status(403).json({
            message: "Only store owners can update order status"
        });
        }

        const orderId = req.params.id;
        const { status } = req.body;

        const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
        ];

        if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
        }

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

        // Get order
        const [orders] = await db.query(
        `SELECT
            id,
            customer_email,
            status
        FROM orders
        WHERE id = ?
        AND store_id = ?`,
        [orderId, storeId]
        );

        if (orders.length === 0) {
        return res.status(404).json({
            message: "Order not found"
        });
        }

        const order = orders[0];

        // Update status
        await db.query(
        `UPDATE orders
        SET status = ?
        WHERE id = ?
        AND store_id = ?`,
        [status, orderId, storeId]
        );

        res.json({
        message: "Order status updated successfully",
        order: {
            id: order.id,
            status,
            customer_email: order.customer_email
        }
        });

    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
        message: "Server error while updating order status"
        });
    }
});

module.exports = router;