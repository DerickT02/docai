#!/usr/bin/env -S node --no-warnings
import readline from 'readline'
import path  from 'path'
import fs from 'fs'
import tsAnalysisTree from './models/tsAnalysisModel.ts'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const ignore = [".git", "node_modules"];
 async function readFilesFromDirectory(currPath: string = process.cwd(), level = 0){
    try {
        const files = await fs.promises.readdir(currPath, {withFileTypes: true})  // cwd = where you ran the script
        if (files.length === 0) {
            console.log("No files found.")
        } else {
            for(const f of files){
                const fullPath = path.join(currPath, f.name)
                const relativePath = path.relative(process.cwd(), fullPath);
                    if(f.name.startsWith(".")) continue;

                    if(f.isDirectory() && f.name.indexOf("node_modules") == -1 ){
                        let indent = ""
                        for(let i = 0; i < level; i++){
                            indent += " "
                        }
                        indent += "📂"
                        console.log(indent + f.name)
                        await readFilesFromDirectory(relativePath, level + 1)
                    }
                    else{
                        if(f.name.includes('.ts')){
                            tsAnalysisTree(relativePath)
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error reading directory:", err)
    }
}

function shell(){

    rl.question("What would you like to do: ", async (ans: string) => {
        if(ans == "exit"){
            process.exit(0)
        }
        else if(ans == "scan"){
            await readFilesFromDirectory()
        }
        shell()
    })
}

shell()
