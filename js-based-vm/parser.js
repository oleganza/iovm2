#!/usr/bin/env js


// parses code into AST of messages
// In:  Lobby print[hello world[1,2,""], a = 1]
/* Out: [
          {name: "Lobby", args:[]}, 
          {
            name: "print", 
            args: [ 
              [{name: "hello", args:[]}, {name:"world", args:[ [1],[2],[""] ]}],
              [{name: "q=", args: [ [1] ]}]
            ]
          }                        
        ]
*/
(function(){
  
  /*
    main       := optspace expression
    expression := message optspace expression
    message    := number | string | method | ";" | "\n" | ""
    
    number     := signed | unsigned
    signed     := sign optspace unsigned
    sign       := "+" | "-"
    unsigned   := float | integer
    integer    := digit integer | digit
    float      := integer "." integer
    digit      := 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    
    string     := string1 | string2
    string1    := "'" text1 "'"
    string2    := '"' text2 '"'
    text1      := chunk1 text1
    text2      := chunk2 text2
    chunk1     := word1 | escape1
    chunk2     := word2 | escape2
    
    
    space      := " " | "\t" | "\v"
    optspace   := spaces | ""
    spaces     := space optspace
    
    var space    = One(" ", "\t", "\v")
    var optspace = Optional(spaces)
    var spaces   = All(space, optspace)
    
  */
  
  
  var result = (function(text){
    
    // The Y Combinator
    var Y=function (gen) {
    return function(f) {return f(f)}(
     function(f) {
      return gen(function() {return f(f).apply(null, arguments)})})}
    
    function ToArray(args)
    {
      var arr = []
      for (var i = 0; i < args.length; i++) arr.push(args[i])
      return arr
    }
    
    function Optional(func)
    {
      return function(text, state) {
        return func(text, state) || text
      }
    }
    
    function Char(string)
    {
      return function(text, state) {
        return ((string.indexOf(text.charAt(0)) > -1) ? text.substr(1) : null)
      }
    }
    
    function Any()
    {
      var args = ToArray(arguments)
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
    
    function All()
    {
      var args = ToArray(arguments)
      return function(text, state) {
        for each (var arg in args)
        {
          text = arg(text, state)
          if (!text) return text
        }
        return text
      }
    }
    
    function Capture(func, hook)
    {
      return function(text, state)
      {
        var r = func(text, state)
        if (r) hook(text.substr(0, text.length - r.length), state)
        return r
      }
    }
    
    /*
    sign       := "+" | "-"
    digit      := 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    integer    := digit integer | digit
    float      := integer "." integer
    unsigned   := float | integer
    signed     := sign optspace unsigned
    number     := signed | unsigned
    */

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
    var numberslist = All(optspace, numbers, optspace)

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
    
    print(sequence)
    print(list)
    
    var scanner = All(optspace, list, optspace)
    
    var state = {
      numbers: [],
      lists:   [],
      list:    null
    }
    
    var r = scanner(text + " ", state) // tail space is intended
    if(!r)
      print("Syntax error!")
    else
      print("Result is '"+ r +"'")
    
    return state
    
  })(" [ [ 1 ], 2 ] ")
  
  function main()
  {
    print(result)
  }
  
  var Parse = function(text)
  {
    var stack  = []
    var ast    = []
    var cursor = null
    var line   = 1
    
    var Error = function(msg) {
      throw ("Parse error at line " + line + ": " + msg)
    }
    
    function TODO(msg)        { Error("TODO: " + msg) }
    function Unexpected(char) { Error("Unexpected character '" + char + "'") }
    
    var Method = function(char) {
      if (char.match(/\d/)) {
        TODO("numbers are not supported")
      } else if (char.match(/"'/)) {
        TODO("strings are not supported")
      } else if (char.match(/\w/)) {
        cursor = Method
      } else {
        Unexpected(char)
      }
      cursor(char)
    }
    
    var Expression = function(char) {
      if (char.match(/\d/)) {
        TODO("numbers are not supported")
      } else if (char.match(/"'/)) {
        TODO("strings are not supported")
      } else if (char.match(/\w/)) {
        cursor = Method
      } else {
        Unexpected(char)
      }
      cursor(char)
    }
    
    cursor = Expression
    for (var i = 0; i < text.length; i++)
    {
      cursor(text.charAt(i))
      if (text.charAt(i) == "\n") line += 1
    }
    
    return ast
  }
  

  
  // Aux
  
  
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
  
  // print([
  //           {name: "Lobby", args:[]}, 
  //           {
  //             name: "print", 
  //             args: [ 
  //               [{name: "hello", args:[]}, {name:"world", args:[ [1],[2],[""] ]}],
  //               [{name: "q=", args: [ [1] ]}]
  //             ]
  //           }                        
  //         ])
  
})()

