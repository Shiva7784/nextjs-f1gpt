import type { UIMessage } from "ai";

interface BubbleProps {
    message: UIMessage;
}

const Bubble = ({ message }: BubbleProps) => {
    const isUser = message.role === "user";

    const text = message.parts
        .reduce((result, part) => {
            if (part.type === "text") {
                return result + part.text;
            }

            return result;
        }, "");

    return (
        <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
            <p>{text}</p>
        </div>
    );
};

export default Bubble;