    import { useEffect, useState } from "react";
    import { useNavigate } from "react-router-dom";

    //const STORE_ID = 4;
    
    function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(
    localStorage.getItem("selectedStore") || ""
    );
    const navigate = useNavigate();

    const fetchProducts = async (storeId) => {
    try {
        setLoading(true);
        setError("");

        const response = await fetch(
            `http://localhost:5000/api/products/store/${storeId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load products"
            );
        }

        setProducts(data.products || []);
    } catch (error) {
        console.error("Products error:", error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
    };

    const fetchStores = async () => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/stores"
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load stores"
            );
        }

        setStores(data.stores || []);

        if (data.stores.length > 0) {
    const savedStore = localStorage.getItem("selectedStore");

    const storeExists = data.stores.some(
        (store) => String(store.id) === savedStore
    );

    if (savedStore && storeExists) {
        setSelectedStore(savedStore);
    } else {
        setSelectedStore(String(data.stores[0].id));
    }
    }
    } catch (error) {
        console.error("Stores error:", error);
        setError(error.message);
        setLoading(false);
    }
    };

    useEffect(() => {
    fetchStores();
    }, []);

    useEffect(() => {
    if (selectedStore) {
        localStorage.setItem(
            "selectedStore",
            selectedStore
        );

        fetchProducts(selectedStore);
    }
    }, [selectedStore]);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">
            Loading products...
            </p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">
            {error}
            </p>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    E-Commerce Store
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Browse our products
                </p>
                </div>
                <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">
                        Select Store
                    </label>

                    <select
                        value={selectedStore}
                        onChange={(e) =>
                            setSelectedStore(e.target.value)
                        }
                        className="mt-2 rounded-lg border px-4 py-2 outline-none focus:border-black"
                    >
                        {stores.map((store) => (
                            <option
                                key={store.id}
                                value={store.id}
                            >
                                {store.store_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">

                <button
                    onClick={() => navigate("/my-orders")}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    📦 My Orders
                </button>

                <button
                    onClick={() => navigate("/cart")}
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    🛒 Cart
                </button>

                </div>

            </div>
        </header>

        {/* Products */}
        <main className="mx-auto max-w-7xl px-6 py-10">

            <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
                Products
            </h2>

            <p className="mt-2 text-gray-500">
                Find the products you are looking for.
            </p>
            </div>

            {products.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center">
                <p className="text-gray-500">
                No products available.
                </p>
            </div>
            ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {products.map((product) => {

                const inStock =
                    Number(product.stock_quantity) > 0;

                return (
                    <div
                        key={product.id}
                        onClick={() =>
                            navigate(`/product/${product.id}`)
                        }
                        className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >

                    {/* Image */}
                    {product.image_url ? (
                        <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-56 w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-400">
                        No image
                        </div>
                    )}

                    {/* Details */}
                    <div className="p-5">

                        <p className="text-sm text-gray-500">
                        {product.category}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {product.name}
                        </h3>

                        <p className="mt-3 text-xl font-bold">
                        ₹
                        {Number(
                            product.price
                        ).toLocaleString("en-IN")}
                        </p>

                        <div className="mt-4">

                        {inStock ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                            In Stock
                            </span>
                        ) : (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                            Out of Stock
                            </span>
                        )}

                        </div>

                    </div>

                    </div>
                );
                })}

            </div>
            )}

        </main>

        </div>
    );
    }

    export default Products;