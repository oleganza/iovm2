var JSONGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  return Y(function(Value){
    
    var lineSpace     = Char(" \t")
    var space         = Any(Char("\n\r"))
    var optLineSpace  = Optional(lineSpace)
    var optSpace      = Optional(space)
    
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
    
    var ObjectGrammar = function()
    {
      var init = function(s) { return {} }
      
      var seq = Y(function(seq){
        var item = All(StringGrammar, optSpace, Char(":"), optSpace, Value)
        return Any(All(item, optSpace, Char(","), optSpace, seq), item)
      })
      
      Before(All(
        Char("{"), optSpace, Optional(seq), optSpace, Optional(","), optSpace, Char("}")
      ), init)
    }
    
    // TODO: numbers, arrays, true/false/null
    return Any(StringGrammar, ObjectGrammar)
    
  }) 
    
}

var BooleanGrammar = JSONGrammar
var NumberGrammar  = JSONGrammar
var StringGrammar  = JSONGrammar
var ArrayGrammar   = JSONGrammar
var ObjectGrammar  = JSONGrammar
