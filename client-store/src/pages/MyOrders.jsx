    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";

    function MyOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/orders/my-orders",
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "Failed to load orders"
            );
        }

        setOrders(data.orders || []);
        } catch (error) {
        console.error("Orders error:", error);
        setError(error.message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">
            Loading your orders...
            </p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">{error}</p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5">

            <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Back to Products
            </button>

            <h1 className="mt-3 text-2xl font-bold text-gray-900">
                My Orders
            </h1>

            </div>
        </header>

        {/* Orders */}
        <main className="mx-auto max-w-5xl px-6 py-10">

            {orders.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                <h2 className="text-xl font-semibold text-gray-900">
                No orders yet
                </h2>

                <p className="mt-2 text-gray-500">
                Your orders will appear here after you place an order.
                </p>

                <button
                onClick={() => navigate("/")}
                className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
                >
                Browse Products
                </button>

            </div>
            ) : (
            <div className="space-y-5">

                {orders.map((order) => (
                <div
                    key={order.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                >

                    <div className="flex flex-col justify-between gap-4 sm:flex-row">

                    <div>
                        <p className="text-sm text-gray-500">
                        Order ID
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-gray-900">
                        #{order.id}
                        </h2>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                        Status
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        {order.status}
                        </span>
                    </div>

                    </div>

                    <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">

                    <div>
                        <p className="text-sm text-gray-500">
                        Store
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                        Store #{order.store_id}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                        Type
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                        {order.source}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                        Customer
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                        {order.customer_email}
                        </p>
                    </div>

                    </div>

                </div>
                ))}

            </div>
            )}

        </main>

        </div>
    );
    }

    export default MyOrders;