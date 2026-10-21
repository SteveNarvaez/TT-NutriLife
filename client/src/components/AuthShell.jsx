import React from 'react';
import Brand from './Brand';
import PulseLine from './PulseLine';
import { IconShield, IconPlan, IconChat } from './Icons';

const puntos = [
  {
    icon: IconShield,
    titulo: 'Triaje de salud antes de empezar',
    texto: 'Si declaras una condición de riesgo, ajustamos tu plan y te avisamos.',
  },
  {
    icon: IconPlan,
    titulo: 'Un plan diario que puedes cumplir',
    texto: 'Agua, comidas y ejercicio en una lista simple, con tu progreso a la vista.',
  },
  {
    icon: IconChat,
    titulo: 'Un asistente que te responde',
    texto: 'Pregunta por tu dieta o tu rutina cuando lo necesites.',
  },
];

/*
  Layout dividido: panel de marca a la izquierda (solo en pantallas grandes)
  y el formulario a la derecha. El panel es el único momento “expresivo”
  de las pantallas de acceso; el formulario se mantiene sobrio.
*/
const AuthShell = ({ children, maxWidth = 'max-w-md' }) => (
  <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-mist">
    {/* Panel de marca */}
    <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-pine-900 text-white p-12 xl:p-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 50% at 15% 0%, rgb(47 158 107 / 0.28) 0%, transparent 70%), radial-gradient(50% 40% at 100% 100%, rgb(29 111 140 / 0.22) 0%, transparent 70%)',
        }}
      />

      <div className="relative">
        <Brand tone="light" size="lg" />
      </div>

      <div className="relative max-w-md">
        <h1 className="font-display text-4xl xl:text-[2.75rem] font-semibold leading-[1.1] text-white">
          Tu nutrición, con seguimiento y criterio médico.
        </h1>
        <p className="mt-5 text-leaf-100/80 leading-relaxed text-[1.05rem]">
          Registra tu día, revisa tu progreso y consulta al asistente. Si tu salud necesita
          cuidado extra, NutriLife te lo indica antes de proponerte un plan intenso.
        </p>

        <ul className="mt-10 space-y-5">
          {puntos.map(({ icon: Icon, titulo, texto }) => (
            <li key={titulo} className="flex gap-4">
              <span className="mt-0.5 grid place-items-center w-9 h-9 shrink-0 rounded-lg bg-white/8 ring-1 ring-inset ring-white/12 text-leaf-200">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-semibold text-white">{titulo}</p>
                <p className="text-sm text-leaf-100/70 leading-relaxed">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Línea de pulso: se dibuja una vez al cargar */}
      <div className="relative -mx-12 xl:-mx-16 -mb-4 h-28 text-leaf-400">
        <PulseLine className="absolute inset-0 w-full h-full opacity-25" strokeWidth={5} soft />
        <PulseLine className="absolute inset-0 w-full h-full" strokeWidth={2} />
      </div>
    </aside>

    {/* Lado del formulario */}
    <main className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className={`w-full ${maxWidth} animate-rise`}>
        <div className="lg:hidden mb-8">
          <Brand />
        </div>
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;
