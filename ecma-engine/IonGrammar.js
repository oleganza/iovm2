var IonGrammar = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  /*
    Base grammar:
      message
      message1 message2
      message1[msg1, msg2, ...]
      id = message
    
    Extra:
    - operators
    - brackets
    
  */
  
  
  var lineSpace     = Char(" \t")
  var space         = Char(" \t\n\r")
  var optLineSpace  = Optional(lineSpace)
  var optSpace      = Optional(space)
  
  
  
  return Y(function(Message){
    var tail = Any(All(optLineSpace, statementEnd), All())
    return Any(All(solo, tail), solo)
  }) 
    
}
