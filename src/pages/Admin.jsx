import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/all', {
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
      await api.post('/register', {
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
      setShowForm(false);
      loadUsers();
    } catch (err) {
      toast.error('Erro ao cadastrar estagiário');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Técnico (ADM)</h2>

      {!showForm && (
        <button className="toggle-btn" onClick={() => setShowForm(true)}>
          Adicionar Estagiário
        </button>
      )}

      {showForm && (
        <form onSubmit={handleRegister} className="admin-form">
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
          <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
            Cancelar
          </button>
        </form>
      )}

      <h3>Lista de Estagiários</h3>
      {users
        .filter((u) => u.role === 'estagiario')
        .map((u) => (
          <div className="user-card" key={u.id}>
            <strong>{u.name}</strong> ({u.email}) - {u.role}
            <p>{u.type ? `Último ponto: ${u.type} em ${new Date(u.timestamp).toLocaleString()}` : 'Nenhum ponto registrado'}</p>
          </div>
        ))}
    </div>
  );
}
