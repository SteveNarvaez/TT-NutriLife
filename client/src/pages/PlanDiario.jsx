import React, { useState } from 'react';

const PlanDiario = () => {
  // Estado para controlar qué tareas del día ya se hicieron
  const [tareas, setTareas] = useState([
    { id: 1, tipo: 'agua', titulo: 'Tomar 2.5 Litros de Agua', completado: false, icono: '💧' },
    { id: 2, tipo: 'dieta', titulo: 'Desayuno Proteico', completado: false, icono: '🍳' },
    { id: 3, tipo: 'dieta', titulo: 'Comida Equilibrada', completado: false, icono: '🥗' },
    { id: 4, tipo: 'dieta', titulo: 'Cena Ligera', completado: false, icono: '🌙' },
    { id: 5, tipo: 'ejercicio', titulo: 'Rutina del Día (Completar Día 1)', completado: false, icono: '🏋️' },
  ]);

  // Función para marcar/desmarcar una tarea
  const toggleTarea = (id) => {
    const nuevasTareas = tareas.map(tarea => 
      tarea.id === id ? { ...tarea, completado: !tarea.completado } : tarea
    );
    setTareas(nuevasTareas);
  };

  // Calcular el porcentaje de la barra de progreso
  const tareasCompletadas = tareas.filter(t => t.completado).length;
  const progreso = Math.round((tareasCompletadas / tareas.length) * 100);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-extrabold text-green-800 mb-2">Tu Plan Diario</h2>
      <p className="text-gray-500 mb-8">Marca tus objetivos conforme avance tu día para mantener tu racha.</p>

      {/* 🟢 BARRA DE PROGRESO (¡Esto se ve súper profesional!) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">Progreso de hoy</span>
          <span className="font-bold text-green-600">{progreso}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
        {progreso === 100 && (
          <p className="text-sm text-center text-green-600 mt-4 font-bold animate-pulse">
            ¡Felicidades! Has completado tu plan del día. 🎉
          </p>
        )}
      </div>

      {/* 📋 LISTA DE TAREAS */}
      <div className="space-y-4">
        {tareas.map((tarea) => (
          <div 
            key={tarea.id}
            onClick={() => toggleTarea(tarea.id)}
            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
              tarea.completado 
                ? 'bg-green-50 border-green-200 opacity-75' 
                : 'bg-white border-transparent hover:border-green-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{tarea.icono}</span>
              <span className={`font-medium text-lg ${tarea.completado ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {tarea.titulo}
              </span>
            </div>
            
            {/* Checkbox personalizado */}
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
              tarea.completado ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {tarea.completado && <span className="text-white text-xl">✓</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanDiario;