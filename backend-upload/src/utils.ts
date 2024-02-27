import fs from 'fs';
import path from 'path';

const max = 10;

export const uniqueCode = () =>{
    let ans = "";
    const subset = "123456789abcdefghijklmnopqrstuvwxyz";
    for(let i = 0;i<max;i++){
        ans += subset[Math.floor(Math.random()*subset.length)];
    }
    return ans;
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