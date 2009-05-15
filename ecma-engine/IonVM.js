#!/usr/bin/env js

load("Util.js")

var VM = (function(){

  var SystemType = O.create(function(){
  })
  
  var MessageType = SystemType.create()
  var BuiltinType = SystemType.create()
  var BlockType   = SystemType.create()

  var ObjectProto = O.create(function(){
    this.sysType = null
    this.protos  = []
    this.slots   = {}
  })
    
  var Coroutine = O.create(function(){
    this.stack = null
    this.state = null
  })
  
  var State = O.create(function(){
    this.message     = null // message to be sent
    this.chainTarget = null // target for a chain of messages (equals to target in the beginning of the chain or after ";")
    this.target      = null // current target for a message
    this.locals      = null // "call context" - object who sent a message to the "target"
    this.value       = null // current slot value (set by lookupSlot)
  })
  
  var Message = O.create(function(){
    
  })
  
  var VM = O.create(function(){
    var coroutine = null
    var state     = null
    var stack     = null
    
    this.setCoroutine = function(coro){
      coroutine = coro
      state     = coro.state
      stack     = coro.stack
    }
    
    this.run = function(){
      if (!coroutine) throw "Coroutine is required"
      if (!state) throw "Coroutine state is required"
      if (!stack) throw "Coroutine stack is required"
      
      while (true) {
        // main loop till coroutine returns
        
        if (state.message == null)
      }
    }
  })
  
  VM.Coroutine = Coroutine
  VM.State     = State
  VM.Message   = Message
  
  return VM
})()


//
// Test
//

var vm = VM.create()

var state = vm.State.create(function(){
  this.message = msg
  
})

var coro = vm.Coroutine.create(function(){
  this.stack = []
  this.state = state
})

vm.setCoro(coro)
vm.run()

//var Message = IoVM.Message
//IoVM.create

//print(Array.prototype.slice.call(arguments))
//print(arguments)
