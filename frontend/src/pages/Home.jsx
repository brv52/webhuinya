import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function Home() {
  const { products, addToCart } = useContext(AppContext);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(p => (
        <div key={p.id} className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold">{p.name}</h2>
          <p className="text-gray-600 mb-4">{p.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-blue-600">${p.price}</span>
            <button onClick={() => addToCart(p)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}