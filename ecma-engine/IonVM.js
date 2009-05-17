#!/usr/bin/env js

load("Util.js")

var VM = (function(){
  
  var lastObjectId = 0
  
  var SystemType = O.createWithBlock(function(){
    this.init = function(name) {
      this.name = name
    }
  })
  
  var ObjectType  = SystemType.create("Object")
  var MessageType = SystemType.create("Message")
  var BuiltinType = SystemType.create("Built-in")
  var BlockType   = SystemType.create("Block")

  var ObjectProto = O.createWithBlock(function(){
    this.sysType = ObjectType
    
    this.init = function() {
      this.protos = []
      this.slots  = {}
      lastObjectId += 1
      this.objectId = lastObjectId
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
    
    this.setSlot = function(name, value) {
      this.slots[name] = value
      return this
    }
  })
  
  var Nil = ObjectProto.createWithBlock(function(){
    this.sysType = ObjectType.create("nil")
    this.appendProto(ObjectProto)
  })
  
  var True = ObjectProto.createWithBlock(function(){
    this.sysType = ObjectType.create("true")
    this.appendProto(ObjectProto)
  })
  
  var False = ObjectProto.createWithBlock(function(){
    this.sysType = ObjectType.create("false")
    this.appendProto(ObjectProto)
  })
  
  var Builtin = ObjectProto.createWithBlock(function(){
    this.sysType = BuiltinType
    this.activate = function(state){}
    this.init = function(func){
      this.activate = func
    }
  })
  
  ObjectProto.setBuiltin = function(name, func) {
    setSlot(name, Builtin.create(func))
    return this
  }
  
  var StringProto = ObjectProto.createWithBlock(function(){
    this.appendProto(ObjectProto)
    this.init = function(){
      this.bytes = ""
    }
    this.init()
  })
    
  var Coroutine = O.createWithBlock(function(){
    this.stack = null
    this.state = null
    this.parentCoroutine = null
  })
  
  // TODO: maybe transform this into Locals call
  var State = O.createWithBlock(function(){
    this.message     = null // message to be sent
    this.chainTarget = null // target for a chain of messages (equals to target in the beginning of the chain or after ";")
    this.target      = null // current target for a message
    this.locals      = null // "call context" - object who sent a message to the "target"
    this.slotValue   = null // current slot value (set by lookupSlot)
    this.slotContext = null // object, where last slot is located
    
    this.init = function(target, message) {
      this.target = this.chainTarget = this.locals = target
      this.message = message
    }
  })
  
  var Message = O.createWithBlock(function(){
    this.sysType = MessageType
    this.init = function(){
      this.name         = ""
      this.cachedResult = null // null equals no cached result, but Nil is a valid cached result!
      this.next         = Nil
      this.previous     = Nil
      this.arguments    = []
    }
    this.createSetter("name")
    this.createSetter("cachedResult")
    this.createSetter("next")
    this.createSetter("previous")
    this.createSetter("arguments")
  })
  
  var SemicolonMessage = Message.createWithBlock(function(){
    this.name = ";"
  })
  
  return O.createWithBlock(function(){ // VM
    var coroutine = null
    var state     = null
    var stack     = null
    
    var setCoroutine = function(coro){
      coroutine = coro
      state     = coro.state
      stack     = coro.stack
    }
    
    var lookupSlot = function(name, target, state /* = null */) {
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
    
    var objectName = function(object) {
      var type = lookupSlot("type", object, null)
      return type || object.sysType.name
    }
    
    var activateMethod = function(method) {
      TODO("Activate method in context")
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
          } else { // stack is empty: switch to parent coroutine
            var parentCoroutine = coroutine.parentCoroutine
            if (parentCoroutine) {
              setCoroutine(parentCoroutine)
            } else { // no parent coroutine - exit
              break
            }
          } // if (poppedState)
        } else if (message.cachedResult) {
          
          state.target  = state.message.cachedResult
          state.message = state.message.next
          
        } else if (message.name === ";") {
          
          state.target = state.chainTarget
          
        } else {
          var self = state.target
          var slotName = message.name
          var slotValue = lookupSlot(slotName,  self, state) ||
                          lookupSlot("forward", self, state)
          
          if (!slotValue) {
            raiseException("'" + objectName(self) + "' does not respond to message '" +  + "'", state)
          } else {
            
            if (isBuiltin(slotValue)) {
              slotValue.activate(state)
            } else if (isMethod(slotValue)) {
              activateMethod(slotValue)
            } else {
              raiseException("Slot '" + slotName + "' in object '" + objectName(self) + "' is not activatable!")
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

    this.Coroutine = Coroutine
    this.State     = State
    this.Message   = Message
    this.Nil       = Nil
    
    this.runMessage = function(message){
      
      var coro = Coroutine.createWithBlock(function(){
        this.stack = []
        this.state = State.create(Nil, message)
      })

      this.setCoroutine(coro)
      this.run()
      
      return state.target
    }
    
  }) // VM
})()


//
// Test
//

var verify = function(testName, message) {
  var vm = VM.create()
  var result = vm.runMessage(message)
  print(result.sysType.name)
}

verify("test nil message", VM.Nil)
