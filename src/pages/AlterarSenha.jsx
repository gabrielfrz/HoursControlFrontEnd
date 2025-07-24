import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';
import './AlterarSenha.css';

export default function AlterarSenha() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(
        '/update-password', // ✅ rota corrigida
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Senha atualizada com sucesso!");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao atualizar senha.");
    }
  };

  return (
    <div className="senha-container">
      <div className="senha-card">
        <h2>Alterar Senha</h2>

        <div className="senha-input-group">
          <label>Senha Atual:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="senha-input-group">
          <label>Nova Senha:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="senha-input-group">
          <label>Confirmar Nova Senha:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="senha-save-btn" onClick={handleSave}>
          Salvar Nova Senha
        </button>
      </div>
    </div>
  );
}
