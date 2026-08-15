import { useEffect, useState } from "react";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                //"http://localhost:5000/api/orders",
                `${import.meta.env.VITE_API_URL}/api/orders`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch orders"
                );
            }

            setOrders(data.orders || []);
        } catch (error) {
            console.error("Orders error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, status) => {
        try {
            setUpdatingId(orderId);

            const token = localStorage.getItem("token");

            const response = await fetch(
                //`http://localhost:5000/api/orders/${orderId}/status`,
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update order status"
                );
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status: data.order.status,
                        }
                        : order
                )
            );

            alert("Order status updated successfully");
        } catch (error) {
            console.error("Update status error:", error);
            alert(error.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "CONFIRMED":
                return "bg-blue-100 text-blue-700";

            case "SHIPPED":
                return "bg-purple-100 text-purple-700";

            case "DELIVERED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Order Management
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    View and manage orders from your store.
                </p>
            </div>

            {/* Orders */}
            <div className="rounded-xl bg-white shadow-sm">

                {loading ? (
                    <div className="p-6 text-center text-gray-500">
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No orders found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Order ID
                                    </th>

                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Customer
                                    </th>

                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Source
                                    </th>

                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Total
                                    </th>

                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-sm font-semibold">
                                        Update Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b last:border-b-0"
                                    >

                                        <td className="px-6 py-4 font-medium">
                                            #{order.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            {order.customer_email}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    order.source === "POS"
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {order.source}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4 font-medium">
                                            ₹
                                            {Number(
                                                order.total
                                            ).toLocaleString("en-IN")}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <select
                                                value={order.status}
                                                disabled={
                                                    updatingId === order.id
                                                }
                                                onChange={(e) =>
                                                    updateStatus(
                                                        order.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                                            >

                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="CONFIRMED">
                                                    Confirmed
                                                </option>

                                                <option value="SHIPPED">
                                                    Shipped
                                                </option>

                                                <option value="DELIVERED">
                                                    Delivered
                                                </option>

                                                <option value="CANCELLED">
                                                    Cancelled
                                                </option>

                                            </select>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Orders;