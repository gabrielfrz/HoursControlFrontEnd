import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import LoginAdm from './pages/LoginAdm';
import DashboardEstagiario from './pages/DashboardEstagiario';
import DashboardAdm from './pages/DashboardAdm';
import Admin from './pages/Admin';
import Register from './pages/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-adm" element={<LoginAdm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard-estagiario" element={<DashboardEstagiario />} />
        <Route path="/dashboard-adm" element={<DashboardAdm />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
