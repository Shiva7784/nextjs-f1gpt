"use client";

import React, { useState } from "react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Copy, Check, User, Sparkles, Brain, AlertTriangle } from "lucide-react";

interface BubbleProps {
  message: UIMessage;
}

const Bubble = ({ message }: BubbleProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  // Extract text and reasoning parts safely
  let text = "";
  let reasoning = "";

  if (Array.isArray(message.parts)) {
    for (const part of message.parts as any[]) {
      if (part.type === "text" && typeof part.text === "string") {
        text += part.text;
      } else if (part.type === "reasoning" && typeof part.text === "string") {
        reasoning += part.text;
      }
    }
  }

  // Fallback to message.content if parts didn't provide text
  if (!text && typeof (message as any).content === "string") {
    text = (message as any).content;
  }

  const displayText = text.trim() || (!isUser && reasoning.trim() ? reasoning.trim() : "");
  const hasReasoningOnly = !text.trim() && Boolean(reasoning.trim());

  const handleCopy = async () => {
    if (!displayText) return;
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className={`message-row ${isUser ? "user-row" : "assistant-row"}`}>
      <div
        className={`message-avatar ${isUser ? "user-avatar" : "assistant-avatar"}`}
        title={isUser ? "Race Engineer (You)" : "F1 Pit Wall AI"}
      >
        {isUser ? (
          <User className="avatar-icon" size={18} />
        ) : (
          <div className="assistant-avatar-inner">
            <span className="f1-badge-text">F1</span>
          </div>
        )}
      </div>

      <div className={`message-bubble ${isUser ? "bubble-user" : "bubble-assistant"}`}>
        <div className="message-header">
          <div className="sender-meta">
            <span className="sender-name">
              {isUser ? "Race Engineer (You)" : "F1GPT Pit Wall"}
            </span>
            {!isUser && (
              <span className="ai-tag">
                <Sparkles size={11} className="ai-tag-icon" />
                TELEMETRY AI
              </span>
            )}
            {!isUser && hasReasoningOnly && (
              <span className="reasoning-tag" title="Output produced by deep telemetry reasoning">
                <Brain size={11} />
                ANALYSIS
              </span>
            )}
          </div>

          {!isUser && displayText && (
            <button
              onClick={handleCopy}
              className="copy-button"
              aria-label="Copy response"
              title={copied ? "Copied to clipboard!" : "Copy response"}
              type="button"
            >
              {copied ? (
                <>
                  <Check size={14} className="copy-icon copied" />
                  <span className="copy-label">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="copy-icon" />
                  <span className="copy-label">Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="message-content">
          {isUser ? (
            <p className="user-text">{displayText}</p>
          ) : (
            <div className="markdown-body">
              {/* If model provided separate reasoning alongside text, show expandable telemetry thought */}
              {text.trim() && reasoning.trim() && (
                <div className="telemetry-reasoning-accordion">
                  <button
                    type="button"
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="reasoning-toggle-btn"
                  >
                    <Brain size={13} className="brain-icon" />
                    <span>{showReasoning ? "Hide Telemetry Reasoning" : "View Telemetry Reasoning"}</span>
                  </button>
                  {showReasoning && (
                    <div className="reasoning-content">
                      <ReactMarkdown>{reasoning}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {displayText ? (
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="markdown-link"
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="table-responsive">
                        <table {...props} />
                      </div>
                    ),
                  }}
                >
                  {displayText}
                </ReactMarkdown>
              ) : (
                <div className="empty-response-notice">
                  <AlertTriangle size={15} className="empty-notice-icon" />
                  <span>
                    No output received from the model. The token limit was reached or the model timed out. Please try sending your query again.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bubble;
