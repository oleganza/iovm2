#!/usr/bin/env js
(function(){
  
  var Grammar = function(All, Any, Capture, Char, Optional, Y)
  {
    var spacechar   = Char(" \t")
    var optspace    = Y(function(os){ return Optional(All(spacechar, os)) })
    var space       = All(spacechar, optspace)
    
    var sign        = Char("+-")
    var digit       = Char("0123456789")
    var integer     = Y(function(i){ return All(digit, Optional(i)) })
    var float       = All(integer, Char("."), integer)
    var unsigned    = Any(float, integer)
    var signed      = All(sign, optspace, unsigned)
    var number      = Capture(Any(signed,unsigned), function(buffer, state) { 
      state.numbers.push(buffer)
    })
    
    var numbers     = Y(function(ns){ return All(number, optspace, Optional(ns)) })
    
    var openbracket  = Char("[")
    var closebracket = Char("]")
    
    var sequence = function(start, item, separator, end) { 
      return Y(function(seq) {
        return All(start, Optional(Any(All(item, separator, seq), item)), end)
      })
    }
    
    var list = Y(function(lst){
      var word = Any(number/*, string, identifier */)
      var item = Any(word, lst)
      return sequence(openbracket, item, Char(","), closebracket)
    })
    
    var numberslist = All(optspace, numbers, optspace)
    var singlelist  = All(optspace, list, optspace)
    
    return numberslist
  }
  
  
  var Text = " 123 +12321 -42.34"
  
  
  var TestGrammar = function(Grammar, Parser, text)
  {
    var parser = Parser(Grammar)
    
    var state = {
      numbers: [],
      lists:   [],
      list:    null
    }
    
    var r = parser(text + " ", state) // tail space is intended
    
    if(!r)
      print("Syntax error!")
    else
      print("Result is '"+ r +"'")
    
    return state
  }
  
  
  var Parser = function(grammar)
  {
    var toArray = function(args)
    {
      var arr = []
      for (var i = 0; i < args.length; i++) arr.push(args[i])
      return arr
    }
    
    // The Y Combinator
    var Y = function (gen) {
      return (function(f) {return f(f)})(
        function(f) {
          return gen(function() {return f(f).apply(null, arguments)})
        }
      )
    }
    
    var Optional = function(func)
    {
      return function(text, state) {
        return func(text, state) || text
      }
    }
    
    var Char = function(string)
    {
      return function(text, state) {
        return ((string.indexOf(text.charAt(0)) > -1) ? text.substr(1) : null)
      }
    }
    
    var Any = function()
    {
      var args = toArray(arguments)
      return function(text, state) {
        var r = null
        for each (var arg in args)
        {
          r = arg(text, state)
          if (r) return r
        }
        return null
      }
    }
    
    var All = function()
    {
      var args = toArray(arguments)
      return function(text, state) {
        for each (var arg in args)
        {
          text = arg(text, state)
          if (!text) return text
        }
        return text
      }
    }
    
    var Capture = function(func, hook)
    {
      return function(text, state)
      {
        var r = func(text, state)
        if (r) hook(text.substr(0, text.length - r.length), state)
        return r
      }
    }
    
    return grammar(All, Any, Capture, Char, Optional, Y)
  }
    
  
  function main()
  {
    print(TestGrammar(Grammar, Parser, Text))
  }
  
  
  Array.prototype.toString = 
  Object.prototype.toString = function() {
    var cont = []
    var addslashes = function(s) {
      // You cannot use replace() - Opera uses toString() inside replace()
      return (s+"").split('\\').join('\\\\').split('"').join('\\"')
    }
    for (var k in this) 
    {
      if (cont.length) cont[cont.length-1] += ","
      var v = this[k]
      var vs = ''
      if (typeof(v) == "string"){
        vs = '"' + addslashes(v) + '"'
      }else 
        vs = v
      
      if (typeof this.constructor == Array)
        cont[cont.length]
      else 
        cont[cont.length] = k + ": " + vs
    }
    // Don't use replace() here too! 
    cont = "  " + cont.join("\n").split("\n").join("\n  ")
    var s = cont
    if (this.constructor == Object) {
      s = "{\n"+cont+"\n}"
    } else if (this.constructor == Array) {
      s = "[\n"+cont+"\n]"
    }
    return s
  }
  
  
  main()
  
})()

