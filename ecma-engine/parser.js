#!/usr/bin/env js
(function(){
  
  var Grammar = function(All, Any, Capture, Char, Optional, Y, EOF, Terminator, Before, After)
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
    
    var lbracket = Char("[")
    var rbracket = Char("]")
    
    var Sequence = function(start, item, separator, end) { 
      return Y(function(seq) {
        return All(start, Optional(Any(All(seq, separator, item), item)), end)
      })
    }
    
    var list = Y(function(lst){
      var word = Any(number/*, string, identifier */)
      var item = Any(word, lst)
      return Sequence(lbracket, item, Char(","), rbracket)
    })
    
    var numberslist = All(optspace, numbers, optspace)
    var singlelist  = All(optspace, list, optspace)
    
    var lispcap = function(buffer, state){ state.lists.push(buffer) }
    
    var lisp = Y(function(lst){
      return Capture(Sequence(Char("["), Any(lst, Char("qwertyuiopasdfghjklzxcvbn")), Char(","), Char("]")), lispcap)
    })
    
    /*
    
    term    = "abcdef..."
    seq     = (exp "," seq) | exp
    optseq  = seq | ""
    list    = "[" optseq "]"
    exp     = list | term
    */
    
    return lisp
  }
  
  var SimpleLisp = function(All, Any, Capture, Char, Optional, Y, EOF, Terminator, Before, After)
  {
    var item = Y(function(item){
      
      var seq = Y(function(seq){
        return Any(All(item, Char(","), seq), item)
      })
      
      var optseq = Optional(seq)
      var list   = Before(All(Char("["), optseq, Char("]")), function(s){ return [] })
      var char   = Capture(Char("qwertyuiopasdfghjklzxcvbn"), function(buf, state){ return buf })
      
      return After(Any(list, char), function(s1, s2) { return s1.concat([s2]) })
    })
    return All(item, EOF)
  }
  
  var Text = "[a,[b]]"
  
  var TestGrammar = function(Parser)
  {
    var parser = Parser(SimpleLisp)
    
    var ast = []
    
    var r = parser(Text, ast)
    
    if(!r)
    {
      print("Syntax error!")
    } else {
      var tail = r[0]
      var state = r[1] 
      return state
    }
    return null
  }
  
  
  var Parser = function(grammar)
  {
    var toArray = function(args) {
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
        return func(text, state) || [text, state]
      }
    }
    
    var EOF = function(text, state) { // matches the end of the text
      return (text == "" ? [text, state] : null)
    }
    
    var Terminator = function(text, state) { // terminates scanner (possibly in the middle of the text)
      return ["", state]
    }
        
    var Char = function(string)
    {
      return function(text, state) {
        // TODO: count line number on each text.substr(1)
        return ((text.length > 0 && string.indexOf(text.charAt(0)) > -1) ? [text.substr(1), state] : null)
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
        var r = null
        for each (var arg in args)
        {
          r = arg(text, state)
          if (!r) return r
          text  = r[0]
          state = r[1]
        }
        return [text, state]
      }
    }
    
    // hook: function(buffer, state) { return state }
    var Capture = function(func, hook)
    {
      return function(text, state)
      {
        var r = func(text, state)
        if (r) {
          var t = r[0]
          var s = r[1]
          return [t, hook(text.substr(0, text.length - t.length), s)]
        }
        return r
      }
    }

    // hook: function(state1) { return state2 }
    var Before = function(func, hook)
    {
      return function(text, state) {
        return func(text, hook(state))
      }
    }
    
    // hook: function(state1, state2) { return state3 }
    var After = function(func, hook)
    {
      return function(text, state) {
        var r = func(text, state)
        return [r[0], hook(state, r[1])]
      }
    }
    
    return grammar(All, Any, Capture, Char, Optional, Y, EOF, Terminator, Before, After)
  }
    
  
  function main()
  {
    print(TestGrammar(Parser))
  }
  
  // Pretty print
  
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

