import './Home.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <img src={logo} alt="Fábrica Modelo" className="home-logo" />
      <h1 className="home-title">Bem-vindo ao Controle de Horas</h1>
      <div className="home-buttons">
        <button className="home-button" onClick={() => navigate('/login')}>
          Sou Estagiário
        </button>
        <button className="home-button" onClick={() => navigate('/login-adm')}>
          Sou Técnico (ADM)
        </button>
      </div>
      <button
        className="home-button register-button"
        onClick={() => navigate('/register')}
      >
        Criar conta
      </button>
    </div>
  );
}
