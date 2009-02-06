# VM state is a set of registers with object pointers

message     ::= nil # message to be sent
chainTarget ::= nil # target for a chain of messages (equals to target in the beginning of the chain or after ";")
target      ::= nil # current target for a message
locals      ::= nil # "call context" - object who sent a message to the "target"
coroutine   ::= nil # current coroutine (stack)
value       ::= nil # current slot value (set by lookupSlot)
