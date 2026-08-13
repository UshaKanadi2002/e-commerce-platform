    import { NavLink, useNavigate } from "react-router-dom";

    function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    const navItems = [
        {
        name: "Dashboard",
        path: "/dashboard",
        icon: "▦",
        },
        {
        name: "Products",
        path: "/products",
        icon: "◈",
        },
        {
        name: "POS",
        path: "/pos",
        icon: "▣",
        },
        {
        name: "Orders",
        path: "/orders",
        icon: "≡",
        },
    ];

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-gray-200 px-6">
            <div>
            <h3 className="text-xl font-bold text-gray-black-400">
                Store Admin
            </h3>

            <p className="text-xs text-gray-500">
                Management Portal
            </p>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">

            {navItems.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
                }
            >
                <span className="text-lg">
                {item.icon}
                </span>

                {item.name}
            </NavLink>
            ))}

        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-4">

            <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
            <span className="text-lg">
                ↪
            </span>

            Logout
            </button>

        </div>

        </aside>
    );
    }

    export default Sidebar;