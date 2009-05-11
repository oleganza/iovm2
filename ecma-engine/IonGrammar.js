var IonGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  /*
    Base grammar:
      message
      message1 message2
      message1; message2
      message1[msg1, msg2, ...]
      id=[message]
      
    Extra (in Ion-based parser):
    - operators
    - brackets
    
  */
  
  var Plus = function(rule)
  {
    return Y(function(seq){
      return Any(All(rule, seq), rule)
    })
  }
  
  var lineSpace     = Plus(Char(" \t"))
  var space         = Char(" \t\n\r")
  var optLineSpace  = Optional(lineSpace)
  var optSpace      = Optional(space)
  
  return Y(function(MessageChain){
    
    var assignment = All()
    
    var solo = Any(assignment, call)
    var tail = Any(statementTail, nextMessageTail)
    return Any(All(solo, tail), solo)
  })
    
}
