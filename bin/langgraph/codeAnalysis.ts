import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';
import ts from 'typescript'

dotenv.config()

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini",
    temperature: 0,
    
})

export async function analyzeCode(code: string){
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
Rules:
	•	Do not output the raw code back.
	•	The output should be a clear, human-readable summary and analysis.
    ${code}
`
const response = await model.invoke(prompt)
return response.content;


}
