//HTTP handling
const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const cors = require('cors');
//Amazon AWS SDK
const AWS = require('aws-sdk');
//MapBox Vector Tiles handling
const geojsonvt = require('geojson-vt');
const vtpbf = require('vt-pbf');

// set the AWS region
const REGION = "<you AWS region here>"; // e.g., "us-east-1"
// set the bucket parameters
const bucketName = "<your bucket name here>";
// create S3 initial config for connection
const config = {
    apiVersion: '<preferred API version>',
    accessKeyId: '<IAM AWS account key ID>', 
    secretAccessKey: '<IAM AWS secret key>', 
    region: REGION
};
const s3 = new AWS.S3(config);
const getParams = {
    Bucket: bucketName, 
    Key: "provinces_4326.geojson"
};

// create a new express app instance
const app = express();
const PORT = process.env.PORT || 5000;
// we will server the built bundles from the "build" folder
app.use(express.static(path.join(__dirname, '../../build')));
/* we use the body parser middleware in case we 
want to handle response in JSON formats later on */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let tileIndex;
// route for the Vector Tiles request
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

/*open the connection to S3 and get 
the data from the bucket*/
s3.getObject(getParams, (error, data) => {
    if (error) console.log(error, error.stack);
    else {
        let jsonData = data.Body.toString('utf-8');
        jsonData = JSON.parse(jsonData);
        // we tile the full geojson file
        tileIndex = geojsonvt(jsonData);
        app.listen(PORT, () => {
            console.log('App is listening on port 5000!');
        });
    }
});