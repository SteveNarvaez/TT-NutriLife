import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { IconChat, IconSend, IconSpark } from './Icons';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "¡Hola! Soy tu asistente de NutriLife. ¿En qué puedo ayudarte hoy?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Estado para el indicador de carga
  
  const scrollRef = useRef(null);

  // Auto-scroll al recibir o enviar mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const messageText = input.trim();
    if (!messageText) return;

    // 1. Obtener el ID del usuario dinámicamente desde el almacenamiento local
    // Asegúrate de guardar 'userId' en localStorage cuando el usuario haga login
    const userId = localStorage.getItem('userId') || 'anonimo'; 

    const userMessage = { text: messageText, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true); // Activamos el indicador de "bot escribiendo"

    try {
      // 2. Enviamos tanto el mensaje como el userId al backend
      const storedId = localStorage.getItem('userId');
const response = await axios.post('http://localhost:3000/api/chatbot/message', { 
  message: input,
  userId: storedId // <--- Lo enviamos al servidor
});

      const botReply = { 
        text: response.data.reply, 
        sender: 'bot' 
      };
      
      setMessages((prev) => [...prev, botReply]);

    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      setMessages((prev) => [...prev, { 
        text: "Error de conexión. Verifica que el servidor esté encendido.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsTyping(false); // Apagamos el indicador de carga
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente'}
        aria-expanded={isOpen}
        className="bg-pine-800 text-white rounded-full shadow-float hover:bg-pine-700 transition-all flex items-center justify-center w-14 h-14 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        ) : (
          <IconChat size={24} />
        )}
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="absolute bottom-[4.5rem] right-0 w-[min(22rem,calc(100vw-2.5rem))] h-[460px] bg-paper border border-line rounded-2xl shadow-float flex flex-col overflow-hidden animate-msg origin-bottom-right">
          
          {/* Header */}
          <div className="bg-pine-900 text-white px-4 py-3.5 flex items-center gap-3">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 text-leaf-200">
              <IconSpark size={17} />
            </span>
            <div className="leading-tight">
              <p className="font-display font-semibold">Asistente NutriLife</p>
              <p className="text-xs text-leaf-100/70 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-leaf-400" />
                En línea
              </p>
            </div>
          </div>
          
          {/* Cuerpo del Chat */}
          <div className="flex-1 p-4 overflow-y-auto scroll-soft flex flex-col space-y-3 bg-mist/60" aria-live="polite">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm animate-msg ${
                  msg.sender === 'user' 
                    ? 'bg-pine-800 text-white self-end rounded-2xl rounded-br-md' 
                    : 'bg-paper text-ink self-start rounded-2xl rounded-bl-md border border-line'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Indicador de escribiendo */}
            {isTyping && (
              <div className="bg-paper self-start px-3.5 py-3 rounded-2xl rounded-bl-md border border-line flex gap-1.5 shadow-sm animate-msg" role="status" aria-label="NutriLife está escribiendo">
                <span className="w-1.5 h-1.5 bg-pine-600 rounded-full animate-dot"></span>
                <span className="w-1.5 h-1.5 bg-pine-600 rounded-full animate-dot [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-pine-600 rounded-full animate-dot [animation-delay:0.3s]"></span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Área de Input */}
          <div className="p-3 border-t border-line bg-paper flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              aria-label="Mensaje para el asistente"
              className="field flex-1 min-w-0 !py-2.5 text-sm"
              placeholder="Pregunta sobre tu dieta…"
            />
            <button 
              onClick={sendMessage} 
              disabled={isTyping}
              aria-label="Enviar mensaje"
              className="btn-primary !p-2.5 shrink-0"
            >
              <IconSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
