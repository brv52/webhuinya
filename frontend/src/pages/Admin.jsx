import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../api';

export default function Admin() {
  const { user, products, setProducts } = useContext(AppContext);
  const [usersList, setUsersList] = useState([]);
  const [blogList, setBlogList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [formData, setFormData] = useState({ name: '', price: '', description: '', category_id: '', image_url: '' });
  const [editingId, setEditingId] = useState(null);

  const [blogData, setBlogData] = useState({ title: '', content: '' });

  useEffect(() => {
    if (user?.role === 'admin') {
      api.apiGetUsers().then(setUsersList);
      api.apiGetBlogs().then(setBlogList);
      api.apiGetCategories().then(setCategories);
    }
  }, [user]);

  const refreshProducts = async () => setProducts(await api.apiGetProducts());
  const refreshBlogs = async () => setBlogList(await api.apiGetBlogs());

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await api.apiEditProduct(editingId, formData);
    else await api.apiAddProduct(formData);
    setEditingId(null);
    setFormData({ name: '', price: '', description: '', category_id: '', image_url: '' });
    refreshProducts();
  };

  const handleRoleChange = async (userId, newRole) => {
    await api.apiUpdateUserRole(userId, newRole);
    setUsersList(await api.apiGetUsers());
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    await api.apiAddBlog(blogData.title, blogData.content);
    setBlogData({ title: '', content: '' });
    refreshBlogs();
  };

  const handleDeleteBlog = async (id) => {
    if(confirm("Discard this editorial entry permanently?")) {
        await api.apiDeleteBlog(id);
        refreshBlogs();
    }
  };

  if (user?.role !== 'admin') return <p className="text-center font-black uppercase text-red-500 py-20 tracking-widest">Access Denied</p>;

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      <div className="max-w-6xl mx-auto py-16 px-6">
        <header className="mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">System</span>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900">Admin Panel</h2>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-12 border-b border-slate-200">
          {['inventory', 'users', 'editorial'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`text-[10px] font-bold uppercase tracking-widest pb-4 transition-all relative ${
                activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></div>}
            </button>
          ))}
        </div>

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <form onSubmit={handleProductSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-50 space-y-6 sticky top-32">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{editingId ? 'Modify' : 'New'} Item</h3>
                <input required placeholder="Item Name" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition text-sm font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="number" placeholder="Price" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition text-sm font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <select required className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition text-xs font-bold uppercase tracking-widest" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input placeholder="Image URL Link" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition text-sm font-bold" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                <textarea placeholder="Description" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition h-32 text-sm font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition">Save to Records</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl flex justify-between items-center shadow-sm border border-slate-50 hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <img src={p.image_url} className="w-16 h-16 rounded-xl object-cover bg-slate-100 shadow-sm" alt={p.name} />
                    <div>
                      <h4 className="font-black uppercase text-sm tracking-tight text-slate-900">{p.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${p.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => {setEditingId(p.id); setFormData(p)}} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Edit</button>
                    <button onClick={async () => { if(confirm("Discard item?")) { await api.apiDeleteProduct(p.id); refreshProducts(); }}} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-50">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Access Level</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-8">
                      <div className="flex flex-col">
                        <span className="font-black uppercase tracking-tight text-slate-900">{u.username}</span>
                        <span className="text-xs text-slate-400 font-medium">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                    </td>
                    <td className="p-8 text-right">
                      {u.id !== user.id && (
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-white border-2 border-slate-100 rounded-xl p-2 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-slate-900 transition">
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

        {/* EDITORIAL (BLOGS) TAB  */}
        {activeTab === 'editorial' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <form onSubmit={handleBlogSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-50 space-y-6 sticky top-32">
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">New Entry</h3>
                <input required placeholder="Journal Title" className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition text-sm font-bold" value={blogData.title} onChange={e => setBlogData({...blogData, title: e.target.value})} />
                <textarea required placeholder="Write editorial content..." className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-slate-900 transition h-64 text-sm font-medium leading-relaxed" value={blogData.content} onChange={e => setBlogData({...blogData, content: e.target.value})} />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition">Publish Journal</button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {blogList.map(blog => (
                <div key={blog.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Issue #{blog.id}</span>
                    <button onClick={() => handleDeleteBlog(blog.id)} className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition">Discard</button>
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4 leading-none">{blog.title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed mb-6">{blog.content}</p>
                  <div className="flex gap-6 items-center border-t border-slate-50 pt-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{blog.likes}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Appreciations</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{blog.comments.length}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Responses</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}