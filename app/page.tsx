// "use client"
// import Image from "next/image"
// import f1GPTLogo from "./assets/f1GPTLogo.png"
// import { useChat } from "@ai-sdk/react"
// import { Message } from "ai"

// const Home = () => {
//     const {append , isloadng, messages, input, handleInputChange, handlesubmit } = useChat()

//     const noMessage = true

//     return (
//         <main>
//             <Image src={f1GPTLogo} width={250} alt="F1GPT Logo" />
//             <section className={noMessage ? "" : "populated"}>
//                 {noMessage ? (
//                     <>
//                     <p className="starter-text">
//                         The Ultimate place for Formula One super fans!
//                         Ask F1GPT anything about the fantastic topic of F1 racing
//                         and it will come back with the most up-to-date answers.
//                         We hpoe you enjoy!
//                     </p>
//                     <br/>
//                     {/* <PromptSuggestionRow/> */}

//                     </>

//                 ) : (
//                     <>
//                         {/* map messages onto text bubbles */}
//                         {/* <LoadingBubble/> */}

//                     </>

//                 )}
//                 <form onSubmit={handlesubmit}>
//                     <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..."/>
//                     <input type="submit" />

//                 </form>

//             </section>
//         </main>
//     )
// }

// export default Home


"use client";

import Image from "next/image";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
// import { UIMessage } from "ai"
import f1GPTLogo1 from "./assets/f1GPTLogo1.png";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionRow from "./components/PromptSuggestionsRow";
import Bubble from "./components/Bubble";
import type { FormEvent } from "react";


const Home = () => {
    const [input, setInput] = useState("");

    const {
        messages,
        sendMessage,
        status,
        error,
    } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const isLoading =
        status === "submitted" || status === "streaming";

    const noMessage = !messages || messages.length === 0;

    // const handlePrompt = ( promptText: string ) => {
        // const msg = {
        //     id: crypto.randomUUID(),
        //     content: promptText,
        //     role: "user",
        // }
        // append(msg)
    //     sendMessage({ text: promptText });

    // }

    const handlePrompt = (promptText: string) => {
        if (isLoading) return;
        sendMessage({ text: promptText });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!input.trim() || isLoading) return;

        sendMessage({ text: input });
        setInput("");
    };

    return (
        <main>
            <Image
                src={f1GPTLogo1}
                width={250}
                alt="F1GPT Logo"
                priority
                className="Image"
            />

            <section className={noMessage ? "" : "populated"}>
                {noMessage ? (
                    <>
                        <p className="starter-text">
                            The Ultimate place for Formula One super fans!
                            Ask F1GPT anything about the fantastic topic
                            of F1 racing and it will come back with
                            informative answers. We hope you enjoy!
                        </p>
                        <br />
                        <PromptSuggestionRow  onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                    {messages.map((message, index) => (
                        <Bubble
                            key={`message-${index}`}
                            message={message}
                        />
                    ))}
                    {/* map messages onto text bubbles */}
                    {isLoading && <LoadingBubble/> }
                    </>
                )}
            </section>

            <form onSubmit={handleSubmit}>
                    <input
                        className="question-box"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask me something..."
                        disabled={isLoading}
                    />

                    <button className="submit" type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? "Thinking..." : "Send"}
                    </button>

                    {error && (
    <p className="error-message">
        Error: {error.message}
    </p>
)}
                </form>
        </main>
    );
};

export default Home;
