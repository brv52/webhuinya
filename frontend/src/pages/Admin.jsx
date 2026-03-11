// src/pages/Admin.jsx
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { apiDeleteProduct, apiGetProducts, apiAddProduct, apiEditProduct, apiGetUsers, apiUpdateUserRole } from '../mockApi';

export default function Admin() {
  const { user, products, setProducts } = useContext(AppContext);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'users'
  
  // Product Form State
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      apiGetUsers().then(setUsersList);
    }
  }, [user]);

  if (user?.role !== 'admin') return <p className="text-center text-red-500 mt-10 font-bold text-xl">Access Denied. Admins only.</p>;

  // --- Product Handlers ---
  const refreshProducts = async () => setProducts(await apiGetProducts());
  
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await apiEditProduct(editingId, formData);
    else await apiAddProduct(formData);
    
    setEditingId(null);
    setFormData({ name: '', price: '', description: '' });
    refreshProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, price: product.price, description: product.description });
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this product?")) {
      await apiDeleteProduct(id);
      refreshProducts();
    }
  };

  // --- User Handlers ---
  const handleRoleChange = async (userId, newRole) => {
    await apiUpdateUserRole(userId, newRole);
    setUsersList(await apiGetUsers());
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button onClick={() => setActiveTab('products')} className={`font-bold px-4 py-2 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Products</button>
        <button onClick={() => setActiveTab('users')} className={`font-bold px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Users & Roles</button>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="bg-white p-6 rounded shadow mb-8 border-t-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} className="flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Product Name" className="border p-2 rounded" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="number" step="0.01" placeholder="Price" className="border p-2 rounded" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <textarea required placeholder="Description" className="border p-2 rounded" rows="2"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="flex space-x-4">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold">{editingId ? 'Save Changes' : 'Add Product'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({name:'', price:'', description:''}) }} className="bg-gray-400 text-white px-6 py-2 rounded">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="bg-white rounded shadow p-4">
            {products.map(p => (
              <div key={p.id} className="flex justify-between border-b p-4 items-center">
                <div>
                  <span className="font-semibold block">{p.name} - ${Number(p.price).toFixed(2)}</span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-400 px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{u.id}</td>
                  <td className="p-4 font-semibold">{u.username}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.id !== user.id && ( // Prevent admin from demoting themselves
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border p-1 rounded bg-white text-sm cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}