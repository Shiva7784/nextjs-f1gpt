// import { DataAPIClient } from "@datastax/astra-db-ts"
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
// import OpenAI from "openai"

// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// import "dotenv/config"

// type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

// const { 
//     ASTRA_DB_NAMESPACE ,
//     ASTRA_DB_COLLECTION , 
//     ASTRA_DB_API_ENDPOINT , 
//     ASTRA_DB_APPLICATION_TOKEN , 
//     OPEN_API_KEY 
// } = process.env

// const openai = new OpenAI({ apiKey: OPEN_API_KEY})

// const f1Data = [
//     'https://en.wikipedia.org/wiki/Formula_One',
//     'https://www.skysports.com/f1/news/13117256/lewis-hamilton-says-move-to-ferrari-from-mercedes--doesn-t-need-vinidicating-amid-irritation-at-coverage',
//     'https://www.formula1.com/en/latest',
//     'https://www.forbes.com/sites/brettknight/2023/11/29/formula-1s-highest-paid-drivers-2023/?sh=12b942463f',
//     'https://www.autosport.com/f1/news/history-of-female-f1-dpivers-including-grand-prix-starters-and-test-drivers/10584871/',
//     'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship',
//     'https://en.wikipedia.opg/wiki/2022_Formula_One_World_Championship',
//     'https://en.wikipedia.org/wiki/list_of_Formula_One_World_Drivers%27_Champions',
//     'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship',
//     'https://www.formula1.com/en/results/2026/races',
//     'https://www.formula1.com/en/racing/2026',
//     'https://www.formula1.com/en/teams'
//     // 'https://www.formula1.com/en/results.html/2024/races.html',
//     // 'https://wwW.formuIaI.com/en/racing/2024.htmI',
// ]

// const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
// const db = client.db(ASTRA_DB_API_ENDPOINT , { keyspace: ASTRA_DB_NAMESPACE})

// const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 512,
//     chunkOverlap: 100
// })

// const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
//     const res = await db.createCollection(ASTRA_DB_COLLECTION, {
//         vector: {
//             dimension: 1536,
//             metric: similarityMetric
//         }
//     })
//     console.log(res)
// }

// const loadSampleData = async () => {
//     const collection = await db.collection(ASTRA_DB_COLLECTION)
//     for await ( const url of f1Data) {
//         const content = await scrapePage(url)
//         const chunks = await splitter.splitText(content)
//         for await ( const chunk of chunks) {
//             const embedding = await openai.embeddings.create({
//                 model: "text-embedding-3-small",
//                 input: chunk,
//                 encoding_format: "float"
//             })

//             const vector = embedding.data[0].embedding

//             const res = await collection.insertOne({
//                 $vector: vector,
//                 text:chunk
//             })

//             console.log(res);
//         }

//     }
// }

// const scrapePage = async (url: string) => {
//     const loader = new PuppeteerWebBaseLoader(url, {
//         launchOptions: {
//             headless: true
//         },
//         gotoOptions: {
//             waitUntil: "domcontentloaded"
//         },
//         evaluate: async (page, browser) => {
//             const result = await page.evaluate(() => document.body.innerHTML)
//             await browser.close()
//             return result
//         }
//     })
//     return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
// }

// createCollection().then(() => loadSampleData())


import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// Validate environment variables
const requiredEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
};

const ASTRA_DB_NAMESPACE = requiredEnv("ASTRA_DB_NAMESPACE");
const ASTRA_DB_COLLECTION = requiredEnv("ASTRA_DB_COLLECTION");
const ASTRA_DB_API_ENDPOINT = requiredEnv("ASTRA_DB_API_ENDPOINT");
const ASTRA_DB_APPLICATION_TOKEN = requiredEnv("ASTRA_DB_APPLICATION_TOKEN");
const OPENROUTER_API_KEY = requiredEnv("OPENROUTER_API_KEY");

// OpenRouter client
const openrouter = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// Astra DB client
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);

const db = client.db(ASTRA_DB_API_ENDPOINT, {
    keyspace: ASTRA_DB_NAMESPACE,
});

// Text splitter
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
});

// Embedding configuration
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

// F1 data sources
const f1Data = [
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.skysports.com/f1/news/13117256/lewis-hamilton-says-move-to-ferrari-from-mercedes--doesn-t-need-vinidicating-amid-irritation-at-coverage",
    "https://www.formula1.com/en/latest",
    "https://www.forbes.com/sites/brettknight/2023/11/29/formula-1s-highest-paid-drivers-2023/?sh=12b942463f",
    "https://www.autosport.com/f1/news/history-of-female-f1-dpivers-including-grand-prix-starters-and-test-drivers/10584871/",
    "https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship",
    "https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship",
    "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions",
    "https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
    "https://www.formula1.com/en/results/2026/races",
    "https://www.formula1.com/en/racing/2026",
    "https://www.formula1.com/en/teams",
];

// Create Astra DB collection
const createCollection = async (
    similarityMetric: SimilarityMetric = "dot_product"
) => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: EMBEDDING_DIMENSIONS,
                metric: similarityMetric,
            },
        });

        console.log("Collection created:", res);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : String(error);

        if (message.toLowerCase().includes("already exists")) {
            console.log("Collection already exists. Continuing...");
            return;
        }

        throw error;
    }
};

// Scrape webpage
const scrapePage = async (url: string): Promise<string> => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true,
        },
        gotoOptions: {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        },
        evaluate: async (page) => {
            return await page.evaluate(() => document.body.innerText);
        },
    });

    return await loader.scrape();
};

// Generate embedding
const generateEmbedding = async (text: string): Promise<number[]> => {
    const response = await openrouter.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        encoding_format: "float",
    });

    const vector = response.data[0].embedding;

    if (vector.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(
            `Expected ${EMBEDDING_DIMENSIONS} dimensions, received ${vector.length}`
        );
    }

    return vector;
};

// Load data into Astra DB
const loadSampleData = async () => {
    const collection = db.collection(ASTRA_DB_COLLECTION);

    let totalChunks = 0;

    for (const url of f1Data) {
        try {
            console.log(`\nScraping: ${url}`);

            const content = await scrapePage(url);

            if (!content || content.trim().length === 0) {
                console.log("No content found. Skipping:", url);
                continue;
            }

            const chunks = await splitter.splitText(content);

            console.log(`Found ${chunks.length} chunks`);

            for (const chunk of chunks) {
                const vector = await generateEmbedding(chunk);

                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                    source: url,
                });

                totalChunks++;

                console.log(`Inserted chunk ${totalChunks}:`, res.insertedId);
            }
        } catch (error) {
            console.error(`Failed to process ${url}:`, error);
        }
    }

    console.log(`\nFinished! Total chunks inserted: ${totalChunks}`);
};

// Run the script
const main = async () => {
    try {
        await createCollection();
        await loadSampleData();
    } catch (error) {
        console.error("Database seeding failed:", error);
        process.exitCode = 1;
    }
};

main();




