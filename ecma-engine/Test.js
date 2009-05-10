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
    
    _ = (function(t){ 
      t("{'a':1}")
    })(function(result){
      verify("ObjectGrammar " + result, Parser(ObjectGrammar), result, {}, {})
    })
    
    verify("(F) This test should fail with false result", EOF, "Quick fox",1,1)
    verify("(E) This test should fail with exception", function(){ throw "test exception thrown!" }, "Quick fox",1,1)
    
  }
})

/////////////////////////////////////////////////////////////////////////////

var counter = {passed:0, failures:0}

var TestSuite = {
  compare: function(a, b)
  {
    if (a && b && typeof(a) == "object" && typeof(a) == typeof(b) && a.constructor == b.constructor) {
      if (a.constructor == Array)  return this.compareArrays(a,b)
      if (a.constructor == Object) return this.compareObjects(a,b)
    }
    return a == b
  },
  compareObjects: function(a, b)
  {
    return this.compareArrays(this.objectToArray(a), this.objectToArray(b))
  },
  compareArrays: function(a, b)
  {
    for (var i in a) if (!this.compare(a[i], b[i])) return false
    return true
  },
  objectToArray: function(o)
  {
    var keys = []
    var arr = []
    for (var k in o) keys.push(k)
    keys = keys.sort()
    for each(var k in keys) arr.push([k, o[k]])
    return arr
  },
  assert: function(title, func)
  {
    try {
      return this.assertEquals(title, !!func(), true)
    } catch(e) {
      if (title.indexOf("(E)") == 0)
      {
        counter.passed++
        return true
      } else {
        counter.failures++
        print("E " + title + ": " + e)
        return false
      }
    } // try
  },
  assertEquals: function(title, a, b)
  {
    var r = TestSuite.compare(a, b)
    if (r || (! r && title.indexOf("(F)") == 0))
    {
      counter.passed++
      return true
    }
    else
    {
      counter.failures++
      print("F " + title)
      return false
    }
  }
}

TestSuite.assertEquals("true == true",       true,  true)
TestSuite.assertEquals("(F) false == true",  false, true)
TestSuite.assertEquals("[] == []", [], [])
TestSuite.assertEquals("[[],1] == [[],1]", [[],1], [[],1])
TestSuite.assertEquals("{} == {}", {}, {})
TestSuite.assertEquals("{'a':1} == {a:1}", {'a':1}, {a:1})

test(function(title, grammar, text, state, result){
  TestSuite.assert(title, function(){
    return TestSuite.compare(Parse(grammar, text, state), result)
  })
})

print(counter.passed + " tests passed, " + counter.failures + " failures")

