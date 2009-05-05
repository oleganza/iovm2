// parses code into AST of messages
// In:  Lobby print[hello world[1,2,""], a = 1]
/* Out: [
          {name: "Lobby", args:[]}, 
          {
            name: "print", 
            args: [ 
              [{name: "hello", args:[]}, {name:"world", args:[ [1],[2],[""] ]}],
              [{name: "q=", args: [ [1] ]}]
            ]
          }                        
        ]
*/


/*
  Io grammar
  
  main       := optspace expression
  expression := message optspace expression
  message    := number | string | method | ";" | "\n" | ""
  
  number     := signed | unsigned
  signed     := sign optspace unsigned
  sign       := "+" | "-"
  unsigned   := float | integer
  integer    := digit integer | digit
  float      := integer "." integer
  digit      := 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  
  string     := string1 | string2
  string1    := "'" text1 "'"
  string2    := '"' text2 '"'
  text1      := chunk1 text1
  text2      := chunk2 text2
  chunk1     := word1 | escape1
  chunk2     := word2 | escape2
  
  
  space      := " " | "\t" | "\v"
  optspace   := spaces | ""
  spaces     := space optspace
  
  var space    = One(" ", "\t", "\v")
  var optspace = Optional(spaces)
  var spaces   = All(space, optspace)
  
*/