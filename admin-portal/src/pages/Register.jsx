    import { useState } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { registerOwner } from "../services/api";

    function Register() {
    const navigate = useNavigate();

    const [storeName, setStoreName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
        await registerOwner(
            storeName,
            name,
            email,
            password
        );

        navigate("/");
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
                Create Store
            </h1>

            <p className="text-gray-500 mt-2">
                Create your store owner account
            </p>
            </div>

            {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

            {/* Store Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
                </label>

                <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Store"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
            </div>

            {/* Owner Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
                </label>

                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
                </label>

                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Creating..." : "Create Store"}
            </button>

            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
                to="/"
                className="font-medium text-black hover:underline"
            >
                Sign in
            </Link>
            </p>

        </div>

        </div>
    );
    }

    export default Register;    