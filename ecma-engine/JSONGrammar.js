var controlCharMap = {
  "b": "\b",
  "f": "\f",
  "n": "\n",
  "r": "\r",
  "t": "\t"
}

var StringGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{  
  var content = function(quote)
  {
    return Y(function(content){
      var anyChar     = NotChar(quote + "\\")
      // js accepts anything after backslash
      var controlChar = NotChar("") // Char("\'\"\\/bfnrt") 

      anyChar = Capture(anyChar, function(buf, s){ 
        return s + buf 
      })

      controlChar = Capture(controlChar, function(buf, s) {
        return s + (controlCharMap[buf] || buf)
      })
      
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
  
  var init = function(s){ return "" }
  
  var SingleQuotedString = Before(All(
    Char("'"), Optional(content("'")), Char("'")
  ), init)
  
  var DoubleQuotedString = Before(All(
    Char('"'), Optional(content('"')), Char('"')
  ), init)
  
  return Any(SingleQuotedString, DoubleQuotedString)
}
