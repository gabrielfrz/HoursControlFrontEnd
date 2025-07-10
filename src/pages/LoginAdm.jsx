import './LoginAdm.css';
import { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginAdm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', { email, password });
      if (res.data.user.role !== 'adm') {
        toast.error('Você não é técnico (ADM)!');
        return;
      }
      localStorage.setItem('token', res.data.token);
      toast.success('Login realizado!');
      navigate('/admin');
    } catch (err) {
      toast.error('Erro ao logar');
    }
  };

  return (
    <div className="admin-login-container">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <h2>Login Técnico (ADM)</h2>
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <button type="submit">Entrar</button>
        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          Voltar ao menu
        </button>
      </form>
    </div>
  );
}
