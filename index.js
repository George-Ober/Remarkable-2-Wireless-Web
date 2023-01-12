const fs = require("fs");
const express = require("express");
const app = express();
const port = 4000;
const path = require("path");
const { dirname } = require("path");
const node_scp = require("node-scp");
const child_process = require("child_process");
require("dotenv").config();
let result;

app.disable('x-powered-by');
app.use(express.static('./public'));
app.use(express.json());

app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});
app.get("/data", (req, res) => {
    res.send(result);
});
app.get("/reload_cache", (req, res) => {
    child_process.exec("rm cache/*");
    node_scp.Client({
        host: process.env.HOST,
        port: 22,
        username: 'root',
        password: process.env.PASSWORD 
    }).then(client => {
        client.list("/home/root/.local/share/remarkable/xochitl/").then(list => {
            console.log(list);
            let toBedownloaded = 0;
            for(i in list){
                if(list[i].name.includes(".metadata")){
                    client.downloadFile(`/home/root/.local/share/remarkable/xochitl/${list[i].name}`, `cache/${list[i].name}`).then(response => {
                        toBedownloaded--;
                        if(toBedownloaded == 0){
                            console.log("Cached Everything");
                            client.close();
                            fs.readdir('cache', (err, files) => {
                                for(i in files){
                                    if(files[i].includes(".metadata")){
                                        f = fs.readFileSync(`cache/${files[i]}`, {encoding: 'utf-8'});
                                        data = JSON.parse(f);
                                        data.children = {};

                                        currentUUID = files[i].slice(0, files[i].length - ".metadata".length);
                                        data.selfID = currentUUID;
                                        filesystem[currentUUID] = data;
                                    }
                                }
                                for(key in filesystem){
                                    if(key !== "" && key !== "trash") filesystem[filesystem[key].parent].children[key] = filesystem[key];
                                }
                                result = filesystem[""];
                                fs.writeFileSync("cached.json", JSON.stringify(result));
                                console.log("Successfully indexed file system");
                                res.status(200).send("Successfully indexed file system");
                            });
                        }
                    });
                    toBedownloaded++;
                }
            }
        });
    });
});
app.get("/pdf/:id", (req, res)=>{
    console.log(req.params.id);
    node_scp.Client({
        host: process.env.HOST,
        port: 22,
        username: 'root',
        password: process.env.PASSWORD 
    }).then(client => {
        client.downloadFile(`/home/root/.local/share/remarkable/xochitl/${req.params.id}.pdf`, `cache/${req.params.id}.pdf`).then(response => {
            res.sendFile(path.join(__dirname,`cache/${req.params.id}.pdf`));
        }).catch(err => {
            res.status(404).send("PDF file not found, we'll see for converting .rm files later");
        });
    });
});
let filesystem = {};
filesystem[""] = {
    children: {}
}
filesystem["trash"] = {
    children: {}
}
result = fs.readFileSync("cached.json", {encoding: "utf-8"});
