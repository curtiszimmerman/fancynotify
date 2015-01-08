
/**
 * @project fancynotify
 * Simple notification module.
 * @file fancynotify.js
 * Primary application driver.
 * @author curtiszimmerman
 * @contact software@curtisz.com
 * @license MIT
 * @version 0.0.1
 *
 * Installation:
 * =============
 *
 * fancynotify is installable from npm:
 *
 *   $ npm install fancynotify
 *
 * Additionally, adding fancynotify to package.json dependencies will 
 * enable installing the package with `npm install`:
 *
 *   "dependencies": {
 *     "fancynotify": "0.0.1"
 *   }
 * 
 * Configuration:
 * ==============
 * 
 * fancynotify exposes the following functions:
 * 
 *   .down( config, server );
 *
 * - This function makes an HTTPS call to the Twilio API and accepts 
 *   two paramters:
 *  
 *   config.to - the number to notify
 *   config.from - the sending number of the notification
 *   config.account - the Twilio account ID
 *   config.secret - the Twilio account secret
 *
 *   server.name - name of server which is down
 */

module.exports = exports = __fancynotify = (function() {
  var buffer = require('buffer');
  var https = require('https');
  var _down = function( config, server ) {
    // uh oh! server down! let's notify via Twilio's API
    var body = 'To=' + config.to;
      body += '&From=' + config.from;
      body += '&Body=Server down (' + server.name + ')';
    var length = Buffer.byteLength(encodeURIComponent(body));
    var options = {
      headers: {
        'Authorization': 'Basic ' + new Buffer(config.account + ':' + config.secret).toString('base64'),
        'Content-Length': length
      },
      hostname: 'api.twilio.com',
      port: 443,
      path: '/2010-04-01/Accounts/' + config.account + '/Messages.json',
      method: 'POST'
    };
    var req = https.request(options, function(res) {
      if (res.statusCode === 200) {
        console.log('Server down: Admin notified!');
      } else {
        console.log('Received strange response from API: ' + res.statusCode);
      }
    });
    req.on('error', function(e) {
      console.log('Error sending request: ' + e.message);
    });
    req.write( encodeURIComponent(body) );
  };
  return { down: _down };
})();

