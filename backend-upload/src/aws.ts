import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.ENDPOINT,
    credentials: {
      accessKeyId: 'e5d70561cb3a3cf53e8551ce550c2903',
      secretAccessKey: '0b1e3e58a3d0785a4be1af3f755e701cdda083cb16d962df1f14ea969eda4006',
    },
  });


export const uploadFile = async (fileName : string,localFileName: string)=>{
  // console.log(fileName);
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