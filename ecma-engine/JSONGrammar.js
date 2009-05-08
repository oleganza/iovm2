var StringGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  var SingleQuotedString = All(Char("'"), Char("abcd"), Char("'"))
  var DoubleQuotedString = All(Char('"'), Optional(
    Any(
      All(
        "\\",
        Char("TODO: list of control characters")
      ),
      NotChar("\"\\")
    )
  ), Char('"'))
  return Any(SingleQuotedString, DoubleQuotedString)
}
