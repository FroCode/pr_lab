import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyDM-88ZGX2ykBV6n_A5uzMuk94RDvC-114";
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
    try {
        const models = await genAI.listModels();
        console.log(JSON.stringify(models, null, 2));
    } catch (e) {
        console.error(e);
    }
}

list();
