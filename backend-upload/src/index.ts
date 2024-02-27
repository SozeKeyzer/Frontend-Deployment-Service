import express from 'express';
import cors from 'cors';
import {uniqueCode,getFiles} from './utils';
import simpleGit from 'simple-git';
import path from 'path';
import { uploadFile } from './aws';
import dotenv from 'dotenv';
dotenv.config();
import {createClient} from 'redis';
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

// uploadFile('myfile/package.json','C:/Users/mohit/Desktop/files/projects/project-deployment-application/backend/package.json');
// uploadFile('myfile/package2.json','C:/Users/mohit/Desktop/files/projects/project-deployment-application/backend/package.json');
app.post('/deploy',async (req,res)=>{
    const url = req.body.url;
    const id = uniqueCode();

    await simpleGit().clone(url,path.join(__dirname,`output/${id}`));
    const files = getFiles(path.join(__dirname,`output/${id}`));

    files.forEach(async file=>{
        await uploadFile(file.slice(__dirname.length+1).replace(/\\/g, "/"),file);
    });

    await new Promise((resolve)=>{
        setTimeout(resolve,5000);
    })

    publisher.lPush('build-queue',id);
    publisher.hSet("status", id ,"uploaded");   //we can get this using hGet //think of it as status table with id and status field
    res.json({
        id:id
    });
});

app.get("/status",async(req,res)=>{
    const id=req.query.id;
    const response = await subscriber.hGet('status',id as string);
    res.json({
        status:response
    })
});

app.listen(3000,()=>{
    console.log('server running on port 3000');
});