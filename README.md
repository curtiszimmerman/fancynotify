Installation
============

fancynotify is installable from npm:

```sh
  $ npm install fancynotify
```

Additionally, adding fancynotify to package.json dependencies will 
enable installing the package with `npm install`:

```javascript
  "dependencies": {
    "fancynotify": "0.0.1"
  }
```
 
Configuration
=============
 
fancynotify exposes the following functions:

  .down( config, server );

  This function makes an HTTPS call to the Twilio API and accepts 
  two paramters:

```javascript  
  config.to = '+18885551212';     // the number to notify
  config.from = '+15125551212';   // the sending number of the notification
  config.account = 'abcdef';      // the Twilio account ID
  config.secret = '123456';       // the Twilio account secret

  server.name = 'foo.bar';        // name of down server
```
```

License
=======

fancynotify is (C) 2015 curtis zimmerman and released under the MIT license.
