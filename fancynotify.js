
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
 *   config.user - the Twilio user ID
 *   config.pass - the Twilio account pass
 *
 *   server.name - name of server which is down
 *
 * Example:
 * ========
 * // uh oh! server down! let's notify via Twilio's API
 * var body = 'To=' + config.to;
 * body += '&From=' + config.from;
 * body += '&Body=Server down (' + server.name + ')';
 * var length = Buffer.byteLength(encodeURIComponent(body));
 * var options = {
 *   headers: {
 *     'Authorization': 'Basic ' + new Buffer(config.user + ':' + config.pass).toString('base64'),
 *     'Content-Length': length
 *   },
 *   hostname: 'api.twilio.com',
 *   port: 443,
 *   path: '/2010-04-01/Accounts/' + config.user + '/Messages.json',
 *   method: 'POST'
 * };
 */

module.exports = exports = __fancynotify = (function() {
	"use strict";

	var buffer = require('buffer');
	var http = require('http');
	var https = require('https');
	var qs = require('querystring');
	var url = require('url');

	/**
	 * @function _log
	 * Exposes logging functions.
	 * @method debug
	 * Log a debug message if debugging is on.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method error
	 * Log an error.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method info
	 * Log an informational message.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 * @method log
	 * Log a message.
	 * @param (string) data - The data to log.
	 * @param (integer) [loglevel] - Loglevel of data. Default 1.
	 * @return (boolean) Success indicator.
	 * @method warn
	 * Log a warning.
	 * @param (string) data - The data to log.
	 * @return (boolean) Success indicator.
	 */
	var _log = (function() {
		var _con = function( data, loglevel ) {
			var pre = ['[!] ERROR: ', '[+] ', '[i] WARN: ', '[i] INFO: ', '[i] DEBUG: '];
			return console.log(pre[loglevel]+data);
		};
		var _debug = function( data ) { return _con(data, 4);};
		var _error = function( data ) { return _con(data, 0);};
		var _info = function( data ) { return _con(data, 3);};
		var _log = function( data, loglevel ) {
			var loglevel = typeof(loglevel) === 'undefined' ? 1 : loglevel > 4 ? 4 : loglevel;
			return $data.server.state.logs.quiet ? loglevel === 0 && _con(data, 0) : loglevel <= $data.server.state.logs.level && _con(data, loglevel);
		};
		var _warn = function( data ) { return _con(data, 2);};
		return {
			debug: _debug,
			error: _error,
			info: _info,
			log: _log,
			warn: _warn
		};
	})();

	var $data = {
		notify: {
			cache: [],
			settings: {
				defaultIDLength: 8
			}
		}
	};

	var $classes = {
		Notifier: (function() {
			var Notifier = function( config ) {
				if (typeof(config) === 'string') {
					// 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'
					/*{
						"protocol":"http:",
						"slashes":true,
						"auth":"user:pass",
						"host":"host.com:8080",
						"port":"8080",
						"hostname":"host.com",
						"hash":"#hash",
						"search":"?query=string",
						"query":"query=string",
						"pathname":"/p/a/t/h",
						"path":"/p/a/t/h?query=string",
						"href":"http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
					}*/
					// 'api.example.com/notify'
					/*{
						"protocol":null,
						"slashes":null,
						"auth":null,
						"host":null,
						"port":null,
						"hostname":null,
						"hash":null,
						"search":null,
						"query":null,
						"pathname":"api.example.com/notify",
						"path":"api.example.com/notify",
						"href":"api.example.com/notify"
					}*/
					// 'http://api.example.com/notify'
					/*{
						"protocol":"http:",
						"slashes":true,
						"auth":null,
						"host":"api.example.com",
						"port":null,
						"hostname":"api.example.com",
						"hash":null,
						"search":null,
						"query":null,
						"pathname":"/notify",
						"path":"/notify",
						"href":"http://api.example.com/notify"
					}*/
					//var conf = url.parse(config);
					var conf = url.parse('http://api.example.com/notify');
					this.host = conf.host;
					if (conf.auth !== null) this.auth = conf.auth;
					this.ssl = conf.protocol === 'https:' ? true : false;
					this.port = conf.port === null ? 80 : conf.port;
					return this;
				} else if (typeof(config) === 'object') {
					if (typeof(config.host) !== 'string') return false;
					this.auth = false;
					if (typeof(config.auth) === 'object') {
						this.auth = typeof(config.auth.user) !== 'undefined' && typeof(config.auth.pass) !== 'undefined' ? config.auth.user+':'+config.auth.pass : false;
					}
					this.host = config.host;
					this.ssl = typeof(config.ssl) !== 'undefined' ? config.ssl : true;
					this.port = typeof(config.port) !== 'undefined' ? config.port : 443;
					this.path = typeof(config.path) !== 'undefined' ? config.path : '/';
					return this;
				} else {
					throw new Error('Must provide configuration data to instantiate Notifier object!');
				}
			};
			Notifier.prototype.call = function( data, callback ) {
				/*
				querystring.stringify({
					"To": encodeURIComponent("+18085551212"),
					"From": encodeURIComponent("+15125551212"),
					"Body": encodeURIComponent("Server down ("+server.name+")")
				});
				*/
				// our calling library depends on our target api
				var call = this.ssl ? https : http;
				var method = (this.method === 'GET') ? 'GET' : 'POST';
				var options = {
					host: this.host
				};
				options.protocol = this.ssl ? 'https:' : 'http:';
				if (this.path !== null) options.path = this.path;
				if (this.port !== null) options.port = this.port;
				if (this.auth !== null) options.auth = this.auth;
				if (method === 'GET') {
					options.method = 'GET';
					options.path += qs.stringify(data);
				} else {
					options.method = 'POST';
					options.headers = {
						'Content-Length': Buffer.byteLength(encodeURIComponent(qs.stringify(data)))
					};
				};
				var req = call.request(options, function(res) {
					if (res.statusCode === 200) {
						_log.info('Server down: Admin notified!');
					} else {
						_log.warn('Received strange response from API: ' + res.statusCode);
					}
					return typeof(callback) === 'function' && callback(null, res.statusCode, res.responseText);
				});
				req.on('error', function(e) {
					throw new Error('Error sending request: ' + e.message);
				});
				if (method === 'POST') req.write(encodeURIComponent(qs.stringify(body)));
				return this;
			};
			Notifier.prototype.get = function( data, callback ) {
				this.method = 'GET';
				return this.call(data, callback);
			};
			Notifier.prototype.post = function( data, callback ) {
				this.method = 'POST';
				return this.call(data, callback);
			};
			return Notifier;
		})()
	};

	var $func = {
		create: function( config ) {
			if (typeof(options) === 'undefined') return false;
			return new $classes.Notifier(config);
		},
		util: {
			base64: {
				/**
				 * @function $func.util.base64.decode()
				 * Decodes base64 to string.
				 * @param (string) data The input string to decode.
				 * @return (string) The decoded string.
				 */
				decode: function( data ) {
					if (typeof(data) !== 'string') return false;
					return new Buffer(data, 'base64').toString('ascii');
				},
				/**
				 * @function $func.util.base64.encode()
				 * Encodes a string to base64.
				 * @param (string) data The base64-encoded input string.
				 * @return (string) The encoded string.
				 */
				encode: function( data ) {
					if (typeof(data) !== 'string') return false;
					return new Buffer(data).toString('base64');
				}
			},
			getID: function( IDLength ) {
				/**
				 * @function $func.util.getID()
				 * Generate short ID string from charset of [a-zA-Z0-9].

				 */
				if (typeof(IDLength) !== 'number') return false;
				var len = typeof(IDLength) === 'undefined' ? $data.notify.settings.defaultIDLength : IDLength;
				var chr = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				for (var i=0,id=''; i<len; i++) {
					id += chr.substr(Math.floor(Math.random() * chr.length), 1);
				}
				return id;
			}
		}
	};

	var __test = {
		classes: $classes,
		func: $func
	};
	
	return {
		create: $func.create,
		__test: __test
	};
})();

