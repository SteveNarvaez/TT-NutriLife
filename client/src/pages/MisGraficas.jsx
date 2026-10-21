import React, { useState, useEffect } from 'react';
// Añadimos BarChart y Bar a las importaciones
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLOR_PESO = '#237d61';
const COLOR_CONSTANCIA = '#1d6f8c';

const EJE = { fill: '#78897f', fontSize: 12 };

// Tooltip con el mismo lenguaje visual del resto de la app
const TooltipPanel = ({ active, payload, label, unidad, nombre }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="rounded-xl border border-line bg-paper px-3.5 py-2.5 shadow-float">
            <p className="text-xs text-ink-soft">{label}</p>
            <p className="font-display text-lg font-semibold text-ink num">
                {payload[0].value}{unidad}
            </p>
            <p className="text-xs text-ink-faint">{nombre}</p>
        </div>
    );
};

const Vacio = ({ texto }) => (
    <div className="h-48 flex items-center justify-center rounded-xl border border-dashed border-line-strong bg-mist/60 px-6">
        <p className="text-ink-soft text-center max-w-sm">{texto}</p>
    </div>
);

const CargandoGrafica = () => (
    <div className="h-[300px] flex flex-col justify-end gap-3" aria-busy="true" aria-label="Cargando gráfica">
        <div className="skeleton h-full w-full" />
    </div>
);

const MisGraficas = ({ userId }) => {
    const [datosPeso, setDatosPeso] = useState([]);
    const [datosConstancia, setDatosConstancia] = useState([]); // Nuevo estado para la segunda gráfica
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const id = userId || "1"; 

                // 1. Traemos los datos de la gráfica de Peso
                const resPeso = await fetch(`http://localhost:3000/api/graficas/peso/${id}`);
                const dataPeso = await resPeso.json();
                setDatosPeso(Array.isArray(dataPeso) ? dataPeso : []);

                // 2. Traemos los datos de la gráfica de Constancia (NUEVO)
                const resConstancia = await fetch(`http://localhost:3000/api/graficas/constancia/${id}`);
                const dataConstancia = await resConstancia.json();
                setDatosConstancia(Array.isArray(dataConstancia) ? dataConstancia : []);

            } catch (error) {
                console.error("Error cargando las gráficas:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerDatos();
    }, [userId]);

    // Indicadores derivados de los mismos datos (sin pedir nada nuevo al servidor)
    const pesoActual = datosPeso.length ? Number(datosPeso[datosPeso.length - 1].peso) : null;
    const pesoInicial = datosPeso.length ? Number(datosPeso[0].peso) : null;
    const cambio = pesoActual !== null && datosPeso.length > 1 ? pesoActual - pesoInicial : null;
    const promedio = datosConstancia.length
        ? Math.round(datosConstancia.reduce((s, d) => s + Number(d.porcentaje || 0), 0) / datosConstancia.length)
        : null;

    const formatoCambio = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)} kg`;

    return (
        <div className="space-y-6 pb-10 stagger">

            <div>
                <h2 className="font-display text-3xl font-semibold text-pine-900">Mis gráficas</h2>
                <p className="mt-2 text-ink-soft">Tu peso y tu constancia a lo largo del tiempo.</p>
            </div>

            {/* Indicadores */}
            <section aria-label="Indicadores" className="grid grid-cols-1 sm:grid-cols-3 bg-paper rounded-2xl border border-line shadow-panel divide-y sm:divide-y-0 sm:divide-x divide-line">
                <div className="p-5">
                    <p className="text-sm font-medium text-ink-soft">Peso actual</p>
                    {cargando
                        ? <div className="skeleton h-8 w-24 mt-2" />
                        : <p className="mt-1 font-display text-3xl font-semibold text-pine-800 num">
                            {pesoActual !== null ? <>{pesoActual}<span className="text-base font-medium text-ink-soft"> kg</span></> : <span className="text-ink-faint">—</span>}
                          </p>}
                </div>
                <div className="p-5">
                    <p className="text-sm font-medium text-ink-soft">Cambio desde tu primer registro</p>
                    {cargando
                        ? <div className="skeleton h-8 w-24 mt-2" />
                        : <p className="mt-1 font-display text-3xl font-semibold text-ink num">
                            {cambio !== null ? formatoCambio(cambio) : <span className="text-ink-faint">—</span>}
                          </p>}
                </div>
                <div className="p-5">
                    <p className="text-sm font-medium text-ink-soft">Constancia promedio</p>
                    {cargando
                        ? <div className="skeleton h-8 w-24 mt-2" />
                        : <p className="mt-1 font-display text-3xl font-semibold text-tide-700 num">
                            {promedio !== null ? `${promedio}%` : <span className="text-ink-faint">—</span>}
                          </p>}
                </div>
            </section>
            
            {/* 🟢 GRÁFICA 1: PROGRESO DE PESO */}
            <section className="p-6 bg-paper rounded-2xl border border-line shadow-panel">
                <h3 className="font-display text-xl font-semibold text-pine-900">Mi progreso de peso</h3>
                <p className="text-sm text-ink-soft mt-1 mb-5">Kilogramos registrados por fecha.</p>
                
                {cargando ? <CargandoGrafica /> : datosPeso.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={datosPeso} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLOR_PESO} stopOpacity={0.22} />
                                        <stop offset="100%" stopColor={COLOR_PESO} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dbe5e0" />
                                <XAxis dataKey="fecha" tick={EJE} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[(min) => Math.floor((min - 1) / 2) * 2, (max) => Math.ceil((max + 1) / 2) * 2]} tickCount={4} allowDecimals={false} tick={EJE} axisLine={false} tickLine={false} width={48} />
                                <Tooltip
                                    cursor={{ stroke: '#c3d1ca', strokeDasharray: '3 3' }}
                                    content={<TooltipPanel unidad=" kg" nombre="Peso" />}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="peso" 
                                    name="Peso (kg)"
                                    stroke={COLOR_PESO} 
                                    strokeWidth={3}
                                    fill="url(#gradPeso)"
                                    dot={{ r: 3.5, fill: '#fbfdfc', stroke: COLOR_PESO, strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: COLOR_PESO, stroke: '#fbfdfc', strokeWidth: 2.5 }} 
                                    animationDuration={900}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <Vacio texto="Aún no hay suficientes datos de peso registrados." />
                )}
            </section>

            {/* 📊 GRÁFICA 2: CONSTANCIA DIARIA */}
            <section className="p-6 bg-paper rounded-2xl border border-line shadow-panel">
                <h3 className="font-display text-xl font-semibold text-pine-900">Mi disciplina semanal</h3>
                <p className="text-sm text-ink-soft mt-1 mb-5">Porcentaje de tareas diarias completadas.</p>
                
                {cargando ? <CargandoGrafica /> : datosConstancia.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={datosConstancia} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#dbe5e0" />
                                <XAxis dataKey="fecha" tick={EJE} tickMargin={10} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={EJE} axisLine={false} tickLine={false} width={48} tickFormatter={(tick) => `${tick}%`} />
                                <Tooltip 
                                    cursor={{ fill: 'rgb(29 111 140 / 0.07)' }}
                                    content={<TooltipPanel unidad="%" nombre="Completado" />}
                                />
                                <Bar 
                                    dataKey="porcentaje" 
                                    fill={COLOR_CONSTANCIA}
                                    radius={[6, 6, 0, 0]} /* Bordes redondeados arriba */
                                    maxBarSize={44}
                                    animationDuration={800}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <Vacio texto='Ve a "Plan diario" y guarda tu progreso de hoy para ver tu gráfica.' />
                )}
            </section>

        </div>
    );
};

export default MisGraficas;
