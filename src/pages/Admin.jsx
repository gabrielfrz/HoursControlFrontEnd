import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Erro ao carregar usuários');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/users/register', {
        name,
        email,
        password,
        role: 'estagiario',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Estagiário adicionado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao cadastrar estagiário');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Técnico (ADM)</h2>

      <form onSubmit={handleRegister} className="admin-form">
        <h3>Adicionar Estagiário</h3>
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>

      <h3>Lista de Usuários</h3>
      {users.map((u) => (
        <div key={u.id}>
          <strong>{u.name}</strong> ({u.email}) - {u.role}
          <p>{u.type ? `Último ponto: ${u.type} em ${new Date(u.timestamp).toLocaleString()}` : 'Nenhum ponto registrado'}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}
