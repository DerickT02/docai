
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import { html2pdf } from "html2pdf-ts";
import path from "path";
import fs from 'fs'
import { startSpinner } from "../models/tsAnalysisModel.ts";

dotenv.config()

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0,
    
})

//call model
export async function callModel(fileName: string, code: string){
    const prompt = `Analyze the given TypeScript/JavaScript source code and produce a human-readable report.

Your analysis must include:
	1.	Top-level constructs – List all top-level elements (functions, classes, variables, imports, exports, etc.).
	2.	Function details – For every function, report:
	•	Name
	•	Parameters (with types if available)
	•	Return type (if available)
	•	Whether it is async or a generator
	•	Approximate location in the source file (line numbers or character positions)
	3.	Code relationships – Describe connections, such as:
	•	Which functions call which
	•	Class inheritance (extends) or interface implementation (implements)
	4.	Noteworthy patterns – Highlight unusual or potentially problematic patterns:
	•	Unused parameters or variables
	•	Deeply nested blocks
	•	Potential circular dependencies
    5. Do not give feedback on improvements, simply tell me what the code is doing 
    6. Extract the filename given the filepath, this will be provided.
Rules:
	•	Do not output the raw code back.
	•	The output should be a clear, human-readable summary and analysis. Provide HTML for the documentation
    FilePath: ${fileName}
    Code: ${code}
`
const response = await model.invoke(prompt)

return response.content as string;


}

async function generateReport(fileName: string, content: string) {
    const dirPath = path.join(process.cwd(), fileName);

    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, 'example.pdf');
    const stopSpinner = startSpinner("Generating pdf");
    await html2pdf.createPDF(
        content,
        {
            format: 'A4',
            landscape: false,
            resolution: {
                width: 1920,
                height: 1080
            },
            filePath
        }
    );
    stopSpinner();
}

export async function analyzeProject(summaries: any[]){
    let joined = summaries.join("\n\n");
    console.log('JOINED', joined)
   const prompt = `You are a code analysis assistant. You have been given multiple partial summaries of a TypeScript/JavaScript codebase. Each summary represents one file and contains information about functions, classes, variables, imports, exports, relationships, patterns, and suggested improvements.

Your task is to produce a single **HTML document** that:

1. Includes all partial summaries in the order they are provided.
2. Preserves headings, lists, and formatting where possible.
3. Uses HTML structure with headings (<h1>, <h2>), paragraphs (<p>), and lists (<ul>, <li>) for readability.
4. Create a new master summary.

Partial summaries:
${joined}
`;
const response = await model.invoke(prompt)
await generateReport(process.cwd(), response.content as string)
}