"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface PromptSuggestionButtonProps {
  category: string;
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const PromptSuggestionButton: React.FC<PromptSuggestionButtonProps> = ({
  category,
  icon,
  text,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="prompt-suggestion-card"
      type="button"
      aria-label={`Ask: ${text}`}
    >
      <div className="card-top">
        <span className="card-badge">
          {icon}
          <span className="badge-name">{category}</span>
        </span>
        <div className="card-arrow">
          <ArrowUpRight size={16} />
        </div>
      </div>
      <p className="card-prompt">{text}</p>
    </button>
  );
};

export default PromptSuggestionButton;
