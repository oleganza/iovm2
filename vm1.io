# vm1 emulates current iovm by interpreting Io messages and emitting bytecode where needed.

VM1 := Object clone do(
  
  message  ::= nil
  locals   ::= nil
  receiver ::= nil
  
  run := method(
    processMessageChain
    "VM finished." println
  )
  
  processMessageChain := method(
    while(message isNil not, 
      if (message cachedResult,
        receiver = message cachedResult
        message = message next
      )
    )
  )
  
) 


if(isLaunchScript,
  
  Verificator := Object clone do(
    verify := method(a,
      if(a not, "!! Verification failed: " asMutable appendSeq(call message arguments first asString) println)
    )
  )
  
  Cases := Verificator clone do(
    helloWorld := method(
      setMessage(message("Hello, world!" 42))
      setLocals(Object clone)
      setReceiver(Object clone)
      run
      verify(message == nil)
    )
    
  )
  
  vm := VM1 clone
  vm appendProto(Cases)
  vm helloWorld
  
)
