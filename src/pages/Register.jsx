import './Login.css';
import './Register.css';
import { useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('estagiario');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', { name, email, password, role });
      toast.success('Usuário registrado com sucesso!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao registrar');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2>Registrar</h2>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-wrapper">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="estagiario">Estagiário</option>
            <option value="adm">Admin</option>
          </select>
        </div>
        <button type="submit">Registrar</button>
        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          Voltar ao menu
        </button>
      </form>
    </div>
  );
}
