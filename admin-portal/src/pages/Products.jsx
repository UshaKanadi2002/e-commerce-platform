    import { useEffect, useState } from "react";

    function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        stock_quantity: "",
        description: "",
        image_url: "",
    });

    const fetchProducts = async () => {
        try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            //"http://localhost:5000/api/products",
            `${import.meta.env.VITE_API_URL}/api/products`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch products");
        }

        setProducts(data.products || []);
        } catch (error) {
        console.error("Fetch products error:", error);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleEdit = (product) => {
    setEditingProduct(product);

    setForm({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        stock_quantity: product.stock_quantity || "",
        description: product.description || "",
        image_url: product.image_url || "",
    });

    setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
        ...previous,
        [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/api/products`;
        const method = editingProduct ? "PUT" : "POST";

        const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            ...form,
            price: Number(form.price),
            stock_quantity: Number(form.stock_quantity),
        }),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data.message ||
            `Failed to ${editingProduct ? "update" : "create"} product`
        );
        }

        setForm({
        name: "",
        category: "",
        price: "",
        stock_quantity: "",
        description: "",
        image_url: "",
        });

        setEditingProduct(null);
        setShowForm(false);

        fetchProducts();

    } catch (error) {
        alert(error.message);
    }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
        "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            //`http://localhost:5000/api/products/${id}`,
            `${import.meta.env.VITE_API_URL}/api/products/${id}`,
            {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete product");
        }

        fetchProducts();

        } catch (error) {
        alert(error.message);
        }
    };

    return (
        <div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

            <div>
            <h1 className="text-2xl font-bold text-gray-900">
                Products
            </h1>

            <p className="mt-1 text-sm text-gray-500">
                Manage your store inventory.
            </p>
            </div>

        <button
        onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);

            if (showForm) {
            setForm({
                name: "",
                category: "",
                price: "",
                stock_quantity: "",
                description: "",
                image_url: "",
            });
            }
        }}
        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
        {showForm ? "Cancel" : "+ Add Product"}
        </button>

        </div>

        {/* Add Product Form */}
        {showForm && (
            <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-lg font-semibold">
                {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form
                onSubmit={handleSubmit}
                className="grid gap-5 md:grid-cols-2"
            >

                <div>
                <label className="mb-2 block text-sm font-medium">
                    Product Name
                </label>

                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Nike Air Max"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium">
                    Category
                </label>

                <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Shoes"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium">
                    Price
                </label>

                <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div>
                <label className="mb-2 block text-sm font-medium">
                    Stock Quantity
                </label>

                <input
                    type="number"
                    name="stock_quantity"
                    value={form.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                    Image URL
                </label>

                <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                    Description
                </label>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the product..."
                    rows="4"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
                </div>

                <div className="md:col-span-2">
                <button
                    type="submit"
                    className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                    Create Product
                </button>
                </div>

            </form>

            </div>
        )}

        {/* Products Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            {loading ? (
            <div className="p-8 text-center text-gray-500">
                Loading products...
            </div>
            ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                No products found. Add your first product.
            </div>
            ) : (
            <div className="overflow-x-auto">

                <table className="w-full text-left">

                <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                        Product
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                        Category
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                        Price
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                        Stock
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                        Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                        Action
                    </th>
                    </tr>
                </thead>

                <tbody>

                    {products.map((product) => (
                    <tr
                        key={product.id}
                        className="border-b border-gray-100 last:border-0"
                    >

                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                            {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                            ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                                No image
                            </div>
                            )}

                            <span className="font-medium text-gray-900">
                            {product.name}
                            </span>

                        </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-4 text-sm">
                        {product.stock_quantity}
                        </td>

                        <td className="px-6 py-4">

                        {Number(product.stock_quantity) > 0 ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            In Stock
                            </span>
                        ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            Out of Stock
                            </span>
                        )}

                        </td>

                        <td className="px-6 py-4">
                    <div className="flex items-center gap-4">

                        <button
                        onClick={() => handleEdit(product)}
                        className="text-sm font-medium text-gray-900 hover:underline"
                        >
                        Edit
                        </button>

                        <button
                        onClick={() => handleDelete(product.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                        Delete
                        </button>

                    </div>
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

    export default Products;