// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; // <-- Import Register
import Admin from './pages/Admin';
import Cart from './pages/Cart';

function App() {
  const { user, cart, logout } = useContext(AppContext);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow">
          <Link to="/" className="text-xl font-bold">MyShop</Link>
          <div className="space-x-4 flex items-center">
            <Link to="/" className="hover:text-blue-200">Products</Link>
            {user && <Link to="/cart" className="hover:text-blue-200">Cart ({cartCount})</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="text-yellow-300 font-semibold hover:text-yellow-100">Admin Panel</Link>}
            
            {user ? (
              <button onClick={logout} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 transition">Logout ({user.username})</button>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 transition">Register</Link>
              </>
            )}
          </div>
        </nav>
        
        <main className="p-8 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* <-- Add Route */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
export default App;