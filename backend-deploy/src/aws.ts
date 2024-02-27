import {S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';
import { all } from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import fs, { createWriteStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

const s3 = new S3Client({
    region: "auto",
    endpoint: 'https://f021f9d256dbb837e41546f5a34e04ac.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: 'e5d70561cb3a3cf53e8551ce550c2903',
      secretAccessKey: '0b1e3e58a3d0785a4be1af3f755e701cdda083cb16d962df1f14ea969eda4006',
    },
  });

export const downloadFolderFromR2 = async (prefix : string) =>{
    const params = {
        Bucket: 'pdp',
        Prefix: prefix
    };
    const command = new ListObjectsV2Command(params);
    const allFiles = await s3.send(command);   //it returns all file names in the bucket  and contains Contents array with name of all the files.
    const allPromises = allFiles.Contents?.map(async ({Key})=>{
        return new Promise(async (resolve) =>{
            if(!Key){
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname,Key);
            const dirName = path.dirname(finalOutputPath);
            const outputFile = fs.createWriteStream(finalOutputPath);
            if(!fs.existsSync(dirName)){
                fs.mkdirSync(dirName,{recursive:true});
            }
            const command = new GetObjectCommand({
                Bucket: 'pdp',
                Key: Key || ""
            });
            const response = await s3.send(command);
            if (response.Body instanceof Readable) {
                response.Body.pipe(outputFile);
                resolve("");
            } else {
                throw new Error("Response body is not a readable stream.");
            }
        })
    }) || [];
    await Promise.all(allPromises?.filter(x => x !== undefined));
}

export const uploadFile = async (fileName : string,localFileName: string)=>{
    const fileContent = fs.readFileSync(localFileName);
    const params = {
            Body: fileContent,
            Bucket: 'pdp',
            Key: fileName,
    };
    const command = new PutObjectCommand(params);
    try {
        const response = await s3.send(command);
      } catch (err) {
        console.error(err);
      }
}