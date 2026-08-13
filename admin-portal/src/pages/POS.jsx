    import { useEffect, useState } from "react";

    function POS() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchProducts = async () => {
        try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/products",
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "Failed to fetch products"
            );
        }

        setProducts(data.products || []);
        } catch (error) {
        console.error("POS products error:", error);
        alert(error.message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        if (Number(product.stock_quantity) <= 0) {
        alert("Product is out of stock");
        return;
        }

        setCart((currentCart) => {
        const existing = currentCart.find(
            (item) => item.id === product.id
        );

        if (existing) {
            if (
            existing.quantity >=
            Number(product.stock_quantity)
            ) {
            alert("Cannot add more than available stock");
            return currentCart;
            }

            return currentCart.map((item) =>
            item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                }
                : item
            );
        }

        return [
            ...currentCart,
            {
            ...product,
            quantity: 1,
            },
        ];
        });
    };

    const increaseQuantity = (id) => {
        setCart((currentCart) =>
        currentCart.map((item) => {
            if (item.id !== id) {
            return item;
            }

            if (item.quantity >= Number(item.stock_quantity)) {
            return item;
            }

            return {
            ...item,
            quantity: item.quantity + 1,
            };
        })
        );
    };

    const decreaseQuantity = (id) => {
        setCart((currentCart) =>
        currentCart
            .map((item) =>
            item.id === id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                }
                : item
            )
            .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((currentCart) =>
        currentCart.filter((item) => item.id !== id)
        );
    };

    const subtotal = cart.reduce(
        (total, item) =>
        total +
        Number(item.price) * Number(item.quantity),
        0
    );

    const tax = 0;

    const total = subtotal + tax;

    const completePurchase = async () => {
        if (cart.length === 0) {
        alert("Cart is empty");
        return;
        }

        setProcessing(true);

        try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/orders/pos",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                items: cart.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                })),
                tax,
            }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.message || "POS checkout failed"
            );
        }

        alert(
            `Purchase completed successfully!\nOrder #${data.order.id}`
        );

        setCart([]);

        // Refresh inventory
        fetchProducts();

        } catch (error) {
        alert(error.message);
        } finally {
        setProcessing(false);
        }
    };

    return (
        <div>

        {/* Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
            Point of Sale
            </h1>

            <p className="mt-1 text-sm text-gray-500">
            Process in-store purchases.
            </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

            {/* Products */}
            <div className="lg:col-span-2">

            <div className="rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-6 text-lg font-semibold">
                Products
                </h2>

                {loading ? (
                <p className="text-gray-500">
                    Loading products...
                </p>
                ) : products.length === 0 ? (
                <p className="text-gray-500">
                    No products available.
                </p>
                ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                    {products.map((product) => (
                    <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={
                        Number(product.stock_quantity) <= 0
                        }
                        className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="mb-4 h-36 w-full rounded-lg object-cover"
                        />
                        ) : (
                        <div className="mb-4 flex h-36 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                            No image
                        </div>
                        )}

                        <h3 className="font-semibold text-gray-900">
                        {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                        {product.category}
                        </p>

                        <div className="mt-3 flex items-center justify-between">

                        <span className="font-semibold">
                            ₹
                            {Number(
                            product.price
                            ).toLocaleString("en-IN")}
                        </span>

                        <span className="text-xs text-gray-500">
                            Stock: {product.stock_quantity}
                        </span>

                        </div>

                    </button>
                    ))}

                </div>
                )}

            </div>

            </div>

            {/* Cart */}
            <div>

            <div className="sticky top-6 rounded-xl bg-white p-6 shadow-sm">

                <h2 className="mb-6 text-lg font-semibold">
                Current Bill
                </h2>

                {cart.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                    Cart is empty
                </div>
                ) : (
                <div className="space-y-4">

                    {cart.map((item) => (
                    <div
                        key={item.id}
                        className="border-b border-gray-100 pb-4"
                    >

                        <div className="flex justify-between gap-3">

                        <div>
                            <p className="font-medium">
                            {item.name}
                            </p>

                            <p className="text-sm text-gray-500">
                            ₹
                            {Number(
                                item.price
                            ).toLocaleString("en-IN")}
                            </p>
                        </div>

                        <button
                            onClick={() =>
                            removeFromCart(item.id)
                            }
                            className="text-xs text-red-600"
                        >
                            Remove
                        </button>

                        </div>

                        <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <button
                            onClick={() =>
                                decreaseQuantity(item.id)
                            }
                            className="h-8 w-8 rounded border"
                            >
                            -
                            </button>

                            <span className="w-5 text-center">
                            {item.quantity}
                            </span>

                            <button
                            onClick={() =>
                                increaseQuantity(item.id)
                            }
                            className="h-8 w-8 rounded border"
                            >
                            +
                            </button>

                        </div>

                        <span className="font-medium">
                            ₹
                            {(
                            Number(item.price) *
                            Number(item.quantity)
                            ).toLocaleString("en-IN")}
                        </span>

                        </div>

                    </div>
                    ))}

                </div>
                )}

                {/* Summary */}
                <div className="mt-6 space-y-3 border-t pt-5">

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                    Subtotal
                    </span>

                    <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                    Tax
                    </span>

                    <span>
                    ₹{tax.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total</span>

                    <span>
                    ₹{total.toLocaleString("en-IN")}
                    </span>
                </div>

                </div>

                <button
                onClick={completePurchase}
                disabled={
                    cart.length === 0 || processing
                }
                className="mt-6 w-full rounded-lg bg-black py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {processing
                    ? "Processing..."
                    : "Complete Purchase"}
                </button>

            </div>

            </div>

        </div>

        </div>
    );
    }

    export default POS;