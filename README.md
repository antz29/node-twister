# node-twister - Twist your URIs

## Installation

    npm install twister

## What's it do?

It allows you to rewrite URIs using a simple syntax. This can be
useful for routing requests etc.

## Usage
    
    // Load the Twister module
    var Twister = require("twister");
  
    // Create a new rewriter (you can have multiple rewriter instances that are independant of one another)
    var tw = new Twister();

    // Add a rule that will map the URI /foo to /bar.
    tw.addRule({
       from : '/foo',
       to : '/bar'
    });

    // Outputs: /bar
    tw.rewrite('/foo',function(twisted) {
      console.log(twisted);
    });

    // Outputs: /bop (if a URI doesn't match a rule, it is just returned as is)
    tw.rewrite('/bop',function(twisted) {
      console.log(twisted);
    });

## Rules

* Routes can support the following formats:
  * `/foo/bar` - Static mapping
  * `/foo/*` - Will match /foo/bar /foo/bar/baz etc.
  * `/foo/*/bar` - Will match /foo/super/bar but not /foo/boo/baa/bar or /foo/bar
                 - 
* Routes can capture segments from the URI and inject into the target URL:
  * `/foo/bar/* -> /controller/action/*`
    * This will use the end of the URI matched by the `*` and replace the `*` in the target URI.  
      * `/foo/bar/12345 -> /controller/action/12345`
      * `/foo/bar/12345/fred -> /controller/action/12345/fred`
  * `/foo/*/* -> /controller/*/data/*`
    * This will take each `*` in the route and map it to each `*` in the target URI respectively.
      * `/foo/bar/12345 -> /controller/bar/data/12345`
      * `/foo/bing/boing/bang -> /controller/bing/data/boing/bang`
  * `/foo/*/* -> /controller/{2}/{1}`
    * This will take each `*` in order and map the first `*` to `{1}` the second to `{2}` etc.
      * `/foo/pop/weasel -> /controller/weasel/pop`
      * `/foo/egg/chicken -> /controller/chicken/egg`
      * `/a/b/*/*/* -> /a/b?x={1}&y={2}&z={3}`

## Bugs

See <https://github.com/antz29/node-twister/issues>.
