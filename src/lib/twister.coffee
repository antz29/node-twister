minimatch = require('minimatch')
EventEmitter = require('events').EventEmitter

matchIt = (rule,uri) -> 
  if (rule == uri) then return true 

  test_rule = rule

  if (test_rule.substr(-1) == '*') then test_rule += '*'

  if (minimatch(uri,test_rule)) then return true;

  return false;

rewriteIt = (uri,rule) ->
  return rule.to if ( rule.to.indexOf("*") == -1 && rule.to.indexOf("{") == -1 )

  uri_segments = uri.split('/').filter (val) -> if val then true else false
  from_segments = rule.from.split('/').filter (val) -> if val then true else false
  to_segments = rule.to.split('/').filter (val) -> if val then true else false

  caps = []
  out = [] 
  i = 0

  for from_seg in from_segments 
    do (from_seg) ->
      from_seg = from_segments.shift()
      if from_seg == '*' and from_segments.length
        caps.push(uri_segments.shift()) 
      else if from_seg == '*' and !from_segments.length
        caps.push(uri_segments.join('/'))
      else
        uri_segments.shift()

  for to_seg in to_segments
    do (to_seg) ->
      to_seg = to_segments.shift()

      if to_seg == '*'
        out.push(caps.shift())
      else if to_seg.indexOf('{') != -1
        re = /\{([0-9]+)\}/g
        loop
          match = re.exec(to_seg)
          break unless match?
          ind = parseInt(match[1], 10) - 1
          to_seg = to_seg.replace(match[0], caps[ind])
        out.push to_seg
      else
        out.push to_seg

  return '/' + out.join('/')

class Twister    

  constructor: ->
    @rules = []

  addRules: (rules) ->
    @rules = rules || []

  addRule: (rule) ->
    @rules.push(rule)

  getRules: ->
    return @rules

  clearRules: ->
    @rules = []

  twist: (uri,callback) ->

    matchRule = (batch) =>
      rule = @rules[i]
      return callback(rewriteIt(uri, rule)) if matchIt(rule.from, uri)
      i++

      if i < count and batch
        batch--
        matchRule(batch)
      else if i < count and !batch
        process.nextTick matchRule(15)
      else
        return callback(uri)

      null
    i = 0
    count = @rules.length
    return callback(uri) unless count
    matchRule(15)

module.exports = Twister
