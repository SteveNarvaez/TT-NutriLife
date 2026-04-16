const dialogflow = require('@google-cloud/dialogflow');
const pool = require('../config/db');
const sessionClient = new dialogflow.SessionsClient();

const enviarMensajeADialogflow = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const projectID = process.env.DIALOGFLOW_PROJECT_ID; 
    
    // Si userId es undefined, usamos "7" para evitar el error de .toString()
    const sessionID = userId ? String(userId) : "7"; 
    const sessionPath = sessionClient.projectAgentSessionPath(projectID, sessionID);

    const request = {
      session: sessionPath,
      queryInput: { text: { text: message, languageCode: 'es' } },
    };

    const responses = await sessionClient.detectIntent(request);
    res.json({ reply: responses[0].queryResult.fulfillmentText });
  } catch (error) {
    console.error("❌ ERROR DIALOGFLOW:", error.message);
    res.status(500).json({ reply: "Error de comunicación con la IA." });
  }
};

// server/controllers/chatbotController.js

const manejarEvaluacion = async (req, res) => {
    try {
        // 1. Limpiamos el nombre de CUALQUIER espacio o salto de línea oculto
        const intentName = req.body.queryResult.intent.displayName.trim().toLowerCase();
        
        console.log(`🔍 Intent procesado: "${intentName}"`);

        const sessionParts = req.body.session.split('/');
        const id_usuario = sessionParts[sessionParts.length - 1];

        // 2. Usamos .includes para que sea más flexible si hay espacios raros
        if (intentName.includes('evaluacion_inicial')) {
            const parametros = req.body.queryResult.parameters;
            const { edad, estatura, peso, objetivo, ejercicio, salud } = parametros;
            
            // --- CÁLCULOS NUTRICIONALES ---
            let tmb = (10 * peso) + (6.25 * estatura) - (5 * edad) + 5;
            let mult = ejercicio === 'intenso' ? 1.725 : (ejercicio === 'moderado' ? 1.55 : 1.2);
            let metaCalorica = Math.round(tmb * mult + (objetivo.toLowerCase().includes("ganar") ? 400 : -500));

            const prot = Math.round(peso * 2.2);
            const grasas = Math.round(peso * 1);
            const carbs = Math.round((metaCalorica - (prot * 4) - (grasas * 9)) / 4);

            // --- GUARDADO DINÁMICO ---
            await pool.query(
                `INSERT INTO historial_medidas (id_usuario, peso_kg, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [id_usuario, peso, estatura, ejercicio, metaCalorica, objetivo]
            );

            await pool.query(
                `INSERT INTO perfil_salud_triaje (id_usuario, padece_enfermedad, enfermedades_declaradas, apto_alto_impacto) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id_usuario) DO UPDATE SET padece_enfermedad = EXCLUDED.padece_enfermedad`,
                [id_usuario, salud.toLowerCase().includes("si"), salud, !salud.toLowerCase().includes("si")]
            );

            console.log(`✅ ¡DATOS GUARDADOS PARA EL ID ${id_usuario}!`);

            return res.json({ 
                fulfillmentText: `¡Análisis completado, Steven! 🚀\n🔥 Meta: **${metaCalorica} kcal**\n🥩 Macros: P:${prot}g | G:${grasas}g | C:${carbs}g\n\nYa puedes ver tus gráficas en el menú lateral.` 
            });
        }

        // Si no entra al IF, te dirá por qué (útil para debuguear)
        return res.json({ 
            fulfillmentText: `Webhook activo. El intent detectado fue "${intentName}", pero el sistema esperaba "evaluacion_inicial".` 
        });

    } catch (error) {
        console.error("❌ ERROR WEBHOOK:", error.message);
        return res.json({ fulfillmentText: "Hubo un error en los cálculos, pero el bot sigue vivo." });
    }
};
module.exports = { enviarMensajeADialogflow, manejarEvaluacion };