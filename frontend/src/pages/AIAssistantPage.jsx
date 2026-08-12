import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AlertBanner from '../components/ui/AlertBanner';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/ToastContext';
import API from '../services/api';
import { 
  Bot, 
  Send, 
  User, 
  ShieldAlert, 
  Sparkles, 
  HeartPulse, 
  Flame, 
  Car, 
  HelpCircle, 
  ArrowRight, 
  PhoneCall, 
  Navigation, 
  Users, 
  MapPin, 
  BookOpen,
  Info,
  Shield,
  RefreshCw
} from 'lucide-react';

export default function AIAssistantPage() {
  const { addToast } = useToast();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your **SafeSphere AI Safety Assistant**.\n\nI can help you navigate the app, guide you through emergency protocols, answer first-aid questions, or assist you in setting up Safe Journey tracking.\n\nHow can I help keep you safe today?",
      provider: 'SafeSphere Engine',
      disclaimer: "Notice: SafeSphere AI is an informational guide. It is not an emergency dispatch agency and does not provide medical diagnoses. In active danger, trigger SOS or dial official emergency services (112/100/102/101)."
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // 6 Required Preset Questions from prompt
  const presetQuestions = [
    { 
      label: 'What should I do during an emergency?', 
      prompt: 'What should I do during an emergency?', 
      icon: ShieldAlert,
      category: 'EMERGENCY' 
    },
    { 
      label: 'How do I send an SOS?', 
      prompt: 'How do I send an SOS?', 
      icon: Shield,
      category: 'APP_GUIDE' 
    },
    { 
      label: 'How do I add a trusted contact?', 
      prompt: 'How do I add a trusted contact?', 
      icon: Users,
      category: 'APP_GUIDE' 
    },
    { 
      label: 'Where can I find nearby assistance?', 
      prompt: 'Where can I find nearby assistance?', 
      icon: MapPin,
      category: 'LOCATION' 
    },
    { 
      label: 'What is Safe Journey?', 
      prompt: 'What is Safe Journey?', 
      icon: Navigation,
      category: 'APP_GUIDE' 
    },
    { 
      label: 'What first-aid resources are available?', 
      prompt: 'What first-aid resources are available?', 
      icon: HeartPulse,
      category: 'HEALTH' 
    }
  ];

  // Auto scroll chat to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
            provider: res.data.provider,
            actionLink: res.data.actionLink,
            actionLabel: res.data.actionLabel,
            disclaimer: res.data.disclaimer
          }
        ]);
      }
    } catch (err) {
      const isRateLimit = err.message?.includes('Rate limit') || err.message?.includes('429');
      const errorMessage = isRateLimit
        ? 'Rate limit reached: You have sent too many AI requests. Please wait a few minutes or use the SOS button for immediate help.'
        : 'The AI Safety Assistant is currently experiencing connection difficulty. For immediate safety, please use the SOS button or contact emergency services (112/100/102).';

      addToast({ type: 'warning', title: 'AI Assistant Notice', message: errorMessage });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **System Notice:** ${errorMessage}`,
          provider: 'SafeSphere System Guard'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <PageHeader
        title="AI Safety Assistant"
        subtitle="Intelligent personal safety advice, app navigation guide, and emergency response protocols"
        icon={Bot}
        badge={<Badge variant="indigo" size="sm" icon={Sparkles}>AI Powered 24/7</Badge>}
      />

      {/* Prominent Emergency Action Top Banner */}
      <AlertBanner type="danger" title="🚨 ARE YOU IN IMMEDIATE DANGER?">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1.5">
          <p className="text-xs text-red-900 font-medium">
            Do not rely solely on text advice during active threats. Dispatch Emergency SOS or dial hotlines immediately.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/">
              <Button variant="danger" size="sm" icon={ShieldAlert}>
                Dispatch SOS Now
              </Button>
            </Link>
            <a href="tel:112">
              <Button variant="outline" size="sm" icon={PhoneCall}>
                Call 112
              </Button>
            </a>
          </div>
        </div>
      </AlertBanner>

      {/* Quick Questions Chips Panel */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Frequently Asked Safety & App Questions
            </CardTitle>
            <span className="text-[11px] font-semibold text-slate-600">Click any topic to ask</span>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {presetQuestions.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  onClick={() => handleSendMessage(q.prompt)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-left text-xs font-bold text-slate-800 hover:text-indigo-900 transition-all flex items-center space-x-2.5 group shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-white group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white border border-slate-200 group-hover:border-indigo-600 transition-colors flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="line-clamp-2">{q.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Interactive Chat Window */}
      <Card className="flex flex-col h-[560px] shadow-sm">
        
        <CardHeader className="py-3.5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">SafeSphere Virtual Assistant</h3>
                <p className="text-[10px] text-slate-600 font-semibold">Active Session • Ready to assist</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="xs"
              icon={RefreshCw}
              onClick={() => {
                setMessages([
                  {
                    sender: 'bot',
                    text: "Chat cleared. How can I help keep you safe today?",
                    provider: 'SafeSphere Engine'
                  }
                ]);
              }}
            >
              Clear Chat
            </Button>
          </div>
        </CardHeader>

        {/* Messages Stream Container */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 border border-indigo-200 shadow-2xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs space-y-3'
                }`}
              >
                {/* Formatted Message Text */}
                <div className="whitespace-pre-line font-sans">{msg.text}</div>

                {/* Direct App Navigation CTA Button */}
                {msg.actionLink && msg.actionLabel && (
                  <div className="pt-2">
                    <Link to={msg.actionLink}>
                      <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                        {msg.actionLabel}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Source Provider & Disclaimer Footer */}
                {msg.sender === 'bot' && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    {msg.provider && (
                      <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold">
                        <span>Response Source: <strong className="text-indigo-600">{msg.provider}</strong></span>
                      </div>
                    )}
                    {msg.disclaimer && (
                      <p className="text-[10px] text-slate-600 leading-tight italic">
                        {msg.disclaimer}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-600 font-bold p-3 bg-white border border-slate-200 rounded-xl max-w-xs shadow-2xs animate-pulse">
              <Bot className="w-4 h-4" />
              <span>Analyzing safety knowledge base...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Bar Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask any safety question, first aid advice, or app navigation guide..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !inputPrompt.trim()}
              icon={Send}
            >
              Send
            </Button>
          </form>
          <p className="text-[10px] text-center text-slate-600 font-medium mt-2">
            SafeSphere AI provides safety guidance. Not a substitute for 112/100 emergency services.
          </p>
        </div>

      </Card>

    </div>
  );
}
