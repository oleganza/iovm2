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


