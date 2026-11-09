const PromptSuggestionButton = ({ text, onClick }) => {
    console.log("PromptSuggestionButton rendered with text:", text);
    return (
        <button
        onClick={onClick} 
        className="prompt-suggestion-button"
        >
            {text}

        </button>
    )

}

export default PromptSuggestionButton;