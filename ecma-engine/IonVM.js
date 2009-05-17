#!/usr/bin/env js

load("Util.js")

var VM = (function(){

  var SystemType = O.create(function(){
  })
  
  var ObjectType  = SystemType.create()
  var MessageType = SystemType.create()
  var BuiltinType = SystemType.create()
  var BlockType   = SystemType.create()

  var ObjectProto = O.create(function(){
    this.sysType = null
        
    this.init = function() {
      this.protos = []
      this.slots  = {}
    }
    
    this.init()
    
    this.appendProto = function(proto) { 
      this.protos.push(proto)
      return this
    }
    
    this.prependProto = function(proto) { 
      this.protos.unshift(proto)
      return this
    }
  })
  
  var Nil = ObjectProto.create(function(){
    this.appendProto(ObjectProto)
  })
    
  var Coroutine = O.create(function(){
    this.stack = null
    this.state = null
    this.parentCoroutine = null
  })
  
  var State = O.create(function(){
    this.message     = null // message to be sent
    this.chainTarget = null // target for a chain of messages (equals to target in the beginning of the chain or after ";")
    this.target      = null // current target for a message
    this.locals      = null // "call context" - object who sent a message to the "target"
    this.slotValue   = null // current slot value (set by lookupSlot)
    this.slotContext = null // object, where last slot is located
  })
  
  var Message = O.create(function(){
    this.init = function(){
      this.name         = ""
      this.cachedResult = null // null equals no cached result, but Nil is a valid cached result!
      this.next         = Nil
      this.arguments    = []
    }
  })
  
  var SemicolonMessage = Message.create(function(){
    this.name = ";"
  })
  
  var VM = O.create(function(){
    var coroutine = null
    var state     = null
    var stack     = null
    
    var setCoroutine = function(coro){
      coroutine = coro
      state     = coro.state
      stack     = coro.stack
    }
    
    var lookupSlot = function(name, target, state) {
      TODO("Slot lookup for " + name + " and return the value")
    }
    
    var raiseException = function(msg, state) {
      TODO("Raise proper exception with message: " + msg)
    }
    
    var isBuiltin = function(value) {
      return(value.sysType == BuiltinType)
    }
    
    var isMethod = function(value) {
      return(value.sysType == BlockType)
    }
    
    var run = function(){
      if (!coroutine) throw "Coroutine is required"
      if (!state)     throw "Coroutine state is required"
      if (!stack)     throw "Coroutine stack is required"
      
      while (true) {
        // main loop till coroutine returns
        var message = state.message
        if (message === Nil) {
          var poppedState = stack.pop()
          if (poppedState) { // we have a method to return to
            state = poppedState
            continue
          } else { // stack is empty: switch to parent coroutine
            var parentCoroutine = coroutine.parentCoroutine
            if (parentCoroutine) {
              setCoroutine(parentCoroutine)
              continue
            } else { // no parent coroutine - exit
              break
            }
          } // if (poppedState)
        } else if (message.cachedResult) {
          
          state.target  = state.message.cachedResult
          state.message = state.message.next
          continue
          
        } else if (message.name === ";") {
          
          state.target = state.chainTarget
          continue
          
        } else {
          var self = state.target
          var slotName = message.name
          var slotValue = lookupSlot(slotName,  self, state) ||
                          lookupSlot("forward", self, state)
          
          if (!slotValue) {
            raiseException("'" + objectName(self) + "' does not respond to message '" +  + "'", state)
            continue
          } else {
            
            if (isBuiltin(slotValue)) {
              slotValue.activate(state)
            } else if (isMethod(slotValue)) {
              
            } else {
              
            }
          }
          
        } // message type switch
      } // while(true)
    } // run
    
    //
    // Public API
    //
    
    this.setCoroutine = setCoroutine
    this.run          = run
    
  }) // VM
  
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

vm.setCoroutine(coro)
vm.run()

//var Message = IoVM.Message
//IoVM.create

//print(Array.prototype.slice.call(arguments))
//print(arguments)
