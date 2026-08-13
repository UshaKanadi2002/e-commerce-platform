import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
            path="/register"
            element={<Register />}
        />

        <Route
          path="/"
          element={<Products />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
        path="/my-orders"
        element={<MyOrders />}
      />

      </Routes>

    </BrowserRouter>
  );
}

export default App;