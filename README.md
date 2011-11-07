node-twister - Twist your URIs

## Installation

    npm install twister

## What's it do?

It allows you to rewrite URIs using a simple syntax. This can be
useful for routing requests etc.

## Usage

    // Create a new rewriter (you can have multiple rewriter instances that are independant of one another)
    var tw = require("twister").create();

    // Add a rule that will map the URI /foo to /bar.
    tw.addRule({
       from : '/foo',
       to : '/bar'
    });

    // Outputs: /bar
    tw.rewrite('/foo',function(rewrite) {
	console.log(rewrite);
    });

    // Outputs: /bop (if a URI doesn't match a rule, it is just returned as is)
    tw.rewrite('/bop',function(rewrite) {
	console.log(rewrite);
    });


## Bugs

See <https://github.com/antz29/node-twisted/issues>.
