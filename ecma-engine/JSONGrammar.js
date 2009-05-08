var StringGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  var SingleQuotedString = All(Char("'"), Char("abcd"), Char("'"))
  var DoubleQuotedString = All(Char('"'), Char("abcd"), Char('"'))
  return Any(SingleQuotedString, DoubleQuotedString)
}
