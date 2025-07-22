import React, { useEffect, useState } from 'react';
import api from '../api';
import './DashboardAdm.css';
import { toast } from 'react-toastify';

export default function DashboardAdm() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao buscar usuários';
        toast.error(msg);
      }
    };

    fetchUsers();
  }, []);

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
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, photoUrl: res.data.photoUrl } : user
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar foto');
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Técnico (ADM)</h2>
      <button className="add-btn">Adicionar Estagiário</button>

      <h3>Lista de Estagiários</h3>
      {users.map((user) => (
        <div className="user-card" key={user.id}>
          <img
            src={user.photoUrl || 'https://via.placeholder.com/80'}
            alt="Foto"
            className="user-photo"
          />
          <p><strong>{user.name}</strong> ({user.email}) - estagiario</p>
          <label className="upload-btn">
            Enviar Foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handlePhotoChange(e, user.id)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
