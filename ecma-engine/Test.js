#!/usr/bin/env js
load("Util.js", "Parser.js", "TestGrammar.js", "JSONGrammar.js", "IonGrammar.js")

var test = Parser(function(All, Any, Capture, Char, NotChar, Optional, Y, EOF, Terminator, Before, After) {
  return function(verify)
  {
    (function(verify){
      verify("EOF",          EOF,            "")
      verify("Terminator",   Terminator,     "Quick fox")
      verify("Char 1",       Char("abc"),    "a")
      verify("Char 2",       Char("abc"),    "b")
      verify("Char 3",       Char("abc"),    "c")
      verify("NotChar 1",    NotChar("abc"), "x")
      verify("NotChar 2",    NotChar("abc"), "y")
      verify("NotChar 3",    NotChar(""),    "y")
      verify("All",          All(Char("a"),Char("b"),EOF),  "ab")
      verify("Any 1",        Any(Char("a"),Char("b"),EOF),  "a")
      verify("Any 2",        Any(Char("a"),Char("b"),EOF),  "b")
    })(function(title, grammar, text){
      return verify(title, grammar, text, 42, 42)
    })
    
    verify("Single quoted string (empty)",  Parser(StringGrammar), "''",     "", "")
    verify("Single quoted string (x)",      Parser(StringGrammar), "'x'",    "", "x")
    verify("Single quoted string (xy)",     Parser(StringGrammar), "'xy'",   "", "xy")
    verify("Single quoted string (x\\y)",   Parser(StringGrammar), "'x\\y'", "", "xy")
    
    var _ = (function(t){ 
      t("''");    t('""') 
      t("'\\''"); t('"\\""')
      t("'\\\'abc def \\nghijk \\\\\\\"lmnopq'")
      t("'\\n\\b\\t\\r\\f\\'\\\"'")
      t('"\\n\\b\\t\\r\\f\\\'\\""')
    })(function(result){
      verify("StringGrammar " + result, Parser(StringGrammar), result, "", eval(result))
    })
    
    
    verify("(F) This test should fail with false result", EOF, "Quick fox",1,1)
    verify("(E) This test should fail with exception", function(){ throw "test exception thrown!" }, "Quick fox",1,1)
    
  }
})

var counter = {passed:0, failures:0}

test(function(title, grammar, text, state, result){
  try {
    var r = (Parse(grammar, text, state) == result)
    if (r || (! r && title.indexOf("(F)") == 0))
    {
      counter.passed++
      //print("  " + title)
    }
    else
    {
      counter.failures++
      print("F " + title + ": result is " + r)
    }
  } catch(e) {
    if (title.indexOf("(E)") == 0)
    {
      counter.passed++
    } else {
      counter.failures++
      print("E " + title + ": " + e)
    }
  }
})

print(counter.passed + " tests passed, " + counter.failures + " failures")

