import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IconSpark, IconSend } from '../components/Icons';

const Asistente = () => {
  const [messages, setMessages] = useState([
    { text: "¡Bienvenido a NutriLife! Estoy listo para ayudarte a alcanzar tu meta. ¿Qué prefieres hacer hoy? Puedes pedirme tu dieta personalizada, ver tu rutina de ejercicios o actualizar tus datos para ver tu progreso. ¡Solo escribe empezar!", sender: 'bot' }
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

  useEffect(scrollToBottom, [messages, loading]);

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
    <div className="flex flex-col h-full bg-paper rounded-2xl border border-line shadow-panel overflow-hidden">
      
      {/* Encabezado fijo */}
      <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0 border-b border-line bg-paper">
        <div className="w-10 h-10 rounded-xl bg-pine-800 text-leaf-200 grid place-items-center shrink-0">
          <IconSpark size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-pine-900 leading-tight">Asistente inteligente NutriLife</h2>
          <p className="text-sm text-ink-soft">Protocolos médicos de triaje</p>
        </div>
        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-pine-700 bg-leaf-50 border border-leaf-200 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-leaf-500" />
          En línea
        </span>
      </div>

      {/* Área de Mensajes con scroll independiente */}
      <div className="flex-1 overflow-y-auto scroll-soft px-4 sm:px-6 py-6 space-y-4 bg-mist/60" aria-live="polite">
        {messages && messages.map((msg, index) => (
          <div key={index} className={`flex animate-msg ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender !== 'user' && (
              <div className="w-7 h-7 mr-2.5 mt-0.5 rounded-lg bg-pine-800 text-leaf-200 grid place-items-center shrink-0">
                <IconSpark size={14} />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
              msg.sender === 'user' 
                ? 'bg-pine-800 text-white rounded-2xl rounded-br-md shadow-sm' 
                : 'bg-paper text-ink border border-line rounded-2xl rounded-tl-md shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-msg" role="status" aria-label="NutriLife está escribiendo">
            <div className="w-7 h-7 mr-2.5 mt-0.5 rounded-lg bg-pine-800 text-leaf-200 grid place-items-center shrink-0">
              <IconSpark size={14} />
            </div>
            <div className="bg-paper border border-line rounded-2xl rounded-tl-md px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-pine-600 animate-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-pine-600 animate-dot [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-pine-600 animate-dot [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Texto - Siempre al fondo */}
      <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-paper border-t border-line flex gap-2.5 flex-shrink-0">
        <input
          ref={inputRef} // <--- CONECTAMOS LA REFERENCIA AQUÍ
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda nutricional…"
          aria-label="Mensaje para el asistente"
          className="field flex-1 min-w-0"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary px-4 sm:px-5 shrink-0" aria-label="Enviar mensaje">
          <span className="hidden sm:inline">Enviar</span>
          <IconSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default Asistente;
