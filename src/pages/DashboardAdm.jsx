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

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Técnico (ADM)</h2>
      <button className="add-btn">Adicionar Estagiário</button>

      <h3>Lista de Estagiários</h3>
      {users.map((user) => (
        <div className="user-card" key={user.id}>
          <p><strong>{user.name}</strong> ({user.email}) - estagiario</p>

          <div className="action-btns">
            <button className="edit-btn">Editar</button>
            <button className="delete-btn">Excluir</button>
          </div>
        </div>
      ))}
    </div>
  );
}
