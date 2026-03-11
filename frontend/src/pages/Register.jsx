// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../mockApi';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await apiRegister(formData.username, formData.email, formData.password);
      alert("Registration successful! Please log in.");
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Register Account</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="flex flex-col space-y-4">
        <input required type="text" placeholder="Username" className="border p-2 rounded" 
          onChange={e => setFormData({...formData, username: e.target.value})} />
        <input required type="email" placeholder="Email" className="border p-2 rounded" 
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input required type="password" placeholder="Password" className="border p-2 rounded" 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700 font-bold">Register</button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-600 underline">Log in</Link>
      </p>
    </div>
  );
}