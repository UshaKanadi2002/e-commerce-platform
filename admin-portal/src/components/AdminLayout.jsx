    import { Outlet } from "react-router-dom";
    import Sidebar from "./Sidebar";

    function AdminLayout() {
    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return (
        <div className="min-h-screen bg-gray-100">

        <Sidebar />

        <main className="ml-64 min-h-screen">

            {/* Top bar */}
            <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                Welcome back
                </h2>

                <p className="text-sm text-gray-500">
                Manage your store from here.
                </p>
            </div>

            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                {user.name || "Store Owner"}
                </p>

                <p className="text-xs text-gray-500">
                {user.email || ""}
                </p>
            </div>

            </header>

            {/* Page */}
            <div className="p-8">
            <Outlet />
            </div>

        </main>

        </div>
    );
    }

    export default AdminLayout;