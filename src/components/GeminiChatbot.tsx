import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, X, Bot, Send, User, Sparkles, ArrowRight, Minimize2, Maximize2 } from 'lucide-react';
import { MessageLoading } from '@/components/ui/message-loading';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isFallback?: boolean;
}

interface GeminiChatbotProps {
  currentRole?: string;
  lang?: 'en' | 'hi';
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ currentRole = 'CITIZEN', lang = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: lang === 'hi' 
        ? 'नमस्ते! मैं झारखंड राज्य नवाचार केंद्र (JH Innovation Hub) का AI सहायक हूँ। मैं नागरिक समस्याओं को हल करने, शोध प्रस्ताव बनाने, और सरकारी प्रक्रियाओं को समझने में आपकी सहायता कर सकता हूँ।' 
        : 'Hello! I am the JH Innovation Hub AI Civic Assistant. I can help you draft problem submissions, design academic prototypes, structure milestone plans, and understand administrative workflows.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CITIZEN' | 'RESEARCHER' | 'GOVERNMENT'>('CITIZEN');
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync selected role when app persona changes
  useEffect(() => {
    if (currentRole === 'GOVERNMENT_OFFICER' || currentRole === 'GOVERNMENT') {
      setSelectedRole('GOVERNMENT');
    } else if (currentRole === 'FACULTY' || currentRole === 'STUDENT' || currentRole === 'UNIVERSITY_ADMIN') {
      setSelectedRole('RESEARCHER');
    } else {
      setSelectedRole('CITIZEN');
    }
  }, [currentRole]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');

    const newMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const historyToSend = [...messages, newMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyToSend,
          role: selectedRole,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error('API server is initializing or unavailable. Please try again.');
      }

      const data = await res.json();
      if (data && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFallback: data.provider === 'mock_simulated',
          }
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (err: any) {
      console.error('Chat API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: lang === 'hi'
            ? 'क्षमा करें, आपके अनुरोध को पूरा करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an issue connecting to the AI brain. Please try again in a few moments.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined prompts to speed up interaction
  const suggestionPrompts = {
    CITIZEN: [
      { text: lang === 'hi' ? '💧 पेयजल की समस्या' : '💧 Waterlogging & Drainage', query: 'My school area gets flooded during peak monsoon months' },
      { text: lang === 'hi' ? '🌾 फसल रोग' : '🌾 Crop Protection', query: 'Pest infestation damaging paddy crops in Bundu' },
    ],
    RESEARCHER: [
      { text: '📟 Suggest IoT Stack', query: 'Recommend hardware, microcontroller, and sensor stack to monitor water head levels' },
      { text: '📋 Milestone Draft', query: 'Help me draft a 4-phase milestone proposal for a solar agro-tech telemetry node' },
    ],
    GOVERNMENT: [
      { text: '📊 SLA Escalations', query: 'How should we audit delayed projects and prioritize resource routing?' },
      { text: '📁 Trend Summary', query: 'Summarize crop disease trends across Ranchi and East Singhbhum' },
    ],
  };

  const applySuggestion = (query: string) => {
    setInputValue(query);
  };

  return (
    <>
      {/* Floating Circle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="gemini-chatbot-trigger"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-black text-white hover:bg-slate-900 border-2 border-black font-black uppercase tracking-widest text-xs p-4 flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_#ea580c] cursor-pointer"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-orange-500" />
          ) : (
            <>
              <Bot className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="hidden sm:inline font-mono tracking-widest">JH AI Assist</span>
            </>
          )}
          {/* Animated Glow Pip */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-600"></span>
          </span>
        </motion.button>
      </div>

      {/* Floating Collapsible Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="gemini-chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? '92vw' : '400px',
              height: isMaximized ? '82vh' : '550px',
            }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed bottom-24 right-6 z-40 bg-white border border-slate-200 flex flex-col shadow-xl overflow-hidden max-w-[94vw] overscroll-contain`}
            style={{ touchAction: 'pan-y' }}
          >
            {/* Header */}
            <div className="bg-white text-black p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-orange-600 p-1.5 border border-white">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider font-mono flex items-center gap-1.5">
                    JH CIVIC AI ENGINE
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">State Innovation Intelligence</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)} 
                  className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-transparent hover:border-slate-700"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-transparent hover:border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Thread Stream */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 font-sans custom-scrollbar overscroll-contain"
              style={{ touchAction: 'pan-y' }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="bg-black text-white p-1.5 shrink-0 border border-slate-300 mt-1">
                      <Bot className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                  )}

                  <div className={`max-w-[82%] p-3.5 border text-xs leading-relaxed space-y-2
                    ${m.role === 'user'
                      ? 'bg-black text-white border-slate-300 font-semibold shadow-[2px_2px_0px_#ea580c]'
                      : 'bg-white text-black border-slate-300 shadow-[2px_2px_0px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center justify-between gap-4 text-[9px] uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1 mb-1.5">
                      <span className="font-black flex items-center gap-1">
                        {m.role === 'user' ? (
                          <>
                            <User className="w-2.5 h-2.5 text-orange-400" />
                            User Persona
                          </>
                        ) : (
                          <>
                            <Bot className="w-2.5 h-2.5 text-orange-500" />
                            {selectedRole} Advisor
                          </>
                        )}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>


                    {/* Content parsed with clean formatting fallback */}
                    <div className="whitespace-pre-wrap font-medium font-sans prose prose-slate">
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && <MessageLoading />}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Panel */}
            <div className="bg-slate-100 p-2 border-t border-slate-200 flex flex-wrap gap-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 block w-full mb-1 px-1">
                Suggested Prompts
              </span>
              {suggestionPrompts[selectedRole].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => applySuggestion(s.query)}
                  className="bg-white hover:bg-black text-black hover:text-white border border-slate-300 hover:border-slate-300 px-2.5 py-1 text-[10px] font-semibold transition flex items-center gap-1"
                >
                  <span>{s.text}</span>
                  <ArrowRight className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t-2 border-slate-300 bg-white flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  lang === 'hi' 
                    ? 'अपनी समस्या या प्रश्न यहाँ टाइप करें...' 
                    : `Ask AI ${selectedRole.toLowerCase()} assistant...`
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-slate-300 font-semibold"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-black hover:bg-slate-800 text-white disabled:bg-slate-300 disabled:text-slate-400 p-2 border border-slate-300 transition shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4 text-orange-500" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
