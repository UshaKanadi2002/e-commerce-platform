const express = require("express");
const cors = require("cors");

require("dotenv").config();


const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const storeRoutes = require("./routes/storeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5000",
    //"https://ecommerce-admin-portal-nu.vercel.app",
    "https://ecommerce-admin-portal-eight.vercel.app/",
    "https://ecommerce-client-store-alpha.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/*
app.use(cors()); //allow all
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST'],
    allowedHeraders: ['Content-Type','Authorization']
}));
*/

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "E-Commerce POS backend is running",
    });
});

//start the server and listen on the specified port

db.getConnection()
    .then((connection) => {
        console.log("MySQL database connected successfully");
        connection.release(); // Release the connection back to the pool
    })
    .catch((error) => {
    console.error("MySQL connection failed");
    console.error(error.message);
    });

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});