import React, { useState, useRef, useEffect } from 'react';
import { AvatarConfig, WardrobeItem } from '../types';
import { Sparkles, Send, Bot, User, RefreshCw, Lightbulb, Compass, Palette, ShieldCheck } from 'lucide-react';

interface StylistChatProps {
  config: AvatarConfig;
  wardrobe: WardrobeItem[];
  currentOutfit?: {
    topwear: WardrobeItem | null;
    bottomwear: WardrobeItem | null;
    footwear: WardrobeItem | null;
    accessory: WardrobeItem | null;
  };
  theme?: 'light' | 'dark' | 'neon';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  aiGenerated?: boolean;
}

export const StylistChat: React.FC<StylistChatProps> = ({
  config,
  wardrobe,
  currentOutfit,
  theme = 'dark',
}) => {
  const isBoy = config.gender === 'boy';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'stylist',
      text: `Hello ${config.userName || 'there'}! I am your NeoSet AI Fashion Stylist. I'm calibrated to your ${config.height} ${config.build} body proportions, ${config.skinToneName} skin tone, and your ${isBoy ? 'masculine' : 'feminine'} wardrobe collection of ${wardrobe.length} pieces.\n\nAsk me anything about color harmony, styling proportions, dress codes, or what to wear today!`,
      timestamp: 'Just now',
      aiGenerated: true,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const promptSuggestions = isBoy
    ? [
        `What colors flatter my ${config.skinToneName} skin tone best?`,
        `How do I style a sharp smart-casual look for work?`,
        `Can I wear white sneakers with dark tapered denim?`,
        `What jacket cuts flatter an ${config.build} build?`,
      ]
    : [
        `What colors complement my ${config.skinToneName} undertones?`,
        `How should I balance proportions for an ${config.build} silhouette?`,
        `Give me an effortless chic Parisian daytime outfit`,
        `How to elevate sneakers with tailored trousers?`,
      ];

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          gender: config.gender || 'girl',
          build: config.build || 'average',
          skinTone: config.skinToneName || 'Natural',
          currentOutfit: currentOutfit,
          wardrobeCount: wardrobe.length,
        }),
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      const stylistMsg: ChatMessage = {
        id: `stylist-${Date.now()}`,
        sender: 'stylist',
        text: data.reply || 'Your outfit combination has great visual flow.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiGenerated: data.aiGenerated,
      };

      setMessages((prev) => [...prev, stylistMsg]);
    } catch (err) {
      // Fallback response if network fails
      const fallbackMsg: ChatMessage = {
        id: `stylist-${Date.now()}`,
        sender: 'stylist',
        text: `With your ${config.skinToneName} complexion and ${config.build} frame, classic neutrals like navy, rich espresso, camel, and crisp ivory create effortless harmony. Use the 60-30-10 color proportion rule to balance your outfit!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiGenerated: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === 'light';
  const isNeon = theme === 'neon';

  return (
    <div
      className={`rounded-3xl border flex flex-col h-[600px] overflow-hidden shadow-2xl transition-all ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900'
          : isNeon
          ? 'bg-neutral-950 border-cyan-500/30 text-neutral-100 shadow-[0_0_25px_rgba(6,182,212,0.12)]'
          : 'bg-neutral-900 border-neutral-800 text-neutral-100'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between gap-3 ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200'
            : isNeon
            ? 'bg-neutral-950 border-cyan-500/30'
            : 'bg-neutral-950/80 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#244837] flex items-center justify-center text-white shadow-md shadow-[#244837]/20 border border-[#C5A880]/30">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold tracking-tight">Interactive AI Stylist</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#244837]/15 text-[#244837] dark:text-[#C5A880] font-bold uppercase">
                Gemini Powered
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Personalized for {config.userName || 'You'} ({isBoy ? 'Boy Profile' : 'Girl Profile'} • {config.build} build)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <span
            className="w-3 h-3 rounded-full border border-black/20"
            style={{ backgroundColor: config.skinTone }}
          />
          <span className="text-[11px]">{config.skinToneName}</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? 'bg-[#244837] text-white'
                    : isLight
                    ? 'bg-neutral-200 text-neutral-700'
                    : 'bg-neutral-800 text-[#C5A880]'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[#244837] text-white rounded-tr-none shadow-md shadow-[#244837]/10'
                    : isLight
                    ? 'bg-neutral-100 text-neutral-800 rounded-tl-none border border-neutral-200 shadow-sm'
                    : isNeon
                    ? 'bg-neutral-900 border border-cyan-500/30 text-neutral-100 rounded-tl-none shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'bg-neutral-850 text-neutral-200 rounded-tl-none border border-neutral-800'
                }`}
              >
                {m.text}
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-[#C5A880]' : 'text-neutral-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.aiGenerated && !isUser && (
                    <span className="font-semibold text-[#B38F5F] dark:text-[#C5A880]">Gemini AI</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-neutral-800 text-[#C5A880] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div
              className={`rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2 ${
                isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-850 text-neutral-400'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#244837] dark:text-[#C5A880]" />
              <span>Analyzing proportions, colors, and wardrobe...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div
        className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
          isLight ? 'bg-neutral-50/50 border-neutral-200' : 'bg-neutral-950/40 border-neutral-850'
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Ask:
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
            className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition active:scale-95 cursor-pointer shrink-0 ${
              isLight
                ? 'border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700'
                : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`p-3 sm:p-4 border-t flex items-center gap-2 ${
          isLight
            ? 'bg-neutral-50 border-neutral-200'
            : isNeon
            ? 'bg-neutral-950 border-cyan-500/30'
            : 'bg-neutral-950 border-neutral-800'
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about styling, color harmony, or outfit advice...`}
          disabled={loading}
          className={`flex-1 px-4 py-2.5 rounded-2xl text-xs focus:outline-none transition border ${
            isLight
              ? 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[#244837]'
              : 'bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:border-[#C5A880]'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-2xl bg-[#244837] hover:bg-[#1C382B] disabled:opacity-40 active:scale-95 text-white flex items-center justify-center transition shadow-md shadow-[#244837]/20 shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
