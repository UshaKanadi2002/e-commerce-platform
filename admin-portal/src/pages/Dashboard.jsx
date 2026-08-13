import { useEffect, useState } from "react";

function Dashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        onlineOrders: 0,
        posOrders: 0,
    });

    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/dashboard",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch dashboard"
                );
            }

            setStats(data);

        } catch (error) {
            console.error("Dashboard error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return (
        <div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Overview of your store.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                {/* Total Products */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Products
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {loading ? "..." : stats.totalProducts}
                    </p>
                </div>

                {/* Total Orders */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Total Orders
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {loading ? "..." : stats.totalOrders}
                    </p>
                </div>

                {/* Online Orders */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Online Orders
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {loading ? "..." : stats.onlineOrders}
                    </p>
                </div>

                {/* POS Orders */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        POS Orders
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {loading ? "..." : stats.posOrders}
                    </p>
                </div>

            </div>

        </div>
    );
}

export default Dashboard;