#!/usr/bin/env node
var aws = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var recursive = require("recursive-readdir");
var mime = require('mime-types');

var basePath = path.normalize(__dirname + '/../');
var config = JSON.parse(fs.readFileSync(basePath + 'aws-config.json'));
var spacesEndpoint = new aws.Endpoint(config.endpoint);


var s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey
});

// @ts-ignore
recursive(basePath+'public/assets', function (err, files) {
  // @ts-ignore
  files.forEach((file) => {
    var relPath = file.split(basePath+'public/')[1];
    upload(relPath, file);
  });
});

// @ts-ignore
function upload(relPath, file) {
  var params = {
    Bucket: (process.argv[2] === '--production') ? config.bucketName : config.bucketNameStaging,
    Key: relPath,
    Body: fs.createReadStream(file),
    ACL: 'public-read',
    ContentType: mime.lookup(file)
  };

  var options = {
    partSize: 10 * 1024 * 1024, // 10 MB
    queueSize: 10
  };

  // @ts-ignore
  s3.upload(params, options, function (err, data) {
    if (!err) {
      console.log(data.Key + ' uploaded!'); // successful response
    } else {
      console.log(err.message); // an error occurred
    }
  });
}