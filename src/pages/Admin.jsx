import { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  const handleRegisterOrEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingUser) {
        // Atualizar nome e, se fornecida, nova senha
        const updatedData = { name };
        if (password.trim() !== '') {
          updatedData.password = password;
        }

        await api.put(`/users/${editingUser.id}`, updatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Estagiário atualizado!');
      } else {
        // Novo cadastro
        await api.post('/register', {
          name,
          email,
          password,
          role: 'estagiario',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success('Estagiário adicionado!');
      }

      resetForm();
      loadUsers();
    } catch (err) {
      toast.error('Erro ao salvar estagiário');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword('');
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Estagiário excluído');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao excluir estagiário');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Técnico (ADM)</h2>

      {!showForm && (
        <button className="add-btn" onClick={() => setShowForm(true)}>
          Adicionar Estagiário
        </button>
      )}

      {showForm && (
        <form onSubmit={handleRegisterOrEdit} className="admin-form">
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
            disabled={editingUser !== null}
          />
          <input
            type="password"
            placeholder={editingUser ? 'Nova senha (opcional)' : 'Senha'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
          />
          <button type="submit">
            {editingUser ? 'Atualizar' : 'Cadastrar'}
          </button>
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancelar
          </button>
        </form>
      )}

      <h3>Lista de Estagiários</h3>
      {users.filter((u) => u.role === 'estagiario').map((u) => (
        <div
          className={`user-card ${editingUser?.id === u.id ? 'edit-mode' : ''}`}
          key={u.id}
        >
          <p>
            <strong>{u.name}</strong> ({u.email}) - estagiario
          </p>
          <div className="action-btns">
            <button className="edit-btn" onClick={() => handleEdit(u)}>
              Editar
            </button>
            <button className="delete-btn" onClick={() => handleDelete(u.id)}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
