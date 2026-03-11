// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Cart from './pages/Cart';
import Blog from './pages/Blog';

function App() {
  const { user, cart, logout } = useContext(AppContext);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      {/* Changed the main background to match the cream/off-white theme 
        and updated the global text color to our Midnight Blue (slate-900)
      */}
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
        
        {/* TRANSPARENT HEADER */}
        <header className="w-full bg-transparent">
          <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
            
            {/* BRAND LOGO */}
            <Link to="/" className="text-3xl font-black uppercase tracking-tighter hover:opacity-70 transition-opacity">
              KTO YA KROL?
            </Link>

            {/* MAIN NAVIGATION LINKS */}
            <div className="hidden md:flex space-x-10 items-center">
              <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors">
                Products
              </Link>
              <Link to="/blog" className="text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors">
                Campaign
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-800 transition-colors">
                  Admin
                </Link>
              )}
            </div>

            {/* ACTION BUTTONS & CART */}
            <div className="flex items-center space-x-6">
              {user && (
                <Link to="/cart" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors">
                  Cart ({cartCount})
                </Link>
              )}
              
              {user ? (
                <button 
                  onClick={logout} 
                  className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors hidden sm:block">
                    Login
                  </Link>
                  <Link to="/register" className="bg-slate-900 text-white border-2 border-slate-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-transparent hover:text-slate-900 transition-all duration-300 shadow-md hover:shadow-none">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        
        {/* MAIN CONTENT AREA */}
        <main className="w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;