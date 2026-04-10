import { useEffect, useRef, useState } from 'react';
import { Expense } from '../types/expense';
import { useAuth } from '../contexts/AuthContext';
import styles from './ChatWidget.module.css';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatWidgetProps = {
  expenses: Expense[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MAX_EXPENSES_TO_SEND = 200;

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm your expense assistant. Ask me anything about your spending — like 'How much did I spend this month?' or 'What's my biggest expense?'"
};

export function ChatWidget({ expenses }: ChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!API_BASE_URL) {
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }, { role: 'assistant', content: "Chat is unavailable: API URL is not configured." }]);
      setInput('');
      return;
    }

    // Capture history before adding the new message, excluding the welcome message
    const conversationHistory = messages.filter((m) => m !== WELCOME_MESSAGE);
    const userMessage: Message = { role: 'user', content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let reply: string;

    try {
      const token = await user?.getIdToken();
      const recentExpenses = expenses
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, MAX_EXPENSES_TO_SEND);

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: trimmed,
          expenses: recentExpenses,
          conversationHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        reply = data.reply || "I wasn't able to process your question. Please try again.";
      } else {
        reply = "Sorry, I couldn't process your question. Please try again.";
      }
    } catch {
      reply = "Something went wrong. Please check your connection and try again.";
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    setIsLoading(false);
  }

  return (
    <>
      {isOpen && (
        <div className={styles.chatPopup}>
          <div className={styles.chatHeader}>
            <span>Expense Assistant</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className={styles.typingIndicator}>Thinking…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ask about your expenses..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className={styles.chatToggle}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
