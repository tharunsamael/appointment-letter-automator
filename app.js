const express = require("express");
const path = require('path');   
const {spawn} = require("child_process");

const fileUpload = require("express-fileupload");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.post("/upload", function (req, res) {
    console.log(req.files)
    if (req.files && Object.keys(req.files).length !== 0) {
        console.log(req.body);
        let replacingWords = req.body.repString.split(",");
	    let uploadedFile = req.files.uploadFile;
        let templateFile = uploadedFile[0].name;
        let dataFile = uploadedFile[1].name;
        var returnedData;
        let replacingWordlength = replacingWords.length;

    	console.log(replacingWords, uploadedFile, templateFile, dataFile, replacingWordlength);

        var flag = 0;

        for(let i=0; i<uploadedFile.length; i++){
    
            let uploadedFileName = uploadedFile[i].name;
	        let uploadPath = __dirname + "/uploads/" + uploadedFileName;
    
            let flag = 0;
	        console.log(uploadedFile[i]);
	        uploadedFile[i].mv(uploadPath, function (err) {
	            if (err) {
		            console.log(err);
                    flag = 0;
	            } else { 
                    flag += 1;
                }
	        });
        }
    
        if(flag == 2) {
            res.send({"message":"Failed!!!"});
        } else {
            
            const python = spawn('python3', ['core.py', templateFile, dataFile, replacingWordlength, replacingWords]);
            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
                returnedData = data.toString();
                returnedData = returnedData.slice(-6,-2)
            });

            python.stderr.on("data", data => {
                console.error(`stderr: ${data}`);
                if(data){
                    res.send({"message":"failed"})
                }
            });
               
            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}, ${returnedData}`);
                if(returnedData){
                    res.sendFile(__dirname + "/public/output.html");
                    res.send({"message":"Success"});
                }
            });
        }
    } else {
        res.send({"message":"failed"});
    }
});



app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.listen(3000, function (req, res) {
console.log("Started listening to port 3000");
});
