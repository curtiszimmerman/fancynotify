/**
 *
 */

var __test = (function() {
	"use strict";

	var expect = require('chai').expect;
	var fancynotify = require('../fancynotify.js').__test;

	describe('### FancyNotify:', function() {
		describe('# $func.util.getID():', function() {
			it('should return false if passed incorrect type of paramter', function() {
				var result = fancynotify.func.util.getID(false);
				expect(result).to.equal(false);
			});
			it('should return a string four characters long when passed integer 4 as paramter', function() {
				var result = fancynotify.func.util.getID(4);
				expect(result.length).to.equal(4);
			});
		});
		describe('# $func.util.base64.encode():', function() {
			it('should return false if passed incorrect number of parameters', function() {
				var result = fancynotify.func.util.base64.encode();
				expect(result).to.equal(false);
			});
			it('should return false if passed incorrect type of paramter', function() {
				var result = fancynotify.func.util.base64.encode(false);
				expect(result).to.equal(false);
			});
			it('should return "cGFzc3dvcmQ=" when passed "password" as paramter', function() {
				var result = fancynotify.func.util.base64.encode('password');
				expect(result).to.equal('cGFzc3dvcmQ=');
			});
		});
		describe('# $func.util.base64.decode():', function() {
			it('should return false if passed incorrect number of paramaters', function() {
				var result = fancynotify.func.util.base64.decode();
				expect(result).to.equal(false);
			});
			it('should return false if passed incorrect type of paramter', function() {
				var result = fancynotify.func.util.base64.decode(false);
				expect(result).to.equal(false);
			});
			it('should return "password" when passed "cGFzc3dvcmQ=" as parameters', function() {
				var result = fancynotify.func.util.base64.decode('cGFzc3dvcmQ=');
				expect(result).to.equal('password');
			});
		});

		describe('# $classes.Notifier: ', function() {
			it('should return false when called with zero parameters', function() {
				expect(function() {
					new fancynotify.classes.Notifier();
				}).to.throw(Error);
			});
			it('should return a Notifier object when called with a URL config string', function() {
				var result = new fancynotify.classes.Notifier('http://abcdefghij:0123456789@api.example.com/notify');
				expect(result).to.be.an.instanceof(fancynotify.classes.Notifier);
			});
			it('should return a Notifier object when called with a config object', function() {
				var result = new fancynotify.classes.Notifier({
					auth: 'abcdefghij:0123456789',
					host: 'api.example.com',
					path: '/notify',
					port: '8080'
				});
				expect(result).to.be.an.instanceof(fancynotify.classes.Notifier);
			});
			it('should fire a callback with a 404 error when called with invalid URL', function(done) {
				var notifier = new fancynotify.classes.Notifier({
					auth: 'user:pass',
					host: 'api.twilio.com',
					path: '/',
				});
				var result = notifier.get({
					"To": "+18005551212",
					"From": "+18005551212",
					"Body": "TEST"
				}, function(err, code, data) {
					console.log('-----['+err+']['+code+']['+data+']');
					done();
				});
			});
		});
	});
})();