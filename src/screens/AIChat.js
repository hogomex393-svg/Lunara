/**
 * AIChat — Luna conversational interface.
 *
 * v2 (post-BFF refactor):
 *   - All LLM calls go through the BFF (/api/chat) — the browser no longer
 *     holds an API key, and the server injects business context (cycle phase,
 *     recent symptoms) into the system prompt automatically.
 *   - The user can pick which prompt template Luna uses (Default / Coach /
 *     Data Analyst). Templates are configured server-side.
 *   - When Luna calls Agent tools we surface a small badge so the user can
 *     see WHY the answer is grounded in their data.
 *   - Graceful degradation: if the BFF is unreachable we fall back to the
 *     original local rule-based responses so the demo still works offline.
 */
import React, { useState, useEffect, useRef } from 'react';
import { AI_RESPONSES } from '../data';
import { chat as bffChat, bffHealthy, DEMO_USER_ID } from '../api';

const QUICK_PROMPTS = ['I have cramps', 'Feeling anxious', "Can't sleep", 'Mood changes'];

const TEMPLATE_CHOICES = [
  { id: 'luna_default', label: 'Default', emoji: '🌸' },
  { id: 'luna_coach', label: 'Coach', emoji: '💪' },
  { id: 'luna_data_analyst', label: 'Data', emoji: '📊' },
];

function getLocalResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes('cramp') || lower.includes('pain')) return AI_RESPONSES.cramps;
  if (lower.includes('anxi') || lower.includes('stress') || lower.includes('worried')) return AI_RESPONSES.anxiety;
  if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired')) return AI_RESPONSES.sleep;
  if (lower.includes('mood')) return AI_RESPONSES.mood;
  return "That's a great question. Based on your cycle and recent logs, I'd suggest tracking how this feeling shifts over the next few days. If it persists, consider speaking with a healthcare provider. 💜";
}

export default function AIChat({ navigate, animKey, messages, setMessages, input, setInput }) {
  const [isLoading, setIsLoading] = useState(false);
  const [templateId, setTemplateId] = useState('luna_default');
  const [bffReady, setBffReady] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    bffHealthy().then(setBffReady);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const next = [...messages, { role: 'user', text: msg }];
    setMessages(next);
    setInput('');
    setIsLoading(true);

    if (bffReady) {
      try {
        const result = await bffChat({
          userId: DEMO_USER_ID,
          message: msg,
          templateId,
          useContext: true,
        });
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: result.reply,
            toolsUsed: result.toolsUsed,
            usage: result.usage,
            latencyMs: result.latencyMs,
            templateId: result.templateId,
          },
        ]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            text: getLocalResponse(msg),
            fallback: true,
            errorMessage: err.message,
          },
        ]);
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      setMessages((m) => [...m, { role: 'ai', text: getLocalResponse(msg), fallback: true }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="ai-chat screen-enter" key={animKey}>
      <div className="ai-chat-header">
        <button className="back-btn" onClick={() => navigate('home')}>←</button>
        <div className="ai-avatar">🌸</div>
        <div style={{ flex: 1 }}>
          <div className="ai-name">Luna AI</div>
          <div className="ai-status" style={{ color: bffReady ? '#7BC67E' : '#C8A8A8' }}>
            ● {bffReady === null ? 'Connecting…' : bffReady ? 'BFF Online' : 'Offline (basic)'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '8px 16px 0', flexWrap: 'wrap' }}>
        {TEMPLATE_CHOICES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplateId(t.id)}
            style={{
              border: '1px solid var(--border, #E8D5D5)',
              background: templateId === t.id ? 'var(--primary, #F9D4E2)' : '#FFF8F8',
              padding: '4px 10px',
              borderRadius: 16,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
            {msg.toolsUsed && msg.toolsUsed.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 10, opacity: 0.7 }}>
                🔧 {[...new Set(msg.toolsUsed)].join(' · ')}
                {msg.latencyMs && ` · ${msg.latencyMs}ms`}
              </div>
            )}
            {msg.fallback && (
              <div style={{ marginTop: 4, fontSize: 10, opacity: 0.6, fontStyle: 'italic' }}>
                offline fallback
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="chat-bubble ai typing-bubble">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-prompts">
        {QUICK_PROMPTS.map((p) => (
          <button key={p} className="quick-prompt" onClick={() => sendMessage(p)} disabled={isLoading}>
            {p}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          placeholder="Ask Luna anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button className="chat-send" onClick={() => sendMessage()} disabled={isLoading}>↑</button>
      </div>
    </div>
  );
}
