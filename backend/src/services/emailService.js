    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
    });

    const sendOrderStatusEmail = async ({
    email,
    orderId,
    status
    }) => {
    const info = await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: `Order #${orderId} Status Update`,
        html: `
        <h2>Order Status Update</h2>

        <p>
            Your order <strong>#${orderId}</strong>
            has been updated.
        </p>

        <p>
            Current Status:
            <strong>${status}</strong>
        </p>
        `
    });

    console.log("Email sent:", info.messageId);
    };

    const testEmail = async () => {
    try {
        await transporter.verify();

        console.log("SMTP connection successful");
    } catch (error) {
        console.error(
        "SMTP connection failed:",
        error.message
        );
    }
    };

    testEmail();

    module.exports = {
    sendOrderStatusEmail
    };