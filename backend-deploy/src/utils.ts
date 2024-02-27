import {exec,spawn} from 'child_process';
import path from 'path';
import fs from 'fs';
import { uploadFile } from './aws';


export const buildProject = (id:string)=>{

    return new Promise((resolve) => {
        const child = exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`)

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("")
        });
    });
}

export const getFiles = (folderPath : string )=> {
    let response: string[] = [];
    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const filePath = path.join(folderPath,file);
        if(fs.statSync(filePath).isDirectory()){
            response = response.concat(getFiles(filePath));
        }
        else{
            response.push(filePath);
        }
    });
    return response;
}

export const copyFinalDist = (id: string)=>{
    const folders =  fs.readdirSync(path.join(__dirname,`output/${id}`));
    const buildFolderName = (folders.includes('dist')) ? 'dist' : 'build';
    const folderPath = path.join(__dirname,`output/${id}`,buildFolderName);
    const allFiles = getFiles(folderPath);
    allFiles.forEach(async file=>{
        await uploadFile(`dist/${id}` +'/'+ file.slice(folderPath.length+1).replace(/\\/g, "/"),file);
    });
}