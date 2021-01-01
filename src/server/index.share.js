// Import required AWS SDK clients and commands for Node.js
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

s3.getObject(getParams, (error, data) => {
    if (error) console.log(error, error.stack);
    else {
        let jsonData = data.Body.toString('utf-8');
        jsonData = JSON.parse(jsonData)
        const tileIndex = geojsonvt(jsonData);
        // generate the vectors for an individual tile on each request
       // const tile = tileIndex.getTile(z, x, y);

        // expects urls in the format: /{Z}/{X}/{Y}.pbf
        const handleRequest = (req, res) => {
            const [z, x, y] = req.url
            .replace('.pbf', '')
            .split('/')
            .filter(n => n)
            .map(n => parseInt(n))
        
            // get the vectors for this tile
            const tile = tileIndex.getTile(z, x, y)
        
            // if there is no tile data, return an empty response
            if (!tile) {
                res.writeHead(204, { 'Access-Control-Allow-Origin': '*' })
                return res.end()
            }

            // encode the data as protobuf
            const buffer = Buffer.from(vtpbf.fromGeojsonVt({ geojsonLayer: tile }))

            // write the buffer to the response stream
            res.writeHead(200, {
                'Content-Type': 'application/protobuf',
                'Access-Control-Allow-Origin': '*'
            })
            res.write(buffer, 'binary')
            res.end(null, 'binary')
        }
        const port = process.env.PORT || 5000
        http.createServer(handleRequest).listen(port);
        console.log(`listening on port ${port}`);
    }
});