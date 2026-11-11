// import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai"
// import { DataAPIClient } from "@datastax/astra-db-ts";


// // Validate environment variables
// const requiredEnv = (name: string): string => {
//     const value = process.env[name];

//     if (!value) {
//         throw new Error(`Missing environment variable: ${name}`);
//     }

//     return value;
// };


// const ASTRA_DB_NAMESPACE = requiredEnv("ASTRA_DB_NAMESPACE");
// const ASTRA_DB_COLLECTION = requiredEnv("ASTRA_DB_COLLECTION");
// const ASTRA_DB_API_ENDPOINT = requiredEnv("ASTRA_DB_API_ENDPOINT");
// const ASTRA_DB_APPLICATION_TOKEN = requiredEnv("ASTRA_DB_APPLICATION_TOKEN");
// const OPENROUTER_API_KEY = requiredEnv("OPENROUTER_API_KEY");

// const openai = new OpenAI({
//     apiKey: OPENROUTER_API_KEY;
// })

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
// const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE})

// export async function POST(req: Request) {
//     try{
//         const { messages } = await req.json();
//         const latestMessage = messages[messages?.length - 1].content

//         let docContext = " "

//         const embedding = await openai.embeddings.create({
//             model: "text-embedding-3-small",
//             input: latestMessage,
//             encoding_format: 'float'
//         })

//         try {
//             const collection = await db.collection(ASTRA_DB_COLLECTION)
//             const cursor = collection.find(null, {
//                 sort: {
//                     $vector: embedding.data[0].embedding,
//                 },
//                 limit: 10
//             })

//             const documents = await cursor.toArray()

//             const docsMap = documents?.map(doc => doc.text)

//             docContext = JSON.stringify(docsMap)

//         } catch (err) {
//             console.log("Error querying db ...")
//             docContext=""
//         }

//         const template = {
//             role: "system",
//             content: `You are an AI assistant who knows everything about Formula One.
//             Use the below content to augment what you know about Formula One racing.
//             The context will provide you with the most recent page data from wikipedia,
//             the official F1 website and others.
//             If the context doesn't include the information you need answer based on your
//             existing knowledge and doesn't mention the source of your information or 
//             what the context does or doesn't include.
//             Format responses using markdown where applicable and don't return 
//             images.
//         -----------------
//         START CONTEXT
//         ${docContext}
//         END CONTEXT
//         -----------------
//         QUESTION: ${latestMessage}
//         -----------------
//         `
//         }
//         await openai.chat.completions.create({
//             model:
//             stream: true,
//             messages: [template, ...messages]
//         })

//         const stream = OpenAIStream(response)
//         return new StreamingTextResponse(stream)
//     } catch(err) {
//         throw err
//     }
// }



import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";

// Validate environment variables
const requiredEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
};

// Environment variables
const ASTRA_DB_NAMESPACE = requiredEnv("ASTRA_DB_NAMESPACE");
const ASTRA_DB_COLLECTION = requiredEnv("ASTRA_DB_COLLECTION");
const ASTRA_DB_API_ENDPOINT = requiredEnv("ASTRA_DB_API_ENDPOINT");
const ASTRA_DB_APPLICATION_TOKEN = requiredEnv("ASTRA_DB_APPLICATION_TOKEN");

const OPENROUTER_API_KEY = requiredEnv("OPENROUTER_API_KEY");

// OpenRouter chat client for AI SDK
const openrouter = createOpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// OpenRouter client for embeddings
const openai = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// Astra DB client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = client.db(ASTRA_DB_API_ENDPOINT, {
    keyspace: ASTRA_DB_NAMESPACE,
});

// Generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "openai/text-embedding-3-small",
        input: text,
        encoding_format: "float",
    });

    return response.data[0].embedding;
}

// API POST handler
export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        // Dynamically select model: client override -> env variable -> default fallback
        const chatModel =
            (typeof model === "string" && model.trim()) ||
            process.env.OPENROUTER_CHAT_MODEL?.trim() ||
            "openai/gpt-4o-mini";

        if (!messages || messages.length === 0) {
            return new Response("No messages provided", {
                status: 400,
            });
        }

        // Extract the latest user message
        const latestMessage = messages[messages.length - 1];

        const latestMessageText = latestMessage.parts
            ?.filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join(" ");

        if (!latestMessageText?.trim()) {
            return new Response("Message cannot be empty", {
                status: 400,
            });
        }

        // Generate query embedding
        const embedding = await generateEmbedding(latestMessageText);

        // Retrieve relevant documents from Astra DB
        let docContext = "";

        try {
            const collection = db.collection(ASTRA_DB_COLLECTION);

            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding,
                },
                limit: 10,
            });

            const documents = await cursor.toArray();

            const docsMap = documents.map((doc) => doc.text);

            docContext = JSON.stringify(docsMap);

            console.log("Retrieved documents:", documents.length);

        } catch (error) {
            console.error("Error querying Astra DB:", error);
            docContext = "";
        }

        // System prompt
        const systemPrompt = `
You are F1GPT, an AI assistant specializing in Formula One racing.

Your job is to provide accurate, helpful and informative answers
about Formula One.

Use the following retrieved context to improve your answers.

If the context does not contain the required information,
answer using your existing knowledge.

Do not mention the internal retrieval process or the context.

Format responses using Markdown where appropriate.
Do not generate images.

-----------------
START CONTEXT

${docContext}

END CONTEXT
-----------------
`;

        // Convert UI messages into model messages
        const modelMessages = await convertToModelMessages(messages);

        // Stream response using OpenRouter
        const result = streamText({
            model: openrouter(chatModel),
            system: systemPrompt,
            messages: modelMessages,
            maxOutputTokens: 900,
        });


        // Return streaming response to useChat()
        return result.toUIMessageStreamResponse();


    } catch (error) {
        console.error("F1GPT API Error:", error);

        return new Response(
            JSON.stringify({
                error: "Something went wrong while processing your request.",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
}

