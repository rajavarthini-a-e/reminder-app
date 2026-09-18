import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Mic,
  MicOff,
} from 'lucide-react';
import { MentorChatMessage } from '@shared/types';
import { fetchChatMessages, sendChatMessage } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import clsx from 'clsx';

export const MentorChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, openVerification } = useAppStore();
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const hasSpeechRecognition = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    try {
      const data = await fetchChatMessages();
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Seed initial friendly mentor greeting matching Mockup Screen 13
        setMessages([
          {
            id: 'm-1',
            sender: 'mentor',
            text: "Hey 🌱 ready for today's mission?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      setMessages([
        {
          id: 'm-1',
          sender: 'mentor',
          text: "Hey 🌱 ready for today's mission?",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: MentorChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const resp = await sendChatMessage(text);
      if (resp && resp.mentorMessage) {
        setMessages((prev) => [...prev, resp.mentorMessage]);
      }
    } catch (err) {
      // Heuristic fallback response from Momo
      setTimeout(() => {
        let reply = "Let's earn just one leaf together — 15 minutes of focus!";
        if (text.toLowerCase().includes('tired')) {
          reply = "I hear you. Let's do just 15 minutes on the core query, and we'll call it a day.";
        } else if (text.toLowerCase().includes('test')) {
          reply = "Question: What does a LEFT JOIN return for rows with no match in the right table?";
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            sender: 'mentor',
            text: reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 500);
    } finally {
      setIsSending(false);
    }
  };

  const toggleMic = () => {
    if (!hasSpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  };

  const promptPills = [
    "Test me on today's topic",
    "I'm feeling tired",
    "Break today's task into 15m chunks",
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 pb-24 md:pb-12 space-y-4 transition-all flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)]">
      {/* 1. Header (Mockup Screen 13) */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/60">
        <div className="w-10 h-10 rounded-full bg-lavender-soft dark:bg-lavender-dark/40 flex items-center justify-center text-xl flex-shrink-0 shadow-2xs">
          🐱
        </div>
        <div>
          <h1 className="text-base font-black text-primary-text dark:text-white leading-tight">
            Momo — Your Mentor
          </h1>
          <p className="text-[11px] text-success font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" />
            <span>Online · Ready to guide you</span>
          </p>
        </div>
      </div>

      {/* 2. Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => {
          const isMentor = m.sender === 'mentor';
          return (
            <div
              key={m.id}
              className={clsx(
                'flex gap-2',
                isMentor ? 'items-start' : 'items-end justify-end'
              )}
            >
              {isMentor && (
                <div className="w-7 h-7 rounded-full bg-lavender flex items-center justify-center text-sm flex-shrink-0 mt-0.5 border border-primary/20">
                  🐱
                </div>
              )}
              <div
                className={clsx(
                  'rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs break-words',
                  isMentor
                    ? 'bg-lavender text-primary dark:bg-lavender-dark/40 dark:text-white max-w-[85%]'
                    : 'bg-surface-secondary text-primary-text dark:bg-surface-secondary dark:text-white max-w-[80%]'
                )}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Prompt Pills (Mockup Screen 13) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {promptPills.map((pill) => (
          <button
            key={pill}
            onClick={() => handleSend(pill)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder text-primary-text dark:text-white hover:bg-surface-secondary whitespace-nowrap transition-all shadow-2xs cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Bar (Mockup Screen 13) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white dark:bg-surface-dark border border-border dark:border-surface-darkBorder rounded-2xl p-1.5 flex items-center gap-2 shadow-sm"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message to Momo..."
          className="flex-1 px-3 py-2 text-xs bg-transparent text-primary-text dark:text-white outline-none"
        />

        {hasSpeechRecognition && (
          <button
            type="button"
            onClick={toggleMic}
            className={clsx(
              'p-2 rounded-xl text-secondary-text hover:text-primary-text min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-colors',
              isListening && 'bg-danger-soft text-danger animate-pulse'
            )}
            title="Speech to text"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 rounded-xl bg-success text-white hover:bg-success-hover disabled:opacity-40 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-all shadow-xs"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MentorChatPage;
