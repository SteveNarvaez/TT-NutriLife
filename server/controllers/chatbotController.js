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

        // [MANTENEMOS EL BLOQUE DE EVALUACION INICIAL EXACTAMENTE IGUAL...]
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
        // --- BIENVENIDA PARA USUARIOS YA REGISTRADOS ---
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
        // --- PUENTE PARA LA DIETA ---
        else if (intentName.includes('elegir_dieta')) {
            console.log(`🥗 Generando menú PRO para el ID ${id_usuario}`);

            // 1. AÑADIMOS 'peso_kg' A LA CONSULTA
            const userQuery = await pool.query(
                `SELECT tmb_calculado, objetivo_actual, peso_kg FROM historial_medidas WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`,
                [id_usuario]
            );

            if (userQuery.rows.length === 0) {
                return res.json({ fulfillmentText: "No encontré tu evaluación previa. Escribe 'evaluación' para empezar desde cero." });
            }

            const { tmb_calculado, objetivo_actual, peso_kg } = userQuery.rows[0];
            const caloriasMeta = Number(tmb_calculado);
            const objLimpio = objetivo_actual.toLowerCase();

            // 🧠 2. LÓGICA MAESTRA DE MACRONUTRIENTES
            let protGramos, grasaGramos, carbGramos, tipoDieta;

            if (objLimpio.includes('perder') || objLimpio.includes('definicion') || objLimpio.includes('grasa')) {
                tipoDieta = "Definición (Pérdida de grasa) 🔥";
                protGramos = peso_kg * 2.2; // Alta proteína
                grasaGramos = peso_kg * 0.8; // Grasas bajas
            } 
            else if (objLimpio.includes('ganar') || objLimpio.includes('volumen') || objLimpio.includes('masa')) {
                tipoDieta = "Volumen (Ganar masa) 📈";
                protGramos = peso_kg * 2.0; // Proteína suficiente
                grasaGramos = peso_kg * 1.0; // Grasas moderadas
            } 
            else {
                tipoDieta = "Mantenimiento (Recomposición) ⚖️";
                protGramos = peso_kg * 1.8; // Proteína media-alta
                grasaGramos = peso_kg * 1.0; // Grasas moderadas
            }

            // Calculamos los carbohidratos con las calorías restantes
            carbGramos = (caloriasMeta - (protGramos * 4) - (grasaGramos * 9)) / 4;

            // Redondeamos los gramos
            protGramos = Math.round(protGramos);
            grasaGramos = Math.round(grasaGramos);
            carbGramos = Math.round(carbGramos);

            // Calculamos qué porcentaje de la dieta representa cada macro para repartirlo en las comidas
            const pctProt = (protGramos * 4) / caloriasMeta;
            const pctCarb = (carbGramos * 4) / caloriasMeta;
            const pctGrasa = (grasaGramos * 9) / caloriasMeta;

            // 3. OBTENEMOS LOS ALIMENTOS DE LA BASE DE DATOS
            const comidaQuery = await pool.query(`SELECT * FROM catalogo_comida`);
            const alimentos = comidaQuery.rows;

            const proteinas = alimentos.filter(a => a.grupo_nutricional.toUpperCase() === 'AOA' || a.grupo_nutricional.toLowerCase().includes('prote'));
            
            let guarniciones = alimentos.filter(a => a.grupo_nutricional.toLowerCase().includes('cereal') || a.grupo_nutricional.toLowerCase().includes('leguminosa'));
            if (guarniciones.length === 0) guarniciones = alimentos.filter(a => a.grupo_nutricional.toUpperCase() !== 'AOA' && !a.grupo_nutricional.toLowerCase().includes('fruta'));

            let frescos = alimentos.filter(a => a.grupo_nutricional.toLowerCase().includes('fruta') || a.grupo_nutricional.toLowerCase().includes('verdura'));
            if (frescos.length === 0) frescos = guarniciones; 

            if (proteinas.length === 0) {
                return res.json({ fulfillmentText: "Necesito alimentos con el grupo 'AOA' en pgAdmin para armarte la dieta. ¡Revisa tu base!" });
            }

            const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

            // 4. GENERADOR DE COMIDAS (Ahora usando los porcentajes exactos del usuario)
            const armarTiempoComida = (nombreTiempo, porcentajeTiempo) => {
                const caloriasTiempo = Math.round(caloriasMeta * porcentajeTiempo);

                let alimentoPro = getRandomItem(proteinas);
                let alimentoCarb = getRandomItem(guarniciones);
                let alimentoFresco = getRandomItem(frescos);

                // Asignamos las calorías dinámicamente según la fase del usuario
                let kcalPro = caloriasTiempo * pctProt;
                let kcalCarb = caloriasTiempo * pctCarb;
                let kcalFresco = caloriasTiempo * pctGrasa; // Usamos las kcal de grasa/restantes para frescos y complementos

                let cantPro = ((kcalPro / alimentoPro.calorias_kcal) * alimentoPro.cantidad_base).toFixed(1);
                let cantCarb = ((kcalCarb / alimentoCarb.calorias_kcal) * alimentoCarb.cantidad_base).toFixed(1);
                let cantFresco = ((kcalFresco / alimentoFresco.calorias_kcal) * alimentoFresco.cantidad_base).toFixed(1);

                return `**${nombreTiempo} (~${caloriasTiempo} kcal)**\n` +
                       `🥩 **Proteína:** ${alimentoPro.nombre} (${cantPro} ${alimentoPro.unidad_medida})\n` +
                       `🍚 **Guarnición:** ${alimentoCarb.nombre} (${cantCarb} ${alimentoCarb.unidad_medida})\n` +
                       `🍏 **Fresco/Complemento:** ${alimentoFresco.nombre} (${cantFresco} ${alimentoFresco.unidad_medida})\n\n`;
            };

            // 5. ARMAMOS EL MENSAJE FINAL
            let mensajeDieta = `¡Menú listo! Según tu peso actual de **${peso_kg}kg**, estás en fase de **${tipoDieta}** con un límite de **${caloriasMeta} kcal**.\n\n`;
            
            mensajeDieta += `📊 **Tus Macros Diarios:**\n`;
            mensajeDieta += `🥩 Proteína: ${protGramos}g | 🍚 Carbs: ${carbGramos}g | 🥑 Grasas: ${grasaGramos}g\n\n`;
            
            mensajeDieta += `Aquí tienes tu menú distribuido:\n\n`;
            mensajeDieta += armarTiempoComida("🌅 Desayuno", 0.30);
            mensajeDieta += armarTiempoComida("🍲 Comida", 0.40);
            mensajeDieta += armarTiempoComida("🌙 Cena", 0.30);

            mensajeDieta += `¿Qué te parece este combo? 💪 Al final del día, cuéntame si lograste **respetar tu dieta** para registrarlo.`;

            return res.json({ fulfillmentText: mensajeDieta });
        }
        // 🔵 PUENTE PARA LOS EJERCICIOS (¡Nivel arreglado!)
        else if (intentName.includes('elegir_ejercicio')) {
            const userQuery = await pool.query(
                `SELECT objetivo_actual, nivel_actividad FROM historial_medidas WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`, 
                [id_usuario]
            );

            const { objetivo_actual, nivel_actividad } = userQuery.rows[0];

            // 🧠 LÓGICA DE NIVELES CORREGIDA:
            let cantidadEjercicios = 2; // Default principiante
            const nivelLimpiado = nivel_actividad.toLowerCase();
            
            // Ahora acepta "intermedio" o "moderado" para dar 3 ejercicios
            if (nivelLimpiado.includes('intermedio') || nivelLimpiado.includes('moderado')) {
                cantidadEjercicios = 3;
            } else if (nivelLimpiado.includes('avanzado') || nivelLimpiado.includes('intenso')) {
                cantidadEjercicios = 4;
            }

            const ejerciciosQuery = await pool.query(
                `SELECT nombre, grupo_muscular, series_sugeridas, repeticiones_sugeridas, descripcion 
                 FROM cat_ejercicios 
                 WHERE objetivo_enfocado ILIKE $1 
                 ORDER BY RANDOM() LIMIT $2`, 
                [`%${objetivo_actual.split(' ')[0]}%`, cantidadEjercicios]
            );

            let rutinaMsg = `¡Perfecto! Como tu nivel es **${nivel_actividad}**, he preparado una rutina de **${cantidadEjercicios} ejercicios** para tu meta de ${objetivo_actual}:\n\n`;

            ejerciciosQuery.rows.forEach(ej => {
                rutinaMsg += `💪 **${ej.nombre}** (${ej.grupo_muscular})\n`;
                rutinaMsg += `   🔢 ${ej.series_sugeridas} series de ${ej.repeticiones_sugeridas} reps\n`;
                rutinaMsg += `   📝 ${ej.descripcion}\n\n`;
            });

            // Preparando para la función de check-in que mencionaste
            rutinaMsg += `A darle con todo. Avísame cuando la termines para registrar tu progreso. 🔥`;

            return res.json({ fulfillmentText: rutinaMsg });
        }
        
        // 🟢 NUEVO: PUENTE PARA ACTUALIZAR MEDIDAS
        else if (intentName.includes('actualizar_medidas')) {
            return res.json({ 
                fulfillmentText: "¡Claro que sí! Para mantener tus gráficas precisas, dime: ¿Cuál es tu **peso actual** en kilos?" 
            });
        }

        // 🟡 SI NO RECONOCE NADA
// 💾 NUEVO: ATRAPAR EL NÚMERO Y GUARDARLO PARA LAS GRÁFICAS
        else if (intentName.includes('guardar_peso')) {
            const parametros = req.body.queryResult.parameters;
            
            // Dialogflow a veces guarda el número como "number" o "numero" o "peso". Lo atrapamos:
            const nuevoPeso = parametros.number || parametros.numero || parametros.peso; 

            if (!nuevoPeso) {
                return res.json({ fulfillmentText: "No logré captar el número. ¿Podrías repetirme solo tu peso en kilos? (Ejemplo: 89)" });
            }

            // 1. Buscamos sus últimos datos para no perder su altura ni sus metas
            const userQuery = await pool.query(
                `SELECT altura_cm, nivel_actividad, tmb_calculado, objetivo_actual 
                 FROM historial_medidas 
                 WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`, 
                [id_usuario]
            );

            if (userQuery.rows.length > 0) {
                const { altura_cm, nivel_actividad, tmb_calculado, objetivo_actual } = userQuery.rows[0];

                // 2. INSERTAMOS un nuevo registro (Esto crea el historial para que la gráfica suba o baje)
                await pool.query(
                    `INSERT INTO historial_medidas (id_usuario, peso_kg, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id_usuario, nuevoPeso, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual]
                );

                console.log(`📊 Nuevo peso registrado para ID ${id_usuario}: ${nuevoPeso}kg`);

                return res.json({ 
                    fulfillmentText: `¡Listo! He registrado tu nuevo peso de **${nuevoPeso} kg**. 📈 Tus gráficas se han actualizado exitosamente.\n\n¿Quieres que te muestre tu **dieta** ajustada o tu **rutina** de hoy?` 
                });
            } else {
                return res.json({ fulfillmentText: "Hubo un problema buscando tu perfil. Escribe 'inicio' para volver a empezar." });
            }
        }
// 👤 NUEVO: PUENTE PARA VER EL PERFIL DEL USUARIO
        else if (intentName.includes('ver_perfil')) {
            const userQuery = await pool.query(
                `SELECT peso_kg, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual 
                 FROM historial_medidas 
                 WHERE id_usuario = $1 ORDER BY id_medida DESC LIMIT 1`, 
                [id_usuario]
            );

            if (userQuery.rows.length > 0) {
                const { peso_kg, altura_cm, nivel_actividad, tmb_calculado, objetivo_actual } = userQuery.rows[0];
                
                let perfilMsg = `📋 **Tu Perfil NutriLife** 🍏\n\n`;
                perfilMsg += `⚖️ **Peso actual:** ${peso_kg} kg\n`;
                perfilMsg += `📏 **Estatura:** ${altura_cm} cm\n`;
                perfilMsg += `🏃 **Nivel:** ${nivel_actividad}\n`;
                perfilMsg += `🎯 **Objetivo:** ${objetivo_actual}\n`;
                perfilMsg += `🔥 **Meta Diaria:** ${tmb_calculado} kcal\n\n`;
                perfilMsg += `¿Qué te gustaría hacer ahora? Puedes pedir tu **dieta**, tu **rutina** o **actualizar tu peso**.`;

                return res.json({ fulfillmentText: perfilMsg });
            } else {
                return res.json({ fulfillmentText: "Aún no tengo un historial tuyo registrado. Escribe 'inicio' para hacer tu evaluación." });
            }
        }
        // 🏆 NUEVO: REGISTRO DE ENTRENAMIENTO (CHECK-IN)
        else if (intentName.includes('registrar_entrenamiento')) {
            // 1. Guardamos el check-in con la fecha de hoy automáticamente
            await pool.query(
                `INSERT INTO progreso_rutinas (id_usuario) VALUES ($1)`,
                [id_usuario]
            );

            // 2. Contamos cuántos días ha entrenado en total para motivarlo
            const conteoQuery = await pool.query(
                `SELECT COUNT(*) as total_entrenamientos FROM progreso_rutinas WHERE id_usuario = $1`,
                [id_usuario]
            );

            const total = conteoQuery.rows[0].total_entrenamientos;

            // 3. Armamos el mensaje de recompensa
            let premioMsg = `¡Felicidades! 🎉 He registrado tu entrenamiento de hoy.\n\n`;
            
            if (total === 1) {
                premioMsg += `🔥 Este es tu **primer entrenamiento** registrado. ¡El comienzo de un gran cambio!\n\n`;
            } else {
                premioMsg += `🔥 Llevas un total de **${total} entrenamientos** completados. ¡Tu constancia está rindiendo frutos!\n\n`;
            }

            premioMsg += `Descansa bien, hidrátate y no olvides tu dieta. ¡Nos vemos en tu próximo entrenamiento!`;

            return res.json({ fulfillmentText: premioMsg });
        }
        // 🟡 SI NO RECONOCE NADA (¡ESTE SIEMPRE VA AL FINAL!)
        return res.json({ 
            fulfillmentText: `Webhook activo pero intent desconocido. El intent fue: "${intentName}"` 
        });

    } catch (error) {
        console.error("❌ ERROR WEBHOOK:", error.message);
        return res.json({ fulfillmentText: "Hubo un error en los cálculos, pero el bot sigue vivo." });
    }
};

module.exports = { enviarMensajeADialogflow, manejarEvaluacion };