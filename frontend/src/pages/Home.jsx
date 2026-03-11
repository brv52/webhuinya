import { useContext, useState, useRef, useMemo } from 'react';
import { AppContext } from '../context/AppContext';

const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="aspect-[4/5] bg-slate-200 rounded-2xl mb-6"></div>
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
    </div>
);

export default function Home() {
    const { products, addToCart } = useContext(AppContext);
    const [toastMessage, setToastMessage] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [visibleItems, setVisibleItems] = useState(8);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const inventoryRef = useRef(null);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || p.category_name === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, activeCategory]);

    const categories = ['All', ...new Set(products.map(p => p.category_name))].filter(Boolean);

    const scrollToInventory = () => {
        inventoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddToCart = (product, e) => {
        if (e) e.stopPropagation();
        addToCart(product);
        setToastMessage(`${product.name} added to cart!`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setTimeout(() => setModalVisible(true), 10);
    };

    const closeModal = () => {
        setIsAnimatingOut(true);
        setModalVisible(false);
        setTimeout(() => {
            setSelectedProduct(null);
            setIsAnimatingOut(false);
        }, 300);
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen pb-16 relative">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white rounded-b-[3rem] px-8 py-24 mb-20 shadow-2xl mx-4 max-w-7xl md:mx-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 pr-8">
                        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-6 leading-[0.85]">
                            SHOP <br /> <span className="text-slate-400">STETICS</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 max-w-sm font-medium leading-relaxed">Editorial baggage for the modern pioneer.</p>
                        <button onClick={scrollToInventory} className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition shadow-xl">
                            Explore Collection
                        </button>
                    </div>
                    <div className="md:w-1/2 mt-12 md:mt-0 relative group">
                        {products.length > 0 ? (
                            <img src={products[0].image_url} alt="Hero" className="w-full max-w-md mx-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full max-w-md h-[500px] bg-slate-800 animate-pulse rounded-2xl mx-auto"></div>
                        )}
                    </div>
                </div>
            </section>

            {/* FILTER & SEARCH BAR */}
            <section ref={inventoryRef} className="max-w-7xl mx-auto px-6 mb-12 scroll-mt-20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    {/* Search Input */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search the archives..."
                            className="w-full bg-slate-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>

                    {/* Category Menu */}
                    <div className="relative w-full md:w-64">
                        {/* Dropdown Trigger */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex justify-between items-center bg-white border border-slate-100 px-6 py-4 rounded-full shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Category</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                                    {activeCategory}
                                </span>
                            </div>

                            {/* Animated Arrow Icon */}
                            <div className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>

                        {/* Dropdown Menu (Floating Card) */}
                        {isDropdownOpen && (
                            <>
                                {/* Click-away backdrop */}
                                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>

                                <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="py-4">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setActiveCategory(cat);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors flex items-center justify-between ${activeCategory === cat
                                                        ? 'bg-slate-900 text-white'
                                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                            >
                                                {cat}
                                                {activeCategory === cat && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* If products are still loading from API */}
                    {products.length === 0 ? (
                        [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                    ) : (
                        filteredProducts.slice(0, visibleItems).map(p => (
                            <div key={p.id} onClick={() => openModal(p)} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                    <img
                                        src={p.image_url}
                                        alt={p.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <button onClick={(e) => handleAddToCart(p, e)} className="w-full bg-white text-slate-900 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            Quick Add
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{p.name}</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-2">{p.category_name || 'Limited Edition'}</p>
                                <span className="text-xl font-black text-slate-900">${p.price}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && products.length > 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-2xl font-black uppercase text-slate-300">No items found matching your criteria</h3>
                    </div>
                )}

                {/* LOAD MORE BUTTON (Pagination) */}
                {visibleItems < filteredProducts.length && (
                    <div className="flex justify-center mt-20">
                        <button
                            onClick={() => setVisibleItems(prev => prev + 8)}
                            className="px-12 py-4 border-2 border-slate-900 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                        >
                            Load More Items
                        </button>
                    </div>
                )}
            </section>

            {/* Quick View Modal */}
            {(selectedProduct || isAnimatingOut) && (
                <div className={`fixed inset-0 z-[60] flex items-center justify-center p-6 transition-opacity duration-300 ${modalVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className={`relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-300 ${modalVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
                        <button onClick={closeModal} className="absolute top-8 right-8 z-10 bg-white w-12 h-12 rounded-full border shadow-sm hover:bg-slate-50 transition-colors uppercase font-black text-xs tracking-tighter">✕</button>
                        <div className="w-full md:w-3/5 bg-gray-50 p-12 flex items-center justify-center">
                            <img src={selectedProduct?.image_url} className="w-full h-auto object-cover rounded-2xl shadow-2xl max-h-[60vh]" />
                        </div>
                        <div className="w-full md:w-2/5 p-12 md:p-16 flex flex-col justify-center">
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Edition No. {selectedProduct?.id}</span>
                            <h2 className="text-4xl font-black uppercase text-slate-900 tracking-tighter leading-none mb-6">{selectedProduct?.name}</h2>
                            <p className="text-slate-500 mb-10 leading-relaxed font-medium text-lg">{selectedProduct?.description}</p>
                            <button onClick={(e) => handleAddToCart(selectedProduct, e)} className="w-full bg-slate-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-colors">
                                Add to Cart — ${selectedProduct?.price}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5 border border-slate-800 animate-bounce-in">
                    <div className="bg-green-500 rounded-full p-1.5 shadow-inner">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="font-bold text-xs uppercase tracking-widest">{toastMessage}</p>
                </div>
            )}
        </div>
    );
}

