import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthShell from '../components/AuthShell';
import Notice from '../components/Notice';
import { IconShield } from '../components/Icons';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', 
    fecha_nacimiento: '', sexo: 'Otro', // Campos obligatorios
    padece_enfermedad: false, enfermedades_declaradas: '', 
    apto_alto_impacto: true, acepto_disclaimer: false
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await axios.post('http://localhost:3000/api/auth/register', formData);
    setExito(true);
    setTimeout(() => navigate('/login'), 1400);
  } catch (err) {
    // Si el servidor responde con un error 500 o 400
    const mensaje = err.response?.data?.error || "Error de conexión";
    if (mensaje.includes("usuarios_email_key")) {
      setError("Este correo ya está registrado. Inicia sesión para continuar.");
    } else {
      setError(mensaje);
    }
    setLoading(false);
  }
};
  return (
    <AuthShell maxWidth="max-w-lg">
      <div className="mb-7">
        <h2 className="font-display text-3xl font-semibold text-pine-900">Crea tu cuenta</h2>
        <p className="mt-2 text-ink-soft">Tarda un minuto. Con tus datos armamos un plan pensado para ti.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Notice tone="error">{error}</Notice>}
        {exito && (
          <Notice tone="success" title="Cuenta creada">
            Te llevamos a iniciar sesión.
          </Notice>
        )}

        <fieldset className="space-y-4">
          <legend className="sr-only">Tus datos</legend>

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-ink mb-1.5">Nombre completo</label>
            <input id="nombre" type="text" autoComplete="name" placeholder="Como quieres que te llamemos" className="field" 
              onChange={e => setFormData({...formData, nombre: e.target.value})} required />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-ink mb-1.5">Correo electrónico</label>
            <input id="reg-email" type="email" autoComplete="email" placeholder="tu@email.com" className="field" 
              onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
            <input id="reg-password" type="password" autoComplete="new-password" placeholder="Crea una contraseña" className="field" 
              onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nacimiento" className="block text-sm font-medium text-ink mb-1.5">Fecha de nacimiento</label>
              <input id="nacimiento" type="date" className="field" 
                onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} required />
            </div>

            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-ink mb-1.5">Sexo</label>
              <select id="sexo" className="field"
                onChange={e => setFormData({...formData, sexo: e.target.value})}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Triaje de salud */}
        <section className="rounded-2xl border border-line bg-paper p-5 shadow-panel">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-leaf-100 text-pine-700">
              <IconShield size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-pine-900 leading-tight">Triaje de salud</h3>
              <p className="text-sm text-ink-soft">Nos ayuda a cuidar tu seguridad desde el inicio.</p>
            </div>
          </div>

          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-[18px] h-[18px] accent-pine-700 shrink-0" onChange={e => setFormData({...formData, padece_enfermedad: e.target.checked})} />
            <span className="text-sm text-ink">¿Padeces alguna enfermedad?</span>
          </label>

          {formData.padece_enfermedad && (
            <Notice tone="warning" className="my-2">
              Ajustaremos tu plan y te sugeriremos consultar a un profesional de la salud antes de iniciar rutinas intensas.
            </Notice>
          )}

          <label className="flex items-start gap-3 py-2 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-[18px] h-[18px] accent-pine-700 shrink-0" required onChange={e => setFormData({...formData, acepto_disclaimer: e.target.checked})} />
            <span className="text-sm text-ink font-medium">Acepto términos y condiciones médicos.</span>
          </label>
        </section>

        <button type="submit" disabled={!formData.acepto_disclaimer || loading || exito} className="btn-primary w-full">
          {loading && !exito ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
        </button>

        <p className="text-center text-sm text-ink-soft">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-pine-700 hover:text-pine-900 underline underline-offset-4 decoration-leaf-400/60">Inicia sesión</Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
