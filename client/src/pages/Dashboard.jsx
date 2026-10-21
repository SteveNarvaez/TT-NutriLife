import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Asistente from './Asistente'; 
import MisGraficas from './MisGraficas';
import PlanDiario from './PlanDiario';
import Brand from '../components/Brand';
import PulseLine from '../components/PulseLine';
import {
  IconHome, IconChat, IconChart, IconPlan, IconLogout,
  IconShield, IconFlame, IconBolt, IconArrowRight, IconCheck,
} from '../components/Icons';

const NAV = [
  { id: 'inicio',    label: 'Inicio',       icon: IconHome },
  { id: 'chat',      label: 'Asistente IA', icon: IconChat },
  { id: 'graficas',  label: 'Mis gráficas', icon: IconChart },
  { id: 'plan',      label: 'Plan diario',  icon: IconPlan },
];

const ATAJOS = [
  { id: 'plan',     icon: IconPlan,  titulo: 'Completar mi plan diario', texto: 'Marca el agua, las comidas y el ejercicio de hoy.' },
  { id: 'chat',     icon: IconChat,  titulo: 'Hablar con el asistente',  texto: 'Pide tu dieta personalizada o tu rutina.' },
  { id: 'graficas', icon: IconChart, titulo: 'Ver mis gráficas',         texto: 'Revisa la evolución de tu peso y tu constancia.' },
];

const Dashboard = () => {
  const [name, setName] = useState('');
  const [view, setView] = useState('inicio');
  const [userId, setUserId] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedId = localStorage.getItem('userId');
    if (!storedName) {
      navigate('/login');
    } else {
      setName(storedName);
      setUserId(storedId);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const inicial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="h-dvh w-screen bg-mist flex overflow-hidden">
      
      {/* Sidebar - Lado Izquierdo (escritorio) */}
      <aside className="relative w-64 xl:w-72 bg-pine-900 text-white hidden md:flex flex-col h-full flex-shrink-0">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(80% 40% at 0% 0%, rgb(47 158 107 / 0.18) 0%, transparent 70%)' }}
        />

        <div className="relative px-6 pt-7 pb-8">
          <Brand tone="light" />
        </div>
        
        <nav className="relative px-3 space-y-1 flex-1" aria-label="Navegación principal">
          {NAV.map(({ id, label, icon: Icon }) => {
            const activo = view === id;
            return (
              <button 
                key={id}
                onClick={() => setView(id)}
                aria-current={activo ? 'page' : undefined}
                className={`group relative flex items-center gap-3 w-full text-left font-medium px-3.5 py-2.5 rounded-lg transition-colors ${
                  activo ? 'bg-white/10 text-white' : 'text-leaf-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-leaf-400 transition-opacity ${
                    activo ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon size={19} className={activo ? 'text-leaf-400' : 'text-leaf-100/55 group-hover:text-leaf-200'} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="relative m-3 mt-auto rounded-xl bg-white/6 ring-1 ring-inset ring-white/10 p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-leaf-400/20 ring-1 ring-inset ring-leaf-400/40 grid place-items-center font-display font-semibold text-leaf-200 shrink-0">
              {inicial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{name || 'Usuario'}</p>
              <p className="text-xs text-leaf-100/60">Tu cuenta</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="mt-3 flex items-center gap-2 w-full text-sm text-leaf-100/70 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/8 transition-colors"
          >
            <IconLogout size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Columna derecha */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Barra superior (móvil) */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-paper border-b border-line shrink-0">
          <Brand />
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-2 text-sm text-ink-soft px-2 py-1.5 rounded-md hover:bg-leaf-50"
          >
            <span className="w-7 h-7 rounded-full bg-leaf-100 text-pine-800 grid place-items-center font-display font-semibold text-sm">{inicial}</span>
            <IconLogout size={17} />
          </button>
        </header>

        {/* Contenido Principal - Lado Derecho */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-mist">
          
          {/* 1️⃣ VISTA DE INICIO */}
          {view === 'inicio' && (
            <div key="inicio" className="flex-1 overflow-y-auto scroll-soft p-4 sm:p-6 md:p-10">
              <div className="max-w-5xl mx-auto space-y-6 stagger">

                {/* Bienvenida */}
                <section className="relative overflow-hidden rounded-3xl bg-pine-900 text-white px-6 pt-8 pb-32 sm:px-10 sm:pt-10 sm:pb-36 shadow-float">
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(60% 80% at 90% 0%, rgb(47 158 107 / 0.32) 0%, transparent 70%)' }}
                  />
                  <div className="relative max-w-xl">
                    <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">¡Hola, {name}!</h1>
                    <p className="mt-2 text-leaf-100/80 text-lg">Hoy es un gran día para cuidar tu salud.</p>
                    <button
                      onClick={() => setView('plan')}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white text-pine-900 font-semibold px-4 py-2.5 hover:bg-leaf-50 transition-colors"
                    >
                      Ir a mi plan de hoy
                      <IconArrowRight size={17} />
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 text-leaf-400 pointer-events-none">
                    <PulseLine className="absolute inset-0 w-full h-full opacity-25" strokeWidth={4} soft />
                    <PulseLine className="absolute inset-0 w-full h-full opacity-90" strokeWidth={1.75} />
                  </div>
                </section>

                {/* Resumen */}
                <section
                  aria-label="Resumen"
                  className="grid grid-cols-1 md:grid-cols-3 bg-paper rounded-2xl border border-line shadow-panel divide-y md:divide-y-0 md:divide-x divide-line"
                >
                  <div className="p-6 flex items-start gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-leaf-100 text-pine-700 shrink-0">
                      <IconShield size={21} />
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-ink-soft font-sans tracking-normal">Estado del triaje</h3>
                      <p className="mt-1 flex items-center gap-1.5 font-display text-2xl font-semibold text-pine-800">
                        Completado
                        <span className="grid place-items-center w-5 h-5 rounded-full bg-leaf-500 text-white"><IconCheck size={13} strokeWidth={3} /></span>
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex items-start gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-tide-100 text-tide-600 shrink-0">
                      <IconFlame size={21} />
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-ink-soft font-sans tracking-normal">Calorías objetivo</h3>
                      <p className="mt-1 font-display text-2xl font-semibold text-tide-700 num">
                        2,244 <span className="text-base font-medium text-ink-soft">kcal al día</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex items-start gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                      <IconBolt size={21} />
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-ink-soft font-sans tracking-normal">Nivel de actividad</h3>
                      <p className="mt-1 font-display text-2xl font-semibold text-amber-700">Intermedio</p>
                      <div className="mt-2 flex gap-1" aria-hidden="true">
                        <span className="h-1.5 w-8 rounded-full bg-amber-600" />
                        <span className="h-1.5 w-8 rounded-full bg-amber-600" />
                        <span className="h-1.5 w-8 rounded-full bg-line-strong" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Accesos */}
                <section className="bg-paper rounded-2xl border border-line shadow-panel overflow-hidden">
                  <h2 className="px-6 pt-5 pb-2 font-display text-lg font-semibold text-pine-900">¿Qué quieres hacer ahora?</h2>
                  <ul className="divide-y divide-line">
                    {ATAJOS.map(({ id, icon: Icon, titulo, texto }) => (
                      <li key={id}>
                        <button
                          onClick={() => setView(id)}
                          className="group w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-leaf-50 transition-colors"
                        >
                          <span className="grid place-items-center w-10 h-10 rounded-lg bg-mist text-pine-700 group-hover:bg-leaf-100 transition-colors shrink-0">
                            <Icon size={19} />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-ink">{titulo}</span>
                            <span className="block text-sm text-ink-soft">{texto}</span>
                          </span>
                          <IconArrowRight size={18} className="text-ink-faint group-hover:text-pine-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          )}

          {/* 2️⃣ VISTA DEL CHAT */}
          {view === 'chat' && (
            <div key="chat" className="flex-1 min-h-0 h-full p-3 sm:p-4 md:p-8 overflow-hidden animate-fade">
              <div className="h-full max-w-4xl mx-auto">
                <Asistente />
              </div>
            </div>
          )}

          {/* 3️⃣ VISTA DE GRÁFICAS */}
          {view === 'graficas' && (
            <div key="graficas" className="flex-1 overflow-y-auto scroll-soft p-4 sm:p-6 md:p-10 animate-fade">
              <div className="max-w-5xl mx-auto">
                {/* 🟢 AHORA ES DINÁMICO */}
                <MisGraficas userId={userId} /> 
              </div>
            </div>
          )}

          {/* 4️⃣ VISTA DE PLAN DIARIO */}
          {view === 'plan' && (
            <div key="plan" className="flex-1 overflow-y-auto scroll-soft p-4 sm:p-6 md:p-10 animate-fade">
              {/* 🟢 AHORA ES DINÁMICO */}
              <PlanDiario userId={userId} />
            </div>
          )}
        </main>

        {/* Navegación inferior (móvil) */}
        <nav
          aria-label="Navegación principal"
          className="md:hidden grid grid-cols-4 bg-paper border-t border-line shrink-0 pb-[env(safe-area-inset-bottom)]"
        >
          {NAV.map(({ id, label, icon: Icon }) => {
            const activo = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                aria-current={activo ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] font-medium transition-colors ${
                  activo ? 'text-pine-800' : 'text-ink-faint'
                }`}
              >
                <span className={`absolute top-0 h-[3px] w-8 rounded-b-full bg-leaf-500 transition-opacity ${activo ? 'opacity-100' : 'opacity-0'}`} />
                <Icon size={21} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
