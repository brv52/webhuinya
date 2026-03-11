import { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e) => {
      if (e.clientY <= 80) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', controlNavbar);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastScrollY]);

  return (
    <Router>
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
        
        {/* Smart Navigation */}
        <nav className={`fixed top-0 left-0 right-0 z-[100] px-6 py-4 transition-transform duration-500 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl rounded-full px-8 py-4 flex justify-between items-center border border-white/20 shadow-[0_8px_32px_0_rgba(15,23,42,0.08)]">
            
            {/* Branding */}
            <Link to="/" className="group flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none text-slate-900">
                Shop<span className="text-slate-400">stetics</span>
              </span>
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1 group-hover:scale-150 transition-transform duration-300"></div>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-10">
              <div className="hidden md:flex items-center gap-8 border-r border-slate-100 pr-8 mr-2">
                <Link to="/" className="relative text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 group">
                  Shop
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/blog" className="relative text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 group">
                  Editorial
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                
                {user && (
                  <Link to="/cart" className="relative flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 group">
                    Baggage
                    {cartCount > 0 ? (
                      <span className="bg-slate-900 text-white text-[8px] w-5 h-5 flex items-center justify-center rounded-full font-black animate-in fade-in zoom-in duration-300">
                        {cartCount}
                      </span>
                    ) : (
                      <span className="text-slate-300">0</span>
                    )}
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-600 hover:text-amber-700 transition-colors">
                    Command
                  </Link>
                )}

                {user ? (
                  <button 
                    onClick={logout} 
                    className="group flex items-center gap-3 bg-slate-900 text-white pl-5 pr-2 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    Logout
                    <div className="bg-white/10 w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                    </div>
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    className="bg-slate-900 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    Join
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <div className="h-0 md:h-4"></div>

        <main>
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