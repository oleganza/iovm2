var StringGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  var SingleQuotedString = All(Char("'"), Char("abcd"), Char("'"))
  
  var DSContent = Y(function(DSContent){
    return All(
      Any(
        All(
          "\\",
          Char("\"\\/bfnrt")
        ),
        NotChar("\"\\")
      ),
      Optional(DSContent)
    )
  })
  var DoubleQuotedString = All(Char('"'), Optional(DSContent), Char('"'))
  return Any(SingleQuotedString, DoubleQuotedString)
}

