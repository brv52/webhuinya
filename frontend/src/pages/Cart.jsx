import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, checkout, user } = useContext(AppContext);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [loadingText, setLoadingText] = useState('');
  const navigate = useNavigate();

  if (!user) return <div className="text-center py-40 font-black uppercase tracking-widest">Identify to view baggage</div>;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    setPaymentStatus('processing');
    setLoadingText('Securing connection...');
    await new Promise(r => setTimeout(r, 1200));
    setLoadingText('Verifying assets...');
    await new Promise(r => setTimeout(r, 1500));
    await checkout();
    setPaymentStatus('success');
    setTimeout(() => { setPaymentStatus('idle'); navigate('/'); }, 3000);
  };

  if (cart.length === 0 && paymentStatus === 'idle') {
    return (
      <div className="max-w-xl mx-auto py-40 text-center">
        <h2 className="text-5xl font-black uppercase tracking-tighter mb-8">Empty Payload</h2>
        <Link to="/" className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs">Return to shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 relative">
      <h2 className="text-6xl font-black uppercase tracking-tighter mb-16">The Manifest</h2>
      <div className="space-y-12 mb-16">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-12 group">
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">{item.name}</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">${item.price} Unit Value</p>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex items-center bg-slate-100 rounded-full p-1 shadow-inner">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 transition">-</button>
                <span className="w-10 text-center font-black text-xs">{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 transition">+</button>
              </div>
              <p className="font-black text-xl text-slate-900 w-24 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition font-black text-xs uppercase tracking-tighter ml-4 opacity-0 group-hover:opacity-100">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-50 gap-8">
        <div>
          <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] block mb-2">Total manifest value</span>
          <span className="text-5xl font-black text-slate-900 tracking-tighter">${total.toFixed(2)}</span>
        </div>
        <button onClick={handleCheckout} disabled={paymentStatus !== 'idle'} className="bg-slate-900 text-white px-16 py-6 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 shadow-2xl transition disabled:opacity-50">Secure Transaction</button>
      </div>

      {paymentStatus !== 'idle' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="bg-white p-16 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
            {paymentStatus === 'processing' ? (
              <>
                <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mb-8 shadow-inner"></div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">Processing</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] animate-pulse">{loadingText}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">Authenticated</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Manifest archived. Redirecting...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}