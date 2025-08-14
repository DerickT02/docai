#!/usr/bin/env -S node --no-warnings
const readline = require('readline')
const path = require('path')
const fs = require('fs').promises

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

 async function readFilesFromDirectory(){
    try {
        const files = await fs.readdir(process.cwd())  // cwd = where you ran the script
        if (files.length === 0) {
            console.log("No files found.")
        } else {
            files.forEach((f: any) => console.log(f))
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
        else if(ans == "readfile"){
            await readFilesFromDirectory()
        }
        shell()
    })
}

shell()
