var JSONGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  return Y(function(Value){
    
    var lineSpace     = Char(" \t")
    var space         = Char(" \t\n\r")
    var optLineSpace  = Optional(lineSpace)
    var optSpace      = Optional(space)
    
    var Constant = function(name)
    {
      return function(text, state) {
        return ((text.substr(0, name.length) == name) ? [text.substr(name.length), state] : null)
      }
    }
    keywords = {'true':true, 'false':false, 'null':null}
    var Keyword = Capture(Any(Constant("true"), Constant("false"), Constant("null")), function(buf, state){ return keywords[buf] })
    
    var StringGrammar = (function()
    {
      var controlCharMap = {
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t"
      }
      
      var init        = function(s)      { return "" }
      var anyCapture  = function(buf, s) { return s + buf }
      var ctrlCapture = function(buf, s) { return s + (controlCharMap[buf] || buf) }
      
      var content = function(quote)
      {
        return Y(function(content){
          var anyChar     = NotChar(quote + "\\")
          // js accepts anything after backslash
          var controlChar = NotChar("") // Char("\'\"\\/bfnrt") 

          anyChar = Capture(anyChar, anyCapture)

          controlChar = Capture(controlChar, ctrlCapture)

          var item = Any(
            All(
              Char("\\"),
              controlChar
            ),
            anyChar
          )

          return Any(All(item, content), item)
        })
      }

      var SingleQuotedString = Before(All(
        Char("'"), Optional(content("'")), Char("'")
      ), init)

      var DoubleQuotedString = Before(All(
        Char('"'), Optional(content('"')), Char('"')
      ), init)

      return Any(SingleQuotedString, DoubleQuotedString)
    })()
    
    var ObjectGrammar = (function()
    {
      var init        = function(s)          { return {} }
      var beforeTuple = function(obj)        { return [] }
      var afterTuple  = function(obj, tuple) { obj[tuple[0]] = tuple[1]; return obj }
      var afterKey    = function(tuple, str) { tuple.push(str); return tuple }
      var afterValue  = function(tuple, val) { tuple.push(val); return tuple }
      
      var seq = Y(function(seq){
        var item = All(After(StringGrammar, afterKey), 
                       optSpace, 
                       Char(":"), 
                       optSpace, 
                       After(Value, afterValue))
        item = After(Before(item, beforeTuple), afterTuple)
        return Any(All(item, optSpace, Char(","), optSpace, seq), item)
      })
      
      return Before(All(
        Char("{"), 
        optSpace, Optional(seq), optSpace, Optional(Char(",")), optSpace,
        Char("}")
      ), init)
    })()
    
    var ArrayGrammar = (function()
    {
      var init      = function(s)        { return [] }
      var afterItem = function(arr, val) { arr.push(val); return arr }
      
      var seq = Y(function(seq){
        var item = After(Value, afterItem)
        return Any(All(item, optSpace, Char(","), optSpace, seq), item)
      })
      
      return Before(All(
        Char("["),
        optSpace, Optional(seq), optSpace, Optional(Char(",")), optSpace,
        Char("]")
      ), init)
    })()
    
    // TODO: numbers, arrays
    return Any(StringGrammar, ObjectGrammar, ArrayGrammar, Keyword)
    
  }) 
    
}

var KeywordGrammar = JSONGrammar
var NumberGrammar  = JSONGrammar
var StringGrammar  = JSONGrammar
var ArrayGrammar   = JSONGrammar
var ObjectGrammar  = JSONGrammar
