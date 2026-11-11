"use client";

import React, { useState } from "react";
import PromptSuggestionButton from "./PromptSuggestionButton";
import { Trophy, Users, Wrench, Timer, Flag, Sparkles } from "lucide-react";

interface PromptSuggestionsRowProps {
  onPromptClick: (prompt: string) => void;
}

interface PromptItem {
  id: string;
  category: "All" | "Championship" | "Drivers" | "Strategy" | "Tech";
  badgeLabel: string;
  icon: React.ReactNode;
  text: string;
}

const ALL_PROMPTS: PromptItem[] = [
  {
    id: "wdc",
    category: "Championship",
    badgeLabel: "TITLE FIGHT",
    icon: <Trophy size={14} className="badge-icon red-icon" />,
    text: "Who is the current Formula One World Drivers' Champion?",
  },
  {
    id: "ferrari-lineup",
    category: "Drivers",
    badgeLabel: "PADDOCK TRANSFERS",
    icon: <Users size={14} className="badge-icon yellow-icon" />,
    text: "Who will be the newest driver lineup for Ferrari?",
  },
  {
    id: "aston-martin",
    category: "Drivers",
    badgeLabel: "F1 ACADEMY",
    icon: <Flag size={14} className="badge-icon cyan-icon" />,
    text: "Who is the head of racing for Aston Martin's F1 Academy team?",
  },
  {
    id: "fastest-pitstop",
    category: "Strategy",
    badgeLabel: "PIT WALL",
    icon: <Timer size={14} className="badge-icon green-icon" />,
    text: "Who holds the record for the fastest pit stop in F1 history?",
  },
  {
    id: "drs-aero",
    category: "Tech",
    badgeLabel: "AERODYNAMICS",
    icon: <Wrench size={14} className="badge-icon orange-icon" />,
    text: "How does the Drag Reduction System (DRS) and ground effect work?",
  },
  {
    id: "highest-paid",
    category: "Drivers",
    badgeLabel: "CONTRACTS",
    icon: <Sparkles size={14} className="badge-icon purple-icon" />,
    text: "Who is currently the highest paid Formula 1 driver?",
  },
];

const PromptSuggestionsRow: React.FC<PromptSuggestionsRowProps> = ({
  onPromptClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | "Championship" | "Drivers" | "Strategy" | "Tech"
  >("All");

  const categories = ["All", "Championship", "Drivers", "Strategy", "Tech"] as const;

  const filteredPrompts =
    selectedCategory === "All"
      ? ALL_PROMPTS
      : ALL_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="prompt-suggestions-container">
      <div className="category-tabs" role="tablist" aria-label="Prompt categories">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`tab-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="prompt-suggestion-grid">
        {filteredPrompts.map((item) => (
          <PromptSuggestionButton
            key={item.id}
            category={item.badgeLabel}
            icon={item.icon}
            text={item.text}
            onClick={() => onPromptClick(item.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestionsRow;
