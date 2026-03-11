import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      alert("Invalid credentials.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 mt-24">
      <h2 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tighter text-center">Welcome Back</h2>
      <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10 border-b pb-8">Identify to continue</p>
      
      <form onSubmit={handleLogin} className="flex flex-col space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Username</label>
          <input required type="text" className="w-full bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-2 ring-slate-900 outline-none transition" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Security Key</label>
          <input required type="password" className="w-full bg-slate-50 p-4 rounded-2xl focus:bg-white focus:ring-2 ring-slate-900 outline-none transition" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="bg-slate-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl transition-all active:scale-95">Enter Store</button>
      </form>
      <p className="mt-8 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
        New here? <Link to="/register" className="text-slate-900 underline">Register</Link>
      </p>
    </div>
  );
}