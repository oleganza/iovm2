var controlCharMap = {
  "b": "\b",
  "f": "\f",
  "n": "\n",
  "r": "\r",
  "t": "\t"
}

var StringGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{  
  var content = Y(function(content){
    var anyChar     = NotChar("\"\\")
    // js accepts anything after backslash
    var controlChar = NotChar("") //Char("\'\"\\/bfnrt") 
    
    anyChar = Capture(anyChar, function(buf, s){ 
      return s + buf 
    })
    
    controlChar = Capture(controlChar, function(buf, s) {
      return s + (controlCharMap[buf] || buf)
    })
    
    return All(
      Any(
        All(
          Char("\\"),
          controlChar
        ),
        anyChar
      )
      //, Optional(content)
    )
  })
  
  var init = function(s){ return "" }
  
  var SingleQuotedString = Before(All(
    Char("'"), Optional(content), Char("'")
  ), init)
  
  var DoubleQuotedString = Before(All(
    Char('"'), Optional(content), Char('"')
  ), init)
  
  return Any(SingleQuotedString, DoubleQuotedString)
}
