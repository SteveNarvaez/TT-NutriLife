import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthShell from '../components/AuthShell';
import Notice from '../components/Notice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', { 
          email, 
          password 
        });

        // GUARDADO DINÁMICO (Limpio y sin errores)
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.user.nombre);
        
        console.log("✅ Login exitoso. ID guardado:", response.data.userId);
        
        navigate('/dashboard'); 

      } catch (err) {
        console.error("❌ Error capturado:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Error al iniciar sesión");
        setLoading(false);
      }
    };

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-pine-900">Inicia sesión</h2>
        <p className="mt-2 text-ink-soft">Entra para ver tu plan de hoy y tu progreso.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
        {error && <Notice tone="error">{error}</Notice>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Correo electrónico</label>
          <input 
            id="email"
            type="email" 
            autoComplete="email"
            className="field" 
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
          <input 
            id="password"
            type="password" 
            autoComplete="current-password"
            className="field" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/" className="font-semibold text-pine-700 hover:text-pine-900 underline underline-offset-4 decoration-leaf-400/60">Crear cuenta</Link>
      </p>
    </AuthShell>
  );
};

export default Login;
