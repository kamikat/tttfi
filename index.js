var { spawn } = require('child_process');
var express = require('express');
var parser = require('body-parser');
var request = require('request');
var debug = require('debug');

var createApp = (function({ apiKey, secret }) {

  var app = express();

  app.use(parser.raw({ type: '*/*' }));

  app.post('/:event_name/secret/:secret', (req, res) => {

    // Ensure client is trust worthy (use HTTPS please)
    if (req.params.secret != secret) {
      return res.status(403).send();
    }

    var output = [];
    var cmd = req.params.event_name;
    var child = spawn('sh', ['-c', cmd], { stdio: 'pipe' });
    var DEBUG = debug('ttt');

    DEBUG(`Process (PID ${child.pid}) created for "${cmd}".`)

    child.on('error', (err) => {
      DEBUG(`Child process failed with error`);
      console.error(err);
    });

    child.on('close', (code) => {
      DEBUG(`Process (PID ${child.pid}) exited with code ${code}.`);
      if (code == 0) {
        var data = output.join('');
        DEBUG(`Received ${data.length} bytes from process.`);
        try {
          var json = JSON.parse(data);
        } catch (e) {
          DEBUG(`Invalid JSON data. Transmission aborted.`);
          return;
        }
        var jsonString = JSON.stringify(json);
        DEBUG(`Sending response body (${jsonString.length} bytes) as event data of "${cmd}".`)
        request.post({
          url: `https://maker.ifttt.com/trigger/${cmd}/with/key/${apiKey}`,
          json: true,
          body: json
        })
        .on('response', (res0) => {
          if (res0.statusCode == 200) {
            DEBUG(`Response body sent successfully.`)
          } else {
            DEBUG(`Failed to send response (code ${res0.statusCode}).`)
          }
        });
      }
    });

    child.stdout.on('data', (data) => {
      output.push(data);
    });

    DEBUG(`Sending request body (${req.body.length} bytes)...`);
    child.stdin.write(req.body);
    child.stdin.end();
    DEBUG(`Sent.`);

    return res.status(200).send();
  });

  return app;
});

(function ({ host, port, app }) {
  var server = app.listen(port, host, function () {
    console.log('Server listening at http://%s:%s', server.address().address, server.address().port);
  });
})({
  host: process.env['BIND_HOST'] || 'localhost',
  port: process.env['BIND_PORT'] || '3001',
  app : createApp({
    apiKey: process.env['API_KEY'],
    secret: process.env['SECRET_TOKEN']
  })
});

