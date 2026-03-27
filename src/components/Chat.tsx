import React, { FC, useState, FormEvent, useRef, useEffect } from 'react';
import { Send, Sparkles, User, X, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const Chat: FC<ChatProps> = ({ onSendMessage, messages, isTyping, isOpen, onToggle }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-4 max-w-[calc(100vw-2rem)]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[380px] max-w-full h-[550px] max-h-[calc(100vh-120px)] bg-[#141414] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-white">AI Assistant</h2>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest">Foundation Intelligence</p>
                </div>
              </div>
              <button 
                onClick={onToggle}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-white/10' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' ? 'bg-white/5 text-white/80' : 'bg-white/10 text-white'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 border-t border-white/10 bg-[#0a0a0a]">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about city coverage..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 pr-12 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-emerald-400 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-white/10 text-white' : 'bg-emerald-500 text-black shadow-emerald-500/20'
        }`}
      >
        {isOpen ? <X className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
      </motion.button>
    </div>
  );
};
