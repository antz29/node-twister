var assert = require('assert');

var tests = {
	'The rules will be empty initially.' : function(beforeExit, assert) {
		var r = require('twister').create();
		assert.ok(r.getRules() == 0);	
	},
	'Adding one rule.' : function(beforeExit, assert) {
		var r = require('twister').create();

		var rule1 = {from:'/bar',to:'/baz'};
		var rule2 = {from:'/bop',to:'/bat'};

		r.addRule(rule1);

		var rules = r.getRules();
	
		assert.equal(rules.length,1);
		assert.deepEqual(rules[0], rule1);

		r.addRule(rule2);

		var rules = r.getRules();

		assert.equal(rules.length,2);
		assert.deepEqual(rules[1], rule2);	
	},
	'Rules can be retrieved' : function(beforeExit, assert) {
		var r = require('twister').create();

		var rule1 = {from:'/bar',to:'/baz'};
		r.addRule(rule1);

		var rules = r.getRules();

		assert.equal(rules.length,1);
	},
	'Add a batch of rules.' : function(beforeExit, assert) {
		var r = require('twister').create();
	
		var rules1 = [{from:'/bar',to:'/baz'},{from:'/bop',to:'/bat'}];
		var rules2 = [{from:'/bing',to:'/bong'},{from:'/foo',to:'/bar'}];

		r.addRules(rules1);

		var rules = r.getRules();

		assert.equal(rules.length,2);
		assert.deepEqual(rules, rules1);

		r.addRules(rules2);

		var rules = r.getRules(); 

		assert.equal(rules.length,2);
		assert.deepEqual(rules, rules2);		
	},
	'Rules can be cleared.' : function(beforeExit, assert) {
		var r = require('twister').create();
		
		var rules = [{from:'/bar',to:'/baz'},{from:'/bop',to:'/bat'}];

		r.addRules(rules);

		var rules = r.getRules(); 

		assert.equal(rules.length,2);
		assert.deepEqual(rules, rules);

		r.clearRules();

		assert.ok(r.getRules().length == 0);			
	}
};

// * `/foo/bar` - Static mapping
matchTest('/foo','/bar',{
	'/foo' : '/bar',
	'/faz' : false
});

// * `/foo/*` - Will match /foo/bar /foo/bar/baz etc.
matchTest('/foo/*','/bar',{
	'/foo/bar' : '/bar',
	'/foo/bar/baz' : '/bar',
	'/foo' : false,
	'/fii/bar' : false
});

// * `/foo/*/bar` - Will match /foo/super/bar but not /foo/boo/baa/bar or /foo/bar
  matchTest('/foo/*/bar','/bar',{
	'/foo/super/bar' : '/bar',
	'/foo/boo//bar/baz' : false
});

// * `/foo/*/*` - Will match /foo/bing/bar and /foo/bop/bar/bat but not /foo/boo
matchTest('/foo/*/*','/bar',{
	'/foo/bing/bar' : '/bar',
	'/foo/bop/bar/bat' : '/bar',
	'/foo/boo' : false
}); 

//  * `/foo/bar/* -> /controller/action/*`
//    * This will use the end of the URI matched by the `*` and replace the `*` in the target URI.  
//    * `/foo/bar/12345 -> /controller/action/12345`
//    * `/foo/bar/12345/fred -> /controller/action/12345/fred`
matchTest('/foo/bar/*','/controller/action/*',{
	'/foo/bar/12345' : '/controller/action/12345',
	'/foo/bar/12345/fred' : '/controller/action/12345/fred'
}); 

//  * `/foo/*/* -> /controller/*/data/*`
//    * This will take each `*` in the route and map it to each `*` in the target URI respectively.
//    * `/foo/bar/12345 -> /controller/bar/data/12345`
//    * `/foo/bing/boing/bang -> /controller/bing/data/boing/bang`
matchTest('/foo/*/*','/controller/*/data/*',{
	'/foo/bar/12345' : '/controller/bar/data/12345',
	'/foo/bing/boing/bang' : '/controller/bing/data/boing/bang'
});

//  * `/foo/*/* -> /controller/{2}/{1}`
//    * This will take each `*` in order and map the first `*` to `{1}` the second to `{2}` etc.
//    * `/foo/pop/weasel -> /controller/weasel/pop`
//    * `/foo/egg/chicken -> /controller/chicken/egg`
matchTest('/foo/*/*','/controller/{2}/{1}',{
	'/foo/pop/weasel' : '/controller/weasel/pop',
	'/foo/egg/chicken' : '/controller/chicken/egg'
});

module.exports = tests;

function matchTest(from,to,uris) {
	var uri, expected, desc;

	var r = require('twister').create();
	r.addRule({from:from,to:to});

	for (uri in uris) {
		expected = uris[uri];
				
		if (expected === false) {
			desc = 'The rule ' + from + ' -> ' + to + ' does not match the uri ' + uri;
		}	
		else {
			desc = 'The rule ' + from + ' -> ' + to + ' matches the uri ' + uri;
		}

		tests[desc] = (function(uri,expected) { 
			return function(beforeExit, assert) {
				r.twist(uri,function(to_uri) {
					//console.log(from + ' -> ' + to + ' - ' + uri + ' -> ' + to_uri);
					if (!expected) expected = uri;
					assert.equal(to_uri,expected);
				});
			};		
		})(uri,expected);	
	}

}
