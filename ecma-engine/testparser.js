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
  
  
  
  function main()
  {
    print(TestGrammar(Parser))
  }
  
  // Pretty print  
  
  main()
  
})()

