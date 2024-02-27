import { downloadFolderFromR2 } from './aws';
import { copyFinalDist } from './utils';
import {createClient , commandOptions} from 'redis';
import { buildProject } from './utils';
const subscriber = createClient();
subscriber.connect(); //by default connects to local running redis  

const publisher = createClient();  //one client can perform either push/set operation or pop/get operation so we create other 
publisher.connect()                //client for the get status function

const main = async () =>{
    while(true){
        const response = await subscriber.brPop(
            commandOptions({isolated:true}),
            'build-queue',
            0
        );
        // @ts-ignore
        const id = response.element;
        console.log(id);
        await downloadFolderFromR2(`output/${id}`)  //first folder in the r2 is output then the id name
        await buildProject(id);
        await copyFinalDist(id);
        publisher.hSet("status" , id ,"deployed");
    }
}
main()