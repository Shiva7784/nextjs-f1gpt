"use client";

import React, { useState, useRef, useEffect } from "react";
import { Cpu, ChevronDown, Check, Zap } from "lucide-react";

export interface AIModel {
  id: string;
  label: string;
  provider: string;
  tag: string;
  tagColor: "green" | "blue" | "purple" | "yellow" | "orange" | "red";
  description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "OpenAI",
    tag: "FAST",
    tagColor: "green",
    description: "High-speed telemetry engine (Default)",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "Google",
    tag: "SPEED",
    tagColor: "blue",
    description: "Next-gen ultra fast multimodal engine",
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek V3",
    provider: "DeepSeek",
    tag: "SMART",
    tagColor: "purple",
    description: "Advanced race strategy & technical analysis",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    provider: "Meta",
    tag: "70B",
    tagColor: "yellow",
    description: "Flagship 70-billion parameter intelligence",
  },
  {
    id: "anthropic/claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    tag: "AGILE",
    tagColor: "orange",
    description: "Anthropic's latest fast & precise model",
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    label: "Qwen 2.5 72B",
    provider: "Alibaba",
    tag: "TURBO",
    tagColor: "red",
    description: "Massive 72B motorsport reasoning engine",
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={`f1-custom-dropdown ${isOpen ? "is-open" : ""}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="f1-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Switch AI Race Engine"
      >
        <div className="trigger-left">
          <Cpu size={14} className="engine-icon" />
          <span className="active-label">{activeModel.label}</span>
          <span className={`engine-badge tag-${activeModel.tagColor}`}>
            {activeModel.tag}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`chevron-icon ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          className="f1-dropdown-menu"
          role="listbox"
          aria-label="Select AI Model"
        >
          <div className="dropdown-menu-header">
            <Zap size={12} className="menu-header-icon" />
            <span>PIT WALL ENGINES // OPENROUTER</span>
          </div>

          <div className="dropdown-items-list">
            {AVAILABLE_MODELS.map((model) => {
              const isSelected = model.id === activeModel.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(model.id)}
                  className={`f1-dropdown-item ${isSelected ? "selected" : ""}`}
                >
                  <div className="item-main">
                    <div className="item-row-top">
                      <span className="item-provider">{model.provider}</span>
                      <span className="item-label">{model.label}</span>
                      <span className={`engine-badge tag-${model.tagColor}`}>
                        {model.tag}
                      </span>
                    </div>
                    <span className="item-desc">{model.description}</span>
                  </div>

                  {isSelected && (
                    <div className="selected-indicator">
                      <Check size={14} className="check-icon" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

