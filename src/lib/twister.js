/**
 * @api private
 */
function NodeTwister() {
	var	rules = [],
		minimatch = require('minimatch');

	function matchIt(rule,uri) {
		if (rule === uri) { 
			return true; 
		}

		var test_rule = rule;

		if (test_rule.substr(-1) === '*') {
			test_rule += '*';
		}

		if (minimatch(uri,test_rule)) {
			return true;
		}

		return false;
	}

	function rewriteIt(uri,rule) {
		if ( rule.to.indexOf("*") === -1 && 
			rule.to.indexOf("{") === -1 ) 
		{ return rule.to; }

		var	uri_segments = uri.split('/').filter(function(val) { 
				return val ? true : false; 
			}),
			from_segments = rule.from.split('/').filter(function(val) { 
				return val ? true : false; 
			}),
			to_segments = rule.to.split('/').filter(function(val) { 
				return val ? true : false; 
			}),
			caps = [],out = [], i = 0, to_seg, from_seg, match, ind;

		while (from_segments.length) {
			from_seg = from_segments.shift();

			if (from_seg === '*' && from_segments.length) {
				caps.push(uri_segments.shift());
			}
			else if (from_seg === '*' && !from_segments.length) {
				caps.push(uri_segments.join('/'));
			}
			else {
				uri_segments.shift();
			}
		}

		while (to_segments.length) {
			to_seg = to_segments.shift();

			if (to_seg === '*') {
				out.push(caps.shift());
			}
			else if (to_seg.indexOf('{') !== -1) {
                            var re = /\{([0-9]+)\}/g;
                            while(true) {
				match = re.exec(to_seg);
                                if (match==null)
                                    break;
				ind = parseInt(match[1],10) - 1;
				to_seg = to_seg.replace(match[0],caps[ind]);
                                re.lastIndex+= caps[ind].length+1;
                            }
                            out.push(to_seg);
                            console.log(out);
			}
			else {
				out.push(to_seg);
			}
		}

		return '/' + out.join('/');
	}

	this.addRules = function(new_rules) {
		rules = new_rules;
	};

	this.addRule = function(rule) {
		rules.push(rule);
	};

	this.getRules = function() {
		return rules;
	};

	this.clearRules = function() {
		rules = [];
	};

	this.twist = function(uri,callback) {
		var i = 0,
		count = rules.length;

		if (!count) {
			return callback(uri);
		}
                while (i<count) {
                    if (matchIt(rules[i].from,uri)) {
                        return callback(rewriteIt(uri,rules[i]));
                    }
                    i++;
                }
                return callback(uri);
        };
}

/**
 * Create a new twister instance.
 *
 * Examples:
 *
 *     var rw = require('twister').create();
 *     rw.addRule( { from: '/foo' : to : '/bar' });
 *
 *     rw.twist('/foo',function(rw_uri) {
 *       console.log(rw_uri);
 *     });
 *
 *     // => /bar
 *
 * @return {NodeTwister} NodeTwister instance.
 * @api public
 */
exports.create = function() { return new NodeTwister(); };
