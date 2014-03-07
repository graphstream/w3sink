[![Build Status](https://travis-ci.org/graphstream/w3sink.png?branch=master)](https://travis-ci.org/graphstream/w3sink)

# w3sink 

GraphStream's Web Interface

## Disclaimer 

w3sink is not a viable project yet. APIs are willing to change from one commit to another. 

## Use It 

Published versions of w3sink are located in the `dist` folder : 

- [w3sink.js](https://github.com/graphstream/w3sink/blob/master/dist/w3sink.js): the full library. 
- [w3sink.min.js](https://github.com/graphstream/w3sink/blob/master/dist/w3sink.min.js): the full minified library.  
- [w3sink.min.map](https://github.com/graphstream/w3sink/blob/master/dist/w3sink.min.map): useful when using the minified version and debugging with Developer Tools. 

W3Sink uses [bower](http://bower.io/) to publish new releases so you don't need to clone the repository if you want to use w3sink.  

Bower is the easiest and recommended way to get the library. However you will need [node.js](http://nodejs.org/) installed in order to use bower. 

Then make use you have bower installed:

```bash
npm install -g bower
```

Then actually install w3sink:

```bash 
bower install w3sink
```

This will create a `bower_components` folder with w3sink in it. Now you can add w3sink to your web pages: 
```html
<script src="bower_components/w3sink/dist/w3sink.min.js"></script>
```

## Hack it

The files of the library are located in the `lib` folder. The `test` folder contains Qunit test. The `demos` folder contains less organized and more *broken* stuff. 

The project uses grunt and bower to automate various tasks so you will need node, grunt and bower installed. 

After node is installed, run this on the root folder. It will install all the dependencies: 
```bash
npm install -g bower
npm install -g grunt-cli
npm install
bower install
```

Once installed you can build the lib (`grunt build`) and then run the tests (`grunt test`). 




