import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function Home() {
  const { products, addToCart } = useContext(AppContext);
  const [toastMessage, setToastMessage] = useState(null);
  
  // States to handle the animated modal opening sequence
  const [selectedProduct, setSelectedProduct] = useState(null); // Holds data
  const [modalVisible, setModalVisible] = useState(false);     // Triggers animation
  const [isAnimatingOut, setIsAnimatingOut] = useState(false); // Handles closing

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation(); 
    addToCart(product);
    setToastMessage(`${product.name} added to your cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- ANIMATED OPENING SEQUENCE ---
  const openModal = (product) => {
    // 1. Mount the component structure first (invisible)
    setSelectedProduct(product);
    
    // 2. Microscopic delay just to let the DOM render before triggering the CSS transition
    setTimeout(() => {
      setModalVisible(true);
    }, 10); 
  };

  // --- ANIMATED CLOSING SEQUENCE ---
  const closeModal = () => {
    setIsAnimatingOut(true); // Hint for the animation wrapper
    setModalVisible(false); // Trigger the Tailwind transition OUT

    // Wait for the CSS transition to finish (matches duration-300 below)
    setTimeout(() => {
      setSelectedProduct(null); // Unmount the data
      setIsAnimatingOut(false);
    }, 300); 
  };

  // Close modal if user presses Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-16 relative">
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white rounded-b-[3rem] overflow-hidden relative px-8 py-20 mb-16 shadow-2xl mx-4 sm:mx-8 md:mx-auto max-w-7xl mt-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center relative z-10">
          <div className="md:w-1/2 pr-8 z-10">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">
              Carry <br/> <span className="text-slate-400">Your</span> <br/> World.
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-md">
              Discover a premium bag collection that combines elegant design, maximum comfort, and extraordinary durability.
            </p>
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-slate-200 transition-colors duration-300 flex items-center gap-2 shadow-lg">
              Shop Now <span className="text-xl">→</span>
            </button>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 relative group cursor-pointer">
             <div className="absolute inset-0 bg-slate-700/50 rounded-full blur-3xl transform group-hover:scale-110 transition-transform duration-700"></div>
             {products.length > 0 && (
                <img 
                  src={products[0].image} 
                  alt="Featured Bag" 
                  className="relative z-10 w-full max-w-md mx-auto rounded-2xl shadow-2xl transform group-hover:-translate-y-4 group-hover:scale-105 transition-all duration-500 object-cover aspect-[4/5]"
                />
             )}
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
            All Products Available
          </h2>
          <p className="text-slate-500 max-w-2xl">
            We produce limited quantities to ensure the highest quality. Find the perfect companion for your everyday adventure.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div 
              key={p.id} 
              onClick={() => openModal(p)} // Call the new openModal function
              className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
            >
              
              <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 rounded-xl"
                />
                
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <button 
                    onClick={(e) => handleAddToCart(p, e)} 
                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:bg-slate-700"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{p.name}</h3>
                
                <div className="flex gap-1.5 mb-4">
                  <span className="w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-sm"></span>
                  <span className="w-4 h-4 rounded-full bg-amber-700 border-2 border-white shadow-sm"></span>
                  <span className="w-4 h-4 rounded-full bg-stone-400 border-2 border-white shadow-sm"></span>
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <span className="font-black text-xl text-slate-900">${p.price}</span>
                  {p.originalPrice && (
                    <span className="text-sm font-semibold text-slate-400 line-through">${p.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- REWRITTEN ANIMATED MODAL OVERLAY --- */}
      {(selectedProduct || isAnimatingOut) && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden transition-opacity duration-300 ease-out ${modalVisible ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Backdrop (Fades independently) */}
          <div 
            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${modalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeModal}
          ></div>
          
          {/* Modal Content - Slidess and Scales in smoothly */}
          <div 
            className={`relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transform transition-all duration-300 ease-out 
              ${modalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-95 opacity-0'}`
            }
          >
            
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur text-slate-900 w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-900 hover:text-white transition-colors border border-gray-200 shadow-md"
            >
              ✕
            </button>

            {/* Left side: Large Image */}
            <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-8 aspect-square md:aspect-auto">
              <img 
                src={selectedProduct?.image} 
                alt={selectedProduct?.name} 
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </div>

            {/* Right side: Product Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">
                {selectedProduct?.name}
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-slate-900">${selectedProduct?.price}</span>
                {selectedProduct?.originalPrice && (
                  <span className="text-lg text-slate-400 line-through">${selectedProduct?.originalPrice}</span>
                )}
              </div>

              <div className="w-full h-px bg-gray-200 mb-6"></div>

              <p className="text-slate-600 mb-6 text-lg leading-relaxed">
                {selectedProduct?.description} 
                <br/><br/>
                Crafted with premium materials for maximum durability. Designed for those who are active, confident, and appreciate practical design without sacrificing style. Features multiple compartments, water-resistant exterior, and ergonomic strap support.
              </p>

              <div className="mb-8">
                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-3">Select Color</h4>
                <div className="flex gap-3">
                  <button className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 shadow-sm ring-2 ring-transparent hover:ring-slate-300 focus:ring-slate-900 transition-all"></button>
                  <button className="w-8 h-8 rounded-full bg-amber-700 border-2 border-white shadow-sm ring-2 ring-transparent hover:ring-slate-300 focus:ring-amber-700 transition-all"></button>
                  <button className="w-8 h-8 rounded-full bg-stone-400 border-2 border-white shadow-sm ring-2 ring-transparent hover:ring-slate-300 focus:ring-stone-400 transition-all"></button>
                </div>
              </div>

              <button 
                onClick={(e) => handleAddToCart(selectedProduct, e)} 
                className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl"
              >
                Add to Cart — ${selectedProduct?.price}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      <div 
        className={`fixed bottom-8 right-8 z-[100] transform transition-all duration-500 ease-in-out ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700">
          <div className="bg-green-500 rounded-full p-1">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="font-bold text-sm tracking-wide">{toastMessage}</p>
        </div>
      </div>

    </div>
  );
}