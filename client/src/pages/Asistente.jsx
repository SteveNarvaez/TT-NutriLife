import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Asistente = () => {
  const [messages, setMessages] = useState([
    { text: "¡Bienvenido a NutriLife! 🍏 Estoy listo para ayudarte a alcanzar tu meta. ¿Qué prefieres hacer hoy? Puedes pedirme tu dieta personalizada, ver tu rutina de ejercicios o actualizar tus datos para ver tu progreso. ¡Solo escribelo!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // REFERENCIAS VITALES
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // <--- Nueva referencia para el input

  // Auto-scroll al fondo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // EFECTO DE FOCO INICIAL: Al cargar el componente, el cursor ya está listo
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    const textoMsg = input.trim();
    if (!textoMsg) return;

    const storedUserId = localStorage.getItem('userId');

    const userMsg = { text: textoMsg, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    
    setInput('');
    setLoading(true);

    // ⚡ TRUCO DE UX: Devolvemos el foco al input inmediatamente después de enviar
    inputRef.current?.focus();

    try {
      const res = await axios.post('http://localhost:3000/api/chatbot/message', { 
        message: textoMsg, 
        userId: storedUserId 
      });

      if (res.data && res.data.reply) {
        setMessages(prev => [...prev, { text: res.data.reply, sender: 'bot' }]);
      }
      
      // Devolvemos el foco nuevamente por si se perdió durante la carga
      inputRef.current?.focus();

    } catch (err) {
      console.error("Error en el chat:", err);
      setMessages(prev => [...prev, { text: "Error de conexión con el servidor.", sender: 'bot' }]);
    } finally {
      setLoading(false);
      // Foco final al terminar todo el proceso
      inputRef.current?.focus();
    }
  };

  return (
    /* h-full para que respete el tamaño que le da el Dashboard */
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Encabezado fijo */}
      <div className="bg-green-600 p-4 text-white flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
        <div>
          <h2 className="font-bold">Asistente Inteligente NutriLife</h2>
          <p className="text-xs text-green-100">Protocolos médicos de triaje</p>
        </div>
      </div>

      {/* Área de Mensajes con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages && messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-green-500 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start italic text-gray-400 text-sm animate-pulse">
            NutriLife está pensando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Texto - Siempre al fondo */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input
          ref={inputRef} // <--- CONECTAMOS LA REFERENCIA AQUÍ
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda nutricional..."
          className="flex-1 p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-400 transition"
          autoComplete="off"
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-md">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Asistente;