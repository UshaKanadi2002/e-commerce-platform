import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./components/AdminLayout";
import Products from "./pages/Products";
import POS from "./pages/POS";
import Orders from "./pages/Orders";

function Placeholder({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">
        {title}
      </h1>

      <p className="mt-2 text-gray-500">
        This module is coming next.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Admin */}
        <Route element={<AdminLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
          path="/products"
          element={<Products />}
          />

          <Route
            path="/pos"
            element={<POS />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;