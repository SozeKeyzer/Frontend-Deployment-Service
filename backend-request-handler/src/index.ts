import express from "express";
import { S3 } from "aws-sdk";

const s3 = new S3({
    accessKeyId: 'e5d70561cb3a3cf53e8551ce550c2903',
    secretAccessKey: '0b1e3e58a3d0785a4be1af3f755e701cdda083cb16d962df1f14ea969eda4006',
    endpoint: 'https://f021f9d256dbb837e41546f5a34e04ac.r2.cloudflarestorage.com'
})

const app = express();

app.get("/*", async (req, res) => {
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;

    const contents = await s3.getObject({
        Bucket: "pdp",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(4000);