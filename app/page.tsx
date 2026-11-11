"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import f1GPTLogo1 from "./assets/f1GPTLogo1.png";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionsRow";
import Bubble from "./components/Bubble";
import ModelSelector, { AVAILABLE_MODELS } from "./components/ModelSelector";
import {
  Send,
  Square,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Flag,
  Zap,
  Radio,
  Gauge,
  ChevronRight,
  ArrowDown,
  Download,
} from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-4o-mini");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore saved model preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("f1gpt_model");
      if (saved && AVAILABLE_MODELS.some((m) => m.id === saved)) {
        setSelectedModel(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    try {
      localStorage.setItem("f1gpt_model", modelId);
    } catch {
      // ignore
    }
  };

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const noMessage = !messages || messages.length === 0;

  // Auto-scroll down when messages change or while streaming
  useEffect(() => {
    if (messagesEndRef.current && !showScrollBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, showScrollBottom]);

  // Track scroll position to show/hide "Scroll to bottom" button
  const handleScroll = useCallback(() => {
    if (!mainScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setShowScrollBottom(distanceFromBottom > 160);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottom(false);
  };

  // Keyboard shortcuts (Ctrl+K or / to focus input, Escape to blur)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePrompt = (promptText: string) => {
    if (isLoading) return;
    sendMessage(
      { text: promptText },
      { body: { model: selectedModel } }
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage(
      { text: input },
      { body: { model: selectedModel } }
    );
    setInput("");
  };

  const handleClearChat = () => {
    if (isLoading) {
      stop();
    }
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  };

  // Export conversation as a Markdown file
  const handleExportChat = () => {
    if (noMessage) return;
    let md = "# F1GPT Telemetry & Race Intelligence Transcript\n";
    md += `*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;

    for (const msg of messages) {
      const isUser = msg.role === "user";
      const sender = isUser ? "### 🏎️ Race Engineer (You)" : "### 🏁 F1GPT Pit Wall";
      let text = "";
      if (Array.isArray(msg.parts)) {
        for (const p of msg.parts as any[]) {
          if (p.type === "text" && typeof p.text === "string") text += p.text;
        }
      }
      if (!text && typeof (msg as any).content === "string") {
        text = (msg as any).content;
      }
      md += `${sender}\n\n${text.trim()}\n\n---\n\n`;
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `f1gpt-transcript-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const quickPills = [
    "2026 Engine Regulations",
    "Max Verstappen Standings",
    "Ferrari 2025 Strategy",
    "Ground Effect & Aero",
  ];

  return (
    <div className="cockpit-container">
      {/* Top Motorsport Header */}
      <header className="cockpit-header">
        <div className="header-left">
          <div className="brand-logo-wrapper">
            <Image
              src={f1GPTLogo1}
              alt="F1GPT Racing Logo"
              width={110}
              height={44}
              priority
              className="header-brand-img"
            />
            <div className="brand-title-box">
              <span className="brand-title">F1<span className="red-accent">GPT</span></span>
              <span className="brand-tagline">PIT WALL INTELLIGENCE</span>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="telemetry-pill">
            <span className="status-dot pulsing"></span>
            <span className="telemetry-text">LIVE PADDOCK // ASTRA VECTOR DB</span>
          </div>
        </div>

        <div className="header-right">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
            disabled={isLoading}
          />

          {!noMessage && (
            <>
              <button
                onClick={handleExportChat}
                className="action-btn export-btn"
                title="Export session as Markdown"
                type="button"
                aria-label="Export chat"
              >
                <Download size={14} />
                <span className="btn-label">Export</span>
              </button>

              <button
                onClick={handleClearChat}
                className="action-btn clear-btn"
                title="Reset conversation and start new session"
                type="button"
                aria-label="New Session"
              >
                <RotateCcw size={14} />
                <span className="btn-label">New Session</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Chat / Hero Stage */}
      <main
        ref={mainScrollRef}
        onScroll={handleScroll}
        className="cockpit-main"
      >
        {noMessage ? (
          <div className="hero-section">
            <div className="hero-badge">
              <Radio size={14} className="badge-icon-red" />
              <span>FORMULA 1 AI PADDOCK</span>
            </div>

            <div className="hero-logo-center">
              <Image
                src={f1GPTLogo1}
                alt="F1GPT Formula 1 Logo"
                width={260}
                height={104}
                priority
                className="hero-logo-img"
              />
            </div>

            <h1 className="hero-headline">
              Formula 1 <span className="text-gradient">Race Intelligence</span>
            </h1>

            <p className="hero-subtitle">
              Your real-time engineering companion for technical regulations, driver telemetry,
              championship standings, and high-speed Grand Prix strategy.
            </p>

            <div className="telemetry-stats-bar">
              <div className="stat-item">
                <Gauge size={16} className="stat-icon" />
                <span className="stat-label">Vector RAG:</span>
                <span className="stat-val">Astra DB Connected</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <Zap size={16} className="stat-icon" />
                <span className="stat-label">Model:</span>
                <span className="stat-val">
                  {AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.label || "Dynamic"}
                </span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <Flag size={16} className="stat-icon" />
                <span className="stat-label">Domain:</span>
                <span className="stat-val">FIA Formula 1 World Championship</span>
              </div>
            </div>

            <div className="hero-suggestions">
              <div className="suggestions-header">
                <span className="suggest-title">
                  <Sparkles size={16} className="sparkle-icon" />
                  Select a telemetry prompt or type your query below
                </span>
              </div>
              <PromptSuggestionRow onPromptClick={handlePrompt} />
            </div>
          </div>
        ) : (
          <div className="chat-stream-container">
            <div className="chat-messages-list">
              {messages.map((message, index) => (
                <Bubble key={`message-${index}`} message={message} />
              ))}

              {isLoading && <LoadingBubble />}
              <div ref={messagesEndRef} className="scroll-anchor" />
            </div>

            {/* In-chat quick pill prompts */}
            <div className="inchat-pills">
              <span className="pills-label">Quick Radios:</span>
              <div className="pills-scroll">
                {quickPills.map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="quick-chip"
                    onClick={() => handlePrompt(pill)}
                    disabled={isLoading}
                  >
                    <span>{pill}</span>
                    <ChevronRight size={13} className="chip-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Scroll-to-Bottom Button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="scroll-bottom-fab"
            title="Scroll to latest telemetry"
            type="button"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </main>

      {/* Floating Bottom Console / Input Dock */}
      <footer className="cockpit-footer">
        {error && (
          <div className="error-banner" role="alert">
            <AlertCircle size={16} className="error-icon" />
            <span className="error-text">
              Telemetry Error: {error.message || "Failed to fetch response. Please verify API keys or model limit in .env."}
            </span>
            <button
              onClick={() => handleSubmit({ preventDefault: () => { } } as any)}
              className="retry-btn"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="cockpit-input-form">
          <div className="input-glow-wrapper">
            <input
              ref={inputRef}
              className="cockpit-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask F1GPT about lap records, race rules, team aerodynamics, or drivers..."
              disabled={isLoading}
              autoComplete="off"
            />

            <div className="input-actions">
              {isLoading ? (
                <button
                  type="button"
                  className="control-btn stop-btn"
                  onClick={stop}
                  title="Stop generation"
                  aria-label="Stop generation"
                >
                  <Square size={16} className="btn-icon" />
                  <span className="btn-text">Abort</span>
                </button>
              ) : (
                <button
                  type="submit"
                  className="control-btn send-btn"
                  disabled={!input.trim()}
                  title="Send message (Enter)"
                  aria-label="Send query"
                >
                  <span className="btn-text">Transmit</span>
                  <Send size={15} className="btn-icon send-icon" />
                </button>
              )}
            </div>
          </div>

          <div className="input-meta-bar">
            <span className="legal-notice">
              Unofficial motorsport AI. F1, FORMULA 1 and related marks are trademarks of Formula One Licensing B.V.
            </span>
            <span className="shortcut-hint">
              Press <strong>Enter ↵</strong> to transmit • <strong>Ctrl+K</strong> to focus
            </span>
          </div>
        </form>
      </footer>
    </div>
  );
}
