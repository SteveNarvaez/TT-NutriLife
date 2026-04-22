const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db'); // <--- ¡Esta es la pieza que falta!
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // <--- ¡Sin esto todo llega undefined!

app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);

// 👇 AQUÍ AGREGAMOS LA NUEVA RUTA PARA LAS GRÁFICAS 👇
app.get('/api/graficas/peso/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;

        // Buscamos todos los pesos registrados, ordenados del más viejo al más nuevo
        const historialQuery = await pool.query(
            `SELECT peso_kg, fecha_registro 
             FROM historial_medidas 
             WHERE id_usuario = $1 
             ORDER BY fecha_registro ASC`,
            [id_usuario]
        );

        // Si no hay datos, mandamos un arreglo vacío
        if (historialQuery.rows.length === 0) {
            return res.json([]);
        }

        // Formateamos los datos para que la gráfica de React los entienda fácil
        const datosGrafica = historialQuery.rows.map(fila => {
            return {
                // Formateamos la fecha a algo legible (ej: "15/Oct")
                fecha: new Date(fila.fecha_registro).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                peso: parseFloat(fila.peso_kg)
            };
        });

        res.json(datosGrafica);

    } catch (error) {
        console.error("❌ ERROR GET GRAFICAS:", error.message);
        res.status(500).json({ error: "Error al obtener datos para la gráfica" });
    }
});
// 👆 FIN DE LA RUTA DE GRÁFICAS 👆

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));