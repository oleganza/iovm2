# vm2 interprets bytecode and applies all filters to it.
# New bytecode sequence is stored in place of previously recorded one. 

VM2 := Object clone do(
  
  message  ::= nil 
  locals   ::= nil
  receiver ::= nil
  
  Instructions := Object clone do(
    
  )
  
  appendProto(Instructions)
)