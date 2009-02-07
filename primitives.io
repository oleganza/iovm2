# List of primitives written in a form of bytecode sequences

Bytecodes := Object clone do(
  halt                     := 1 # stop VM execution
  copyCachedResultToTarget := 2 # retrieve cached result, set it to "target"
  nextMessage              := 3 # retrieve next message, set it to "message"
  resetTarget              := 4 # set target := chainTarget (after ";" message)
  activateBuiltin          := 5 # locate builtin code within message and goto it
  createRawCallObject      := 6 
  switchMessageType        := 7
)

Macros := Object clone do(

  messageIsNil := message(
    popState
    # todo: end profiler measurement for @message
    nextMessage
  )
  messageHasCachedResult := message(
    copyCachedResultToTarget
    nextMessage
  )
  messageIsSemicolon := message(
    resetTarget
    nextMessage
  )
  messageIsRegular := message(
    lookupSlot # to @value
    ifMessageIsActivatable(
      activate, 
      readSlot
    )
  )

  activate := message(
    ifMessageIsBuiltin(
      activateBuiltin, 
      activateNonBuiltin
    )
  )
  readSlot := message(
    copyValueToTarget;        
    nextMessage
  )

  pushState := message(
    pushMessage
    pushChainTarget
    pushTarget
    pushLocals
  )

  popState := message(
    popLocals
    popTarget
    popChainTarget
    popMessage
  )

  createCall := message(
    createRawCallObject     # to @call
    setCallSender           # from stack
    setCallMessage          # from stack
    setCallActivated        # from @value (set by lookup)
    setCallCoroutine        # from @coroutine
    setCallSlotContext      # from @slotContext (set by lookup)
    setCallTarget           # from @target
  )
  
  activateNonBuiltin := message(
    # todo: start profiler measurement for @message
    pushState
    createLocals        # to @locals
    setLocalsSelf       # from @target
    createCall
    setLocalsUpdateSlot # builtin method
    setLocalsCall       # from @call
    getMessage          # @value message -> @message
    setTarget           # from @locals
    setChainTarget      # from @locals
    performMessage
  )
  
  performMessage := message(
    switchMessageType(
      messageIsNil,
      messageIsSemicolon,
      messageHasCachedResult,
      messageIsRegular
    )
  )
  
)

if(isLaunchScript,
  
  messageIsSemicolon println
  
)