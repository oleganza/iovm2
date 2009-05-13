#!/usr/bin/env js

load("Util.js")

var VM = (function(){
  
  var Coro = O.create(function(){
    
  })
  
  var State = O.create(function(){
    this.message     = null // message to be sent
    this.chainTarget = null // target for a chain of messages (equals to target in the beginning of the chain or after ";")
    this.target      = null // current target for a message
    this.locals      = null // "call context" - object who sent a message to the "target"
    this.coroutine   = null // current coroutine (stack)
    this.value       = null  // current slot value (set by lookupSlot)
  })
  
  var Message = O.create(function(){
    
  })
  
  var VM = O.create(function(){
    this.run = function(){
      
    }
  })
  
  VM.State   = State
  VM.Message = Message
  
  return VM
})()

//
// Test
//


var vm = VM.create()

vm.run()

//var Message = IoVM.Message
//IoVM.create

//print(Array.prototype.slice.call(arguments))
//print(arguments)
