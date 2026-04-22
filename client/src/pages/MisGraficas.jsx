import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MisGraficas = ({ userId }) => {
    const [datosPeso, setDatosPeso] = useState([]);

    useEffect(() => {
        // Hacemos la petición a la ruta que acabamos de crear en Node
        const obtenerDatos = async () => {
            try {
                // Cambia el "1" por la variable del ID de usuario real que uses en tu frontend
                const id = userId || "1"; 
                const response = await fetch(`http://localhost:3000/api/graficas/peso/${id}`);
                const data = await response.json();
                setDatosPeso(data);
            } catch (error) {
                console.error("Error cargando la gráfica:", error);
            }
        };

        obtenerDatos();
    }, [userId]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Mi Progreso de Peso</h2>
            
            {datosPeso.length > 0 ? (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={datosPeso}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="peso" 
                                stroke="#16a34a" /* Verde bonito de Tailwind */
                                strokeWidth={3}
                                activeDot={{ r: 8 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-10">
                    Aún no hay suficientes datos para mostrar tu gráfica. ¡Actualiza tu peso en el chat!
                </p>
            )}
        </div>
    );
};

export default MisGraficas;