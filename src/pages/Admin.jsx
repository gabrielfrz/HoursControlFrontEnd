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
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name,
          email,
          password,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Estagiário atualizado!');
      } else {
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
    setShowForm(false);
    setEditingUser(null);
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
      toast.error('Erro ao excluir');
    }
  };

  const handlePhotoChange = async (e, userId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`/users/upload-photo/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Foto atualizada!');
      loadUsers();
    } catch (err) {
      toast.error('Erro ao enviar foto');
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
          />
          <input
            type="password"
            placeholder={editingUser ? "Nova senha (opcional)" : "Senha"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingUser}
/>
          <button type="submit">{editingUser ? 'Atualizar' : 'Cadastrar'}</button>
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancelar
          </button>
        </form>
      )}

      <h3>Lista de Estagiários</h3>
      {users.filter(u => u.role === 'estagiario').map((u) => (
        <div className={`user-card ${editingUser?.id === u.id ? 'edit-mode' : ''}`} key={u.id}>
          <img
            src={u.photoUrl || 'https://via.placeholder.com/80'}
            alt="Foto"
            className="user-photo"
          />
          <p><strong>{u.name}</strong> ({u.email}) - estagiario</p>

          {editingUser?.id === u.id && (
  <label className="upload-btn">
    Enviar Foto
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => handlePhotoChange(e, u.id)}
    />
  </label>
)}


          <div className="action-btns">
            <button className="edit-btn" onClick={() => handleEdit(u)}>Editar</button>
            <button className="delete-btn" onClick={() => handleDelete(u.id)}>Excluir</button>
</div>

        </div>
      ))}
    </div>
  );
}
