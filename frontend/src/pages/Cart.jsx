// src/pages/Cart.jsx
import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, updateCartQuantity, removeFromCart, checkout, user } = useContext(AppContext);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success
  const [loadingText, setLoadingText] = useState('');
  const navigate = useNavigate();

  if (!user) return <p className="text-center mt-10 text-lg">Please <Link to="/login" className="text-blue-600 underline">log in</Link> to view your cart.</p>;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleMockCheckout = async () => {
    setPaymentStatus('processing');
    
    // Step 1: Initialize
    setLoadingText('Securing connection to payment gateway...');
    await new Promise(r => setTimeout(r, 1200));
    
    // Step 2: Processing
    setLoadingText('Processing mock credit card payment...');
    await new Promise(r => setTimeout(r, 1500));
    
    // Step 3: Verifying
    setLoadingText('Verifying transaction...');
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 4: Success & Cleanup
    await checkout(); // Calls your mock API to clear the cart
    setPaymentStatus('success');
    
    // Step 5: Redirect after showing success message
    setTimeout(() => {
      setPaymentStatus('idle');
      navigate('/');
    }, 3000);
  };

  if (cart.length === 0 && paymentStatus === 'idle') {
    return <p className="text-center mt-10 text-lg">Your cart is empty. <Link to="/" className="text-blue-600 underline">Go shopping!</Link></p>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow relative">
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">Your Shopping Cart</h2>
      
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-500">${Number(item.price).toFixed(2)} each</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                <span className="px-4 font-medium">{item.quantity}</span>
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
              </div>
              <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-semibold px-2">X</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-between items-center bg-gray-50 p-4 rounded">
        <span className="text-xl font-bold">Total:</span>
        <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleMockCheckout} 
          disabled={paymentStatus !== 'idle'}
          className="bg-green-500 text-white px-8 py-3 rounded text-lg font-bold hover:bg-green-600 transition shadow disabled:opacity-50"
        >
          Checkout Now
        </button>
      </div>

      {/* --- MOCK PAYMENT MODAL OVERLAY --- */}
      {paymentStatus !== 'idle' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-xl shadow-2xl flex flex-col items-center max-w-sm w-full transform transition-all">
            
            {paymentStatus === 'processing' ? (
              <>
                {/* CSS Spinner */}
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                <p className="text-gray-500 text-center animate-pulse">{loadingText}</p>
              </>
            ) : (
              <>
                {/* Success Checkmark */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-500 text-center">Thank you for your order. Redirecting to home...</p>
              </>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}