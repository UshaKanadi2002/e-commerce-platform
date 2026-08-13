    import { useEffect, useState } from "react";
    import { useParams, useNavigate } from "react-router-dom";

    function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProduct = async () => {
        try {
        const response = await fetch(
            `http://localhost:5000/api/products/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "Failed to load product"
            );
        }

        setProduct(data.product);
        } catch (error) {
        setError(error.message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const addToCart = () => {
        if (!product || Number(product.stock_quantity) <= 0) {
        return;
        }

        const existingCart =
        JSON.parse(localStorage.getItem("cart")) || [];

        const existingItem = existingCart.find(
        (item) => item.id === product.id
        );

        if (existingItem) {
        if (
            existingItem.quantity >=
            Number(product.stock_quantity)
        ) {
            alert("Maximum available stock already added");
            return;
        }

        existingItem.quantity += 1;
        } else {
        existingCart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            quantity: 1,
            stock_quantity: Number(product.stock_quantity),
            store_id: product.store_id,
        });
        }

        localStorage.setItem(
        "cart",
        JSON.stringify(existingCart)
        );

        alert("Product added to cart");
    };

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">
            Loading product...
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

    if (!product) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Product not found.</p>
        </div>
        );
    }

    const inStock =
        Number(product.stock_quantity) > 0;

    return (
        <div className="min-h-screen bg-gray-50">

        <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5">
            <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-black"
            >
                ← Back to Products
            </button>
            </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-12">

            <div className="grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">

            {/* Image */}

            <div>
                {product.image_url ? (
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-[450px] w-full rounded-xl object-cover"
                />
                ) : (
                <div className="flex h-[450px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                    No image
                </div>
                )}
            </div>

            {/* Information */}

            <div className="flex flex-col justify-center">

                <p className="text-sm font-medium text-gray-500">
                {product.category}
                </p>

                <h1 className="mt-2 text-4xl font-bold text-gray-900">
                {product.name}
                </h1>

                <p className="mt-5 text-3xl font-bold">
                ₹
                {Number(product.price).toLocaleString(
                    "en-IN"
                )}
                </p>

                <p className="mt-6 leading-7 text-gray-600">
                {product.description ||
                    "No description available."}
                </p>

                <div className="mt-6">

                {inStock ? (
                    <div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        In Stock
                    </span>

                    <p className="mt-3 text-sm text-gray-500">
                        {product.stock_quantity} available
                    </p>
                    </div>
                ) : (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                    Out of Stock
                    </span>
                )}

                </div>

                <button
                onClick={addToCart}
                disabled={!inStock}
                className="mt-8 rounded-lg bg-black py-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                {inStock
                    ? "Add to Cart"
                    : "Out of Stock"}
                </button>

            </div>

            </div>

        </main>

        </div>
    );
    }

    export default ProductDetails;