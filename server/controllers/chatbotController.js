const dialogflow = require('@google-cloud/dialogflow');
const pool = require('../config/db');
const sessionClient = new dialogflow.SessionsClient();

// 1. FUNCIÓN QUE RECIBE MENSAJES DEL FRONTEND
const enviarMensajeADialogflow = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const projectID = process.env.DIALOGFLOW_PROJECT_ID; 
    const sessionID = userId ? String(userId) : "7"; 
    const sessionPath = sessionClient.projectAgentSessionPath(projectID, sessionID);

    let request;
    const textoUsuario = message.toLowerCase().trim();

    // 🔍 Ampliamos la lista para detectar saludos Y peticiones directas
    const palabrasClave = ["hola", "buenos dias", "que tal", "empezar", "inicio", "soy yo de nuevo", "dieta", "dame mi dieta", "rutina", "dame mi rutina", "ejercicios", "actualizar"];
    const quiereAccion = palabrasClave.some(palabra => textoUsuario.includes(palabra));

    // REVISIÓN DE MEMORIA: ¿Usuario conocido saludando o pidiendo algo?
    if (quiereAccion) {
      const userCheck = await pool.query(
        `SELECT id_medida FROM historial_medidas WHERE id_usuario = $1 LIMIT 1`,
        [sessionID]
      );

      if (userCheck.rows.length > 0) {
        console.log(`🤖 Usuario ${sessionID} reconocido en la base de datos.`);
        
        // IMPORTANTE: Solo saltamos la evaluación si fue un saludo inicial.
        // Si pidió "dieta", dejamos que pase al Intent normal para que tu webhook haga la magia.
        const esSoloSaludo = ["hola", "buenos dias", "que tal", "empezar", "inicio", "soy yo de nuevo"].includes(textoUsuario);
        
        if (esSoloSaludo) {
            console.log(`➡️ Es un saludo. Disparando evento WELCOME_USER.`);
            request = {
              session: sessionPath,
              queryInput: {
                event: { name: 'WELCOME_USER', languageCode: 'es' },
              },
            };
        }
      }
    }

    // Si no es un saludo (o es usuario nuevo), procedemos con el mensaje normal de texto
    if (!request) {
      request = {
        session: sessionPath,
        queryInput: { text: { text: message, languageCode: 'es' } },
      };
    }

    const responses = await sessionClient.detectIntent(request);
    res.json({ reply: responses[0].queryResult.fulfillmentText });

  } catch (error) {
    console.error("❌ ERROR DIALOGFLOW:", error.message);
    res.status(500).json({ reply: "Error de comunicación con la IA." });
  }
};

const manejarEvaluacion = async (req, res) => {
    try {
        const intentName = req.body.queryResult.intent.displayName.trim().toLowerCase();
        console.log(`🔍 Intent procesado: "${intentName}"`);

        const sessionParts = req.body.session.split('/');
        const id_usuario = sessionParts[sessionParts.length - 1];

        if (intentName.includes('evaluacion_inicial')) {
            const parametros = req.body.queryResult.parameters;
            const { edad, estatura, peso, objetivo, ejercicio, salud } = parametros;
            
            // 🛑 EL ESCUDO MÉDICO
            const tieneEnfermedad = salud.toLowerCase().includes("si");

            if (tieneEnfermedad) {
                console.log(`⚠️ Escudo Médico activado para ID ${id_usuario}. Operación cancelada por seguridad.`);
                await pool.query(
                    `INSERT INTO perfil_salud_triaje (id_usuario, padece_enfermedad, enfermedades_declaradas, apto_alto_impacto) 
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (id_usuario) DO UPDATE SET padece_enfermedad = EXCLUDED.padece_enfermedad`,
                    [id_usuario, true, salud, false]
                );

                return res.json({ 
                    fulfillmentText: "Por tu seguridad, al tener una condición médica o discapacidad preexistente, no puedo generarte un plan de nutrición o entrenamiento automático. Te recomiendo ampliamente visitar a un médico especialista. ¡Tu bienestar es lo más importante! 🩺" 
                });
            }

            // ✅ CAMINO LIBRE
            let tmb = (10 * peso) + (6.25 * estatura) - (5 * edad) + 5;
            let mult = ejercicio === 'intenso' ? 1.725 : (ejercicio === 'moderado' ? 1.55 : 1.2);
            let metaCalorica = Math.round(tmb * mult + (objetivo.toLowerCase().includes("ganar") ? 400 : -500));

            const prot = Math.round(peso * 2.2);
            const grasas = Math.round(peso * 1);
            const carbs = Math.round((metaCalorica - (prot * 4) - (grasas * 9)) / 4);

            await pool.query(
                `INSERT INTO historial_medidas (id_usuario, peso_kg, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [id_usuario, peso, estatura, ejercicio, metaCalorica, objetivo]
            );

            await pool.query(
                `INSERT INTO perfil_salud_triaje (id_usuario, padece_enfermedad, enfermedades_declaradas, apto_alto_impacto) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id_usuario) DO UPDATE SET padece_enfermedad = EXCLUDED.padece_enfermedad`,
                [id_usuario, false, salud, true]
            );

            console.log(`✅ ¡DATOS GUARDADOS PARA EL ID ${id_usuario}!`);

            return res.json({ 
                fulfillmentText: `¡Análisis completado! 🚀\n🔥 Meta: **${metaCalorica} kcal**\n🥩 Macros: P:${prot}g | G:${grasas}g | C:${carbs}g\n\n¿Qué quieres hacer ahora? ¿Quieres empezar con tu **dieta** o armar tus **ejercicios**?` 
            });

        } 
// --- ✅ ESTE ES EL QUE TE FALTABA: BIENVENIDA PARA USUARIOS YA REGISTRADOS ---
        else if (intentName.includes('usuario_reconocido')) {
            const infoQuery = await pool.query(
                `SELECT tmb_calculado, objetivo_actual FROM historial_medidas WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`, [id_usuario]
            );

            let msg = "¡Hola de nuevo, Steven! Qué gusto verte.";
            if (infoQuery.rows.length > 0) {
                msg += ` Actualmente tu meta es de **${infoQuery.rows[0].tmb_calculado} kcal** para **${infoQuery.rows[0].objetivo_actual}**.`;
            }
            return res.json({ fulfillmentText: `${msg}\n\n¿Qué quieres hacer: ver tu **dieta**, tu **rutina** o **actualizar** tus medidas?` });
        }
// 🟢 PUENTE PARA LA DIETA (VERSIÓN DEFINITIVA: AOA + CEREAL + FRESCOS)
        else if (intentName.includes('elegir_dieta')) {
            console.log(`🥗 Generando menú PRO para el ID ${id_usuario}`);

            const userQuery = await pool.query(
                `SELECT tmb_calculado, objetivo_actual FROM historial_medidas WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`,
                [id_usuario]
            );

            if (userQuery.rows.length === 0) {
                return res.json({ fulfillmentText: "No encontré tu evaluación previa. Escribe 'evaluación' para empezar desde cero." });
            }

            const caloriasMeta = userQuery.rows[0].tmb_calculado;
            const objetivo = userQuery.rows[0].objetivo_actual;

            const comidaQuery = await pool.query(`SELECT * FROM catalogo_comida`);
            const alimentos = comidaQuery.rows;

            // 🧠 LA MAGIA: Clasificación experta (Reconociendo AOA)
            const proteinas = alimentos.filter(a => a.grupo_nutricional.toUpperCase() === 'AOA' || a.grupo_nutricional.toLowerCase().includes('prote'));
            
            // Filtramos cereales o usamos lo que no sea AOA ni fruta como respaldo
            let guarniciones = alimentos.filter(a => a.grupo_nutricional.toLowerCase().includes('cereal') || a.grupo_nutricional.toLowerCase().includes('leguminosa'));
            if (guarniciones.length === 0) guarniciones = alimentos.filter(a => a.grupo_nutricional.toUpperCase() !== 'AOA' && !a.grupo_nutricional.toLowerCase().includes('fruta'));

            // Filtramos frutas/verduras
            let frescos = alimentos.filter(a => a.grupo_nutricional.toLowerCase().includes('fruta') || a.grupo_nutricional.toLowerCase().includes('verdura'));
            if (frescos.length === 0) frescos = guarniciones; // Respaldo por si no hay frutas

            if (proteinas.length === 0) {
                return res.json({ fulfillmentText: "Necesito alimentos con el grupo 'AOA' en pgAdmin para armarte la dieta. ¡Revisa tu base!" });
            }

            const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

            // 3. Constructora de platos de 3 elementos
            const armarTiempoComida = (nombreTiempo, porcentajeCalorias) => {
                const caloriasTiempo = Math.round(caloriasMeta * porcentajeCalorias);

                // Elegimos 1 de cada canasta
                let alimentoPro = getRandomItem(proteinas);
                let alimentoCarb = getRandomItem(guarniciones);
                let alimentoFresco = getRandomItem(frescos);

                // División fitness: 40% calorías a proteína, 40% a guarnición pesada, 20% a fruta/verdura
                let kcalPro = caloriasTiempo * 0.40;
                let kcalCarb = caloriasTiempo * 0.40;
                let kcalFresco = caloriasTiempo * 0.20;

                // Regla de 3
                let cantPro = ((kcalPro / alimentoPro.calorias_kcal) * alimentoPro.cantidad_base).toFixed(1);
                let cantCarb = ((kcalCarb / alimentoCarb.calorias_kcal) * alimentoCarb.cantidad_base).toFixed(1);
                let cantFresco = ((kcalFresco / alimentoFresco.calorias_kcal) * alimentoFresco.cantidad_base).toFixed(1);

                return `**${nombreTiempo} (~${caloriasTiempo} kcal)**\n` +
                       `🥩 **Proteína:** ${alimentoPro.nombre} (${cantPro} ${alimentoPro.unidad_medida})\n` +
                       `🍚 **Guarnición:** ${alimentoCarb.nombre} (${cantCarb} ${alimentoCarb.unidad_medida})\n` +
                       `🍏 **Fresco:** ${alimentoFresco.nombre} (${cantFresco} ${alimentoFresco.unidad_medida})\n\n`;
            };

            let mensajeDieta = `¡Tienes toda la razón! Un cuerpo fitness se construye con buenas proteínas. Para tus **${caloriasMeta} kcal**, he armado un menú balanceado (Proteína + Guarnición + Fresco):\n\n`;

            mensajeDieta += armarTiempoComida("🌅 Desayuno", 0.30);
            mensajeDieta += armarTiempoComida("🍲 Comida", 0.40);
            mensajeDieta += armarTiempoComida("🌙 Cena", 0.30);

            mensajeDieta += `¿Qué te parece este combo? 💪 ¿Quieres registrarlo o pasamos a tu rutina de ejercicios?`;

            return res.json({ fulfillmentText: mensajeDieta });
        }
        // 🔵 PUENTE PARA LOS EJERCICIOS
        else if (intentName.includes('elegir_ejercicio')) {
            // 1. Obtener datos del usuario (Objetivo y Nivel)
            const userQuery = await pool.query(
                `SELECT objetivo_actual, nivel_actividad FROM historial_medidas WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`, 
                [id_usuario]
            );

            const { objetivo_actual, nivel_actividad } = userQuery.rows[0];

            // 🧠 TU LÓGICA DE NIVELES:
            let cantidadEjercicios = 2; // Default principiante
            if (nivel_actividad.toLowerCase().includes('intermedio')) cantidadEjercicios = 3;
            if (nivel_actividad.toLowerCase().includes('avanzado')) cantidadEjercicios = 4;

            // 2. Buscamos en la DB con el LIMIT dinámico según su nivel
            const ejerciciosQuery = await pool.query(
                `SELECT nombre, grupo_muscular, series_sugeridas, repeticiones_sugeridas, descripcion 
                 FROM cat_ejercicios 
                 WHERE objetivo_enfocado ILIKE $1 
                 ORDER BY RANDOM() LIMIT $2`, 
                [`%${objetivo_actual.split(' ')[0]}%`, cantidadEjercicios]
            );

            // 3. Armamos el mensaje
            let rutinaMsg = `¡Perfecto! Como eres **${nivel_actividad}**, he preparado una rutina de **${cantidadEjercicios} ejercicios** para tu meta de ${objetivo_actual}:\n\n`;

            ejerciciosQuery.rows.forEach(ej => {
                rutinaMsg += `💪 **${ej.nombre}** (${ej.grupo_muscular})\n`;
                rutinaMsg += `   🔢 ${ej.series_sugeridas} series de ${ej.repeticiones_sugeridas} reps\n`;
                rutinaMsg += `   📝 ${ej.descripcion}\n\n`;
            });

            return res.json({ fulfillmentText: rutinaMsg });
        }

        // 🟡 SI NO RECONOCE NADA
        return res.json({ 
            fulfillmentText: `Webhook activo pero intent desconocido. El intent fue: "${intentName}"` 
        });

    } catch (error) {
        console.error("❌ ERROR WEBHOOK:", error.message);
        return res.json({ fulfillmentText: "Hubo un error en los cálculos, pero el bot sigue vivo." });
    }
};

module.exports = { enviarMensajeADialogflow, manejarEvaluacion };