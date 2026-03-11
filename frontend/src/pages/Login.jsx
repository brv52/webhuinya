import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { apiLogin } from '../mockApi';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await apiLogin(username, password);
      setUser(userData);
      navigate('/');
    } catch (err) {
      alert("Login failed. Try user/user or admin/admin");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        <input type="text" placeholder="Username" className="border p-2" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" className="border p-2" onChange={e => setPassword(e.target.value)} />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}