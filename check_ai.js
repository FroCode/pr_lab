import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDM-88ZGX2ykBV6n_A5uzMuk94RDvC-114";

async function checkModels() {
    console.log("Checking models for key:", apiKey.substring(0, 10) + "...");
    try {
        // Try default version
        const genAI = new GoogleGenerativeAI(apiKey);
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Model gemini-1.5-flash configured successfully (SDK default version)");
    } catch (e) {
        console.log("Error with default model:", e.message);
    }

    try {
        console.log("\nAttempting to list all available models...");
        const genAI = new GoogleGenerativeAI(apiKey);
        // listModels might not be available in all SDK versions or requires specific setup
        // but we can try to find valid models.
        console.log("Fetching model list...");
        // Some versions don't have listModels on the main class
        if (genAI.listModels) {
            const models = await genAI.listModels();
            console.log("Available Models:");
            models.models.forEach(m => console.log("- " + m.name));
        } else {
            console.log("listModels method not found on GoogleGenerativeAI instance.");
        }
    } catch (e) {
        console.log("Error listing models:", e.message);
    }
}

checkModels();
