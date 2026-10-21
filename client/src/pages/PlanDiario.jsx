import React, { useState, useEffect } from 'react';
import Notice from '../components/Notice';
import { IconDrop, IconEgg, IconBowl, IconMoon, IconDumbbell, IconCheck } from '../components/Icons';

// Icono por tarea (reemplaza a los emojis)
const ICONOS = { 1: IconDrop, 2: IconEgg, 3: IconBowl, 4: IconMoon, 5: IconDumbbell };
const ETIQUETAS = { agua: 'Hidratación', dieta: 'Alimentación', ejercicio: 'Ejercicio' };

const PlanDiario = ({ userId }) => {
  const [tareas, setTareas] = useState([
    { id: 1, tipo: 'agua', titulo: 'Calculando tu requerimiento...', completado: false },
    { id: 2, tipo: 'dieta', titulo: 'Desayuno Proteico', completado: false },
    { id: 3, tipo: 'dieta', titulo: 'Comida Equilibrada', completado: false },
    { id: 4, tipo: 'dieta', titulo: 'Cena Ligera', completado: false },
    { id: 5, tipo: 'ejercicio', titulo: 'Rutina del Día', completado: false },
  ]);

  const [guardado, setGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  // AL CARGAR LA PÁGINA: Buscar el peso y calcular el agua
  useEffect(() => {
    const obtenerPesoYCalcularAgua = async () => {
      try {
        const id = userId || "1";
        const response = await fetch(`http://localhost:3000/api/usuario/peso/${id}`);
        const data = await response.json();
        
        const litrosRecomendados = (data.peso * 0.035).toFixed(1);

        setTareas(tareasAnteriores => 
          tareasAnteriores.map(t => 
            t.tipo === 'agua' ? { ...t, titulo: `Tomar ${litrosRecomendados} Litros de Agua` } : t
          )
        );
      } catch (error) {
        console.error("Error al obtener el peso para el agua:", error);
      }
    };

    obtenerPesoYCalcularAgua();
  }, [userId]);

  const tareasCompletadas = tareas.filter(t => t.completado).length;
  const progreso = Math.round((tareasCompletadas / tareas.length) * 100);

  const toggleTarea = (id) => {
    const nuevasTareas = tareas.map(tarea => 
      tarea.id === id ? { ...tarea, completado: !tarea.completado } : tarea
    );
    setTareas(nuevasTareas);
    setGuardado(false); // Resetea el estado del botón si el usuario cambia algo
    setErrorGuardado(false);
  };

  // FUNCIÓN PARA GUARDAR EN LA BASE DE DATOS
  const handleGuardarProgreso = async () => {
    try {
      const id = userId || "1";
      const response = await fetch('http://localhost:3000/api/constancia/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: id, porcentaje: progreso })
      });

      if (response.ok) {
        setGuardado(true);
        setErrorGuardado(false);
      } else {
        console.error("Error al intentar guardar el progreso.");
        setErrorGuardado(true);
      }
    } catch (error) {
      console.error("Error de red al guardar el porcentaje:", error);
      setErrorGuardado(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="stagger space-y-6">

        <div>
          <h2 className="font-display text-3xl font-semibold text-pine-900">Tu plan diario</h2>
          <p className="mt-2 text-ink-soft">Marca tus objetivos conforme avance tu día para mantener tu racha.</p>
        </div>

        {/* PROGRESO: una barra segmentada, un tramo por tarea */}
        <section className="bg-paper p-6 rounded-2xl border border-line shadow-panel">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-soft">Progreso de hoy</p>
              <p className="font-display text-5xl font-semibold text-pine-800 num leading-none mt-2">
                {progreso}<span className="text-3xl text-pine-600">%</span>
              </p>
            </div>
            <p className="text-sm text-ink-soft pb-1 num">
              {tareasCompletadas} de {tareas.length} tareas
            </p>
          </div>

          <div
            className="mt-5 grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${tareas.length}, minmax(0, 1fr))` }}
            role="progressbar"
            aria-valuenow={progreso}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del plan de hoy"
          >
            {tareas.map((t) => (
              <span
                key={t.id}
                className={`h-2.5 rounded-full transition-colors duration-500 ease-out ${
                  t.completado ? 'bg-leaf-500' : 'bg-line'
                }`}
              />
            ))}
          </div>

          {progreso === 100 && (
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-pine-700 animate-celebrate">
              <span className="grid place-items-center w-5 h-5 rounded-full bg-leaf-500 text-white">
                <IconCheck size={12} strokeWidth={3} />
              </span>
              ¡Felicidades! Has completado tu plan del día.
            </p>
          )}
        </section>

        {/* LISTA DE TAREAS */}
        <ul className="space-y-3">
          {tareas.map((tarea) => {
            const Icono = ICONOS[tarea.id];
            return (
              <li key={tarea.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={tarea.completado}
                  onClick={() => toggleTarea(tarea.id)}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl text-left border transition-colors duration-200 ${
                    tarea.completado 
                      ? 'bg-leaf-50 border-leaf-200' 
                      : 'bg-paper border-line shadow-panel hover:border-line-strong'
                  }`}
                >
                  <span className="flex items-center gap-4 min-w-0">
                    <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-colors duration-200 ${
                      tarea.completado ? 'bg-leaf-100 text-pine-700' : 'bg-mist text-pine-700'
                    }`}>
                      {Icono && <Icono size={21} />}
                    </span>
                    <span className="min-w-0">
                      <span className={`block font-semibold text-[1.02rem] transition-colors ${
                        tarea.completado ? 'line-through decoration-ink-faint/60 text-ink-faint' : 'text-ink'
                      }`}>
                        {tarea.titulo}
                      </span>
                      <span className="block text-sm text-ink-soft">{ETIQUETAS[tarea.tipo]}</span>
                    </span>
                  </span>
                  
                  <span className={`grid place-items-center w-7 h-7 rounded-full border-2 shrink-0 transition-colors duration-200 ${
                    tarea.completado ? 'bg-leaf-500 border-leaf-500' : 'border-line-strong bg-paper'
                  }`}>
                    {tarea.completado && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path className="check-draw" d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* BOTÓN DE GUARDAR */}
        <div className="flex flex-col items-stretch sm:items-center gap-4 pb-6">
          <button 
            onClick={handleGuardarProgreso}
            className="btn-primary w-full sm:w-auto sm:px-10 py-3.5"
          >
            {guardado && <IconCheck size={18} />}
            {guardado ? 'Progreso guardado' : 'Guardar mi progreso del día'}
          </button>
          
          {guardado && (
            <p className="text-pine-700 font-medium text-center animate-celebrate">
              ¡Excelente trabajo! Tu constancia de hoy ({progreso}%) ha sido registrada.
            </p>
          )}
          {errorGuardado && (
            <Notice tone="error" className="w-full sm:max-w-md">
              No pudimos guardar tu progreso. Revisa tu conexión e inténtalo de nuevo.
            </Notice>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDiario;
