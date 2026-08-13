    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";

    function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);

    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        });

const [formError, setFormError] = useState("");

    useEffect(() => {
        const savedCart =
        JSON.parse(localStorage.getItem("cart")) || [];

        setCart(savedCart);
    }, []);

    const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
        ...prev,
        [name]: value,
    }));

    setFormError("");
    };

    const validateForm = () => {
    if (!formData.fullName.trim()) {
        return "Please enter your full name";
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
        return "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
        return "Please enter your address";
    }

    if (!formData.city.trim()) {
        return "Please enter your city";
    }

    if (!/^[0-9]{6}$/.test(formData.pincode)) {
        return "Please enter a valid 6-digit pincode";
    }

    return "";
};

const handlePlaceOrder = async () => {
    const error = validateForm();

    if (error) {
        setFormError(error);
        return;
    }

    try {
        setFormError("");

        const response = await fetch(
            "http://localhost:5000/api/orders/online",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        storeId: item.store_id,
                    })),
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to place order"
            );
        }

        console.log("Orders created:", data);

        const orderIds = data.orders
            .map((order) => order.id)
            .join(", ");

        alert(
            `Order placed successfully!\nOrder IDs: ${orderIds}`
        );

        localStorage.removeItem("cart");

        navigate("/");
    } catch (error) {
        console.error("Place order error:", error);
        setFormError(error.message);
    }
};
    const total = cart.reduce(
        (sum, item) =>
        sum + Number(item.price) * item.quantity,
        0
    );

    if (cart.length === 0) {
        return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">

            <h1 className="text-3xl font-bold text-gray-900">
                Your cart is empty
            </h1>

            <p className="mt-2 text-gray-500">
                Add products before proceeding to checkout.
            </p>

            <button
                onClick={() => navigate("/")}
                className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            >
                Browse Products
            </button>

            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5">

            <button
                onClick={() => navigate("/cart")}
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Back to Cart
            </button>

            <h1 className="mt-3 text-2xl font-bold text-gray-900">
                Checkout
            </h1>

            </div>
        </header>

        {/* Checkout */}
        <main className="mx-auto max-w-6xl px-6 py-10">

            <div className="grid gap-8 lg:grid-cols-3">

            {/* Customer Details */}
            <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

                <h2 className="text-xl font-semibold text-gray-900">
                Delivery Details
                </h2>

                {formError && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {formError}
                </p>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                    <label className="text-sm font-medium text-gray-700">
                    Full Name
                    </label>

                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">
                    Phone Number
                    </label>

                    <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                    Address
                    </label>

                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Enter delivery address"
                        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">
                    City
                    </label>

                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700">
                    Pincode
                    </label>

                    <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                    />
                </div>

                </div>

            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-gray-900">
                Order Summary
                </h2>

                <div className="mt-6 space-y-4">

                {cart.map((item) => (
                    <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                    >
                    <div>
                        <p className="font-medium text-gray-900">
                        {item.name}
                        </p>

                        <p className="text-gray-500">
                        Qty: {item.quantity}
                        </p>
                    </div>

                    <p className="font-medium">
                        ₹
                        {(
                        Number(item.price) * item.quantity
                        ).toLocaleString("en-IN")}
                    </p>
                    </div>
                ))}

                </div>

                <div className="my-6 border-t" />

                <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span>
                    ₹{total.toLocaleString("en-IN")}
                </span>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    className="mt-6 w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800"
                    >
                    Place Order
                    </button>

            </div>

            </div>

        </main>
        </div>
    );
    }

    export default Checkout;