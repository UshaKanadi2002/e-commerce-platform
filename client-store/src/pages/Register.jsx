import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password
        ) {
            setError("All fields are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                //"http://localhost:5000/api/auth/register-customer",
                `${import.meta.env.VITE_API_URL}/api/auth/register-customer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            alert("Account created successfully!");

            navigate("/login");

        } catch (error) {
            console.error("Registration error:", error);
            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Create your customer account
                    </p>
                </div>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5"
                >

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-black hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;