# List of primitives written in a form of bytecode sequences

#
# Bytecodes
#

halt                     := 1 # stop VM execution
copyCachedResultToTarget := 2 # retrieve cached result, set it to "target"
nextMessage              := 3 # retrieve next message, set it to "message"
resetTarget              := 4 # set target := chainTarget (after ";" message)
activateBuiltin          := 5 # locate builtin code within message and goto it

#
# Conditions
#

messageIsNil := message(
  popState
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
  lookupSlot
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

activateNonBuiltin := message(
  pushState
  createLocals # to @locals
  setLocalsSelf
  createCall # to @call
  
)

if(isLaunchScript,
  
  messageIsSemicolon println
  
)