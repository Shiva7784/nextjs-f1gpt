import PromptSuggestionButton from "./PromptSuggestionButton";

interface PromptSuggestionRowProps {
    onPromptClick: (prompt: string) => void;
}

const PromptSuggestionRow = ({ onPromptClick } : PromptSuggestionRowProps) => {
    const prompts = [
        "who is head of racing fp Astron Martin's F1 Academy team?",
        "Who is the highest paid F1 driver?",
        "Who will be the newest driver for Ferrari?",
        "who is the current Formula One World Driver's Champion?",
    ]
    return (
        
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
                        key={`suggestion-${index}`}
                        text={prompt}
                        onClick={() => onPromptClick(prompt)}
                        />
            )}

        </div>
    

    )

}

export default PromptSuggestionRow;