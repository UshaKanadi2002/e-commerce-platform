    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { loginOwner } from "../services/api";

    function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
        const data = await loginOwner(email, password);

        // Make sure this is a store owner
        if (data.user.role !== "STORE_OWNER") {
            setError("Only store owners can access the admin portal.");
            setLoading(false);
            return;
        }

        // Save JWT
        localStorage.setItem("token", data.token);

        // Save user information
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        navigate("/dashboard");

        } catch (error) {
        setError(error.message);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

            <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
                Store Admin
            </h1>

            <p className="text-gray-500 mt-2">
                Sign in to manage your store
            </p>
            </div>

            {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
                </label>

                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
                </label>

                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>

            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{" "}
                <a
                    href="/register"
                    className="font-medium text-black hover:underline">
                    Create Store
                </a>
                </p>

        </div>

        </div>
    );
    }

    export default Login;