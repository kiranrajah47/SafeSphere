import React, { useState } from 'react';
import API from '../services/api';
import { Bot, Send, User, ShieldAlert, Sparkles, HeartPulse, Flame, Car } from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your SafeSphere AI Safety Guard. Ask me any questions regarding self-defense protocols, emergency first aid, night travel checklists, or disaster preparedness.',
      provider: 'SafeSphere Engine'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const quickTopics = [
    { label: 'Being Followed', prompt: 'I suspect someone is following me on foot.', icon: ShieldAlert },
    { label: 'Night Ride Safety', prompt: 'What safety steps should I follow when taking a cab late at night?', icon: Car },
    { label: 'First Aid Emergency', prompt: 'How do I handle severe bleeding or an unconscious person?', icon: HeartPulse },
    { label: 'Fire Safety', prompt: 'What are the key fire evacuation protocols?', icon: Flame }
  ];

  const handleSendMessage = async (customPrompt = null) => {
    const query = customPrompt || inputPrompt;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const res = await API.post('/ai/safety-advice', { prompt: query });
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.advice,
            provider: res.data.provider
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered an error providing advice. Please stay safe and trigger Emergency SOS if you are in immediate danger.',
          provider: 'System Error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center space-x-4">
        <div className="p-3.5 bg-teal-500/10 text-teal-400 rounded-2xl border border-teal-500/20">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            AI Safety Guard & Emergency Assistant
            <Sparkles className="w-4 h-4 text-teal-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Instant AI-guided advice for personal safety, self-defense tactics, travel protocols, and medical emergency first aid.
          </p>
        </div>
      </div>

      {/* Quick Topic Chips */}
      <div className="flex flex-wrap gap-2">
        {quickTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.label}
              onClick={() => handleSendMessage(topic.prompt)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-2 transition-all"
            >
              <Icon className="w-4 h-4 text-teal-400" />
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Conversation Box */}
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 h-[480px] flex flex-col justify-between shadow-2xl">
        
        {/* Messages Stream */}
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.provider && (
                  <span className="block text-[10px] text-teal-400/80 font-semibold mt-2 border-t border-slate-800 pt-1">
                    Source: {msg.provider}
                  </span>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center flex-shrink-0 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-teal-400 font-semibold animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analyzing safety guidance...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-4 border-t border-slate-800/80 flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Type your safety or emergency question here..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-teal-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-teal-600/30 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>

    </div>
  );
}
