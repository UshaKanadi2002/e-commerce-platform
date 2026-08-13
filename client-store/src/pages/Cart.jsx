    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";

    function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart =
        JSON.parse(localStorage.getItem("cart")) || [];

        setCart(savedCart);
    }, []);

    const updateQuantity = (id, change) => {
        const updatedCart = cart
        .map((item) => {
            if (item.id !== id) {
            return item;
            }

            const newQuantity = item.quantity + change;

            if (newQuantity <= 0) {
            return null;
            }

            if (newQuantity > Number(item.stock_quantity)) {
            alert("Maximum available stock reached");
            return item;
            }

            return {
            ...item,
            quantity: newQuantity,
            };
        })
        .filter(Boolean);

        setCart(updatedCart);

        localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
        );
    };

    const removeItem = (id) => {
        const updatedCart = cart.filter(
        (item) => item.id !== id
        );

        setCart(updatedCart);

        localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
        );
    };

    const total = cart.reduce(
        (sum, item) =>
        sum + Number(item.price) * item.quantity,
        0
    );

    return (
        <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">

            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                Your Cart
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                Review your selected products
                </p>
            </div>

            <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-600 hover:text-black"
            >
                ← Continue Shopping
            </button>

            </div>
        </header>

        {/* Cart */}
        <main className="mx-auto max-w-6xl px-6 py-10">

            {cart.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

                <h2 className="text-2xl font-semibold text-gray-900">
                Your cart is empty
                </h2>

                <p className="mt-2 text-gray-500">
                Add some products to your cart to continue.
                </p>

                <button
                onClick={() => navigate("/")}
                className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
                >
                Browse Products
                </button>

            </div>
            ) : (
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Cart Items */}
                <div className="space-y-4 lg:col-span-2">

                {cart.map((item) => (
                    <div
                    key={item.id}
                    className="flex gap-5 rounded-2xl bg-white p-5 shadow-sm"
                    >

                    {/* Image */}
                    {item.image_url ? (
                        <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-28 w-28 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
                        No image
                        </div>
                    )}

                    {/* Details */}
                    <div className="flex flex-1 flex-col">

                        <div className="flex justify-between gap-4">

                        <div>
                            <h2 className="font-semibold text-gray-900">
                            {item.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                            ₹
                            {Number(item.price).toLocaleString(
                                "en-IN"
                            )}
                            </p>
                        </div>

                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>

                        </div>

                        {/* Quantity */}
                        <div className="mt-auto flex items-center gap-3 pt-4">

                        <button
                            onClick={() =>
                            updateQuantity(item.id, -1)
                            }
                            className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                        >
                            −
                        </button>

                        <span className="w-6 text-center font-medium">
                            {item.quantity}
                        </span>

                        <button
                            onClick={() =>
                            updateQuantity(item.id, 1)
                            }
                            className="h-8 w-8 rounded-lg border hover:bg-gray-100"
                        >
                            +
                        </button>

                        </div>

                    </div>

                    </div>
                ))}

                </div>

                {/* Summary */}
                <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">

                <h2 className="text-xl font-semibold text-gray-900">
                    Order Summary
                </h2>

                <div className="mt-6 flex justify-between text-gray-600">
                    <span>Subtotal</span>

                    <span>
                    ₹{total.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="my-4 border-t" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>

                    <span>
                    ₹{total.toLocaleString("en-IN")}
                    </span>
                </div>

                <button
                    className="mt-6 w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800"
                    onClick={() => navigate("/checkout")}
                >
                    Proceed to Checkout
                </button>

                </div>

            </div>
            )}

        </main>
        </div>
    );
    }

    export default Cart;