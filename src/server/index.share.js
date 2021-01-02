// Import required AWS SDK clients and commands for Node.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const AWS = require('aws-sdk');
const geojsonvt = require('geojson-vt');
const vtpbf = require('vt-pbf');

  // Set the AWS region
const REGION = "<you AWS region here>"; // e.g., "us-east-1"

// Set the bucket parameters
const bucketName = "<your bucket name here>";

//Create S3 initial config for connection
const config = {
    apiVersion: '<preferred API version>',
    accessKeyId: '<IAM AWS account key ID>', 
    secretAccessKey: '<IAM AWS secret key>', 
    region: REGION
};

const s3 = new AWS.S3(config);

const getParams = {
    Bucket: bucketName, 
    Key: "telephone_districts.json"
};

// Create a new express app instance
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.static("build"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let tileIndex;

app.get('/tileserver', cors() , (req, res) => {
    const z = parseInt(req.query.z);
    const x = parseInt(req.query.x);
    const y = parseInt(req.query.y);
    const tile = tileIndex.getTile(z, x, y);
    if (!tile) {
        return res.status(204).end();
    }
    // encode the data as protobuf
    const buffer = Buffer.from(vtpbf.fromGeojsonVt({ geojsonLayer: tile }));
    res.send(buffer);
});

s3.getObject(getParams, (error, data) => {
    if (error) console.log(error, error.stack);
    else {
        let jsonData = data.Body.toString('utf-8');
        jsonData = JSON.parse(jsonData)
        tileIndex = geojsonvt(jsonData);
        app.listen(PORT, () => {
            console.log('App is listening on port 5000!');
        });
    }
});