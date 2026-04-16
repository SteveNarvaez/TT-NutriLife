import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', 
    fecha_nacimiento: '', sexo: 'Otro', // Campos obligatorios
    padece_enfermedad: false, enfermedades_declaradas: '', 
    apto_alto_impacto: true, acepto_disclaimer: false
  });
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:3000/api/auth/register', formData);
    alert("¡Cuenta creada! Ahora inicia sesión.");
    navigate('/login');
  } catch (err) {
    // Si el servidor responde con un error 500 o 400
    const mensaje = err.response?.data?.error || "Error de conexión";
    if (mensaje.includes("usuarios_email_key")) {
      alert("Este correo ya está registrado. ¡Mejor inicia sesión! 😉");
    } else {
      alert(mensaje);
    }
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-green-600 mb-6 text-center">Únete a NutriLife 🍏</h2>
        
        <div className="space-y-4">
          <input type="text" placeholder="Nombre completo" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400" 
            onChange={e => setFormData({...formData, nombre: e.target.value})} required />
          
          <input type="email" placeholder="Correo electrónico" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400" 
            onChange={e => setFormData({...formData, email: e.target.value})} required />
          
          <input type="password" placeholder="Contraseña" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400" 
            onChange={e => setFormData({...formData, password: e.target.value})} required />

          <div className="flex gap-4">
            <input type="date" className="w-1/2 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400" 
              onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} required />
            
            <select className="w-1/2 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-400"
              onChange={e => setFormData({...formData, sexo: e.target.value})}>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
          <h3 className="font-bold text-yellow-800 mb-2">Triaje de Salud</h3>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" onChange={e => setFormData({...formData, padece_enfermedad: e.target.checked})} />
            <span className="text-sm text-gray-700">¿Padeces alguna enfermedad?</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" required onChange={e => setFormData({...formData, acepto_disclaimer: e.target.checked})} />
            <span className="text-sm text-gray-700 font-medium">Acepto términos y condiciones médicos.</span>
          </label>
        </div>

        <button type="submit" disabled={!formData.acepto_disclaimer} className="w-full mt-6 bg-green-500 text-white p-3 rounded-lg font-bold hover:bg-green-600 transition shadow-lg disabled:bg-gray-300">
          Crear mi cuenta
        </button>

        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-green-600 font-bold hover:underline">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;