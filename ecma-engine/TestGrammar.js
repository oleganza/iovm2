var SimpleLisp = function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After)
{
  var item = Y(function(item){
    
    var seq = Y(function(seq){
      return Any(All(item, Char(","), seq), item)
    })
    
    var optseq = Optional(seq)
    var list   = Before(All(Char("["), optseq, Char("]")), function(s){ return [] })
    var char   = Capture(Char("qwertyuiopasdfghjklzxcvbn"), function(buf, state){ return buf })
    
    return After(Any(list, char), function(s1, s2) { return s1.concat([s2]) })
  })
  return All(item, EOF)
}
