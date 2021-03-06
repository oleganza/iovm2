load("Util.js")

var IonVM = (function(){
  
  var lastObjectId = 0
  
  var SystemType = O.cloneWithBlock(function(){
    this.init = function(name) {
      this.name = name
    }
  })
  
  var ObjectType  = SystemType.clone("Object")
  var MessageType = SystemType.clone("Message")
  var BuiltinType = SystemType.clone("Built-in")
  var BlockType   = SystemType.clone("Block")

  var ObjectProto = O.cloneWithBlock(function(){
    this.sysType = ObjectType
    
    this.init = function() {
      this.hasDoneSlotLookup = false // used for preventing infinite loop in recursive slot lookup
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
  
  var Nil = ObjectProto.cloneWithBlock(function(){
    this.sysType = ObjectType.clone("nil")
    this.appendProto(ObjectProto)
  })
  
  var True = ObjectProto.cloneWithBlock(function(){
    this.sysType = ObjectType.clone("true")
    this.appendProto(ObjectProto)
  })
  
  var False = ObjectProto.cloneWithBlock(function(){
    this.sysType = ObjectType.clone("false")
    this.appendProto(ObjectProto)
  })
  
  var Builtin = ObjectProto.cloneWithBlock(function(){
    this.sysType = BuiltinType
    this.activate = function(state){}
    this.init = function(func){
      this.activate = func
    }
  })
  
  // Block does not deal with call arguments.
  // Notation block[x,x+1] is transformed in pure Ion to block[x := call arguments first]
  var Block = ObjectProto.cloneWithBlock(function(){
    this.sysType = BlockType
    this.message = Nil
    this.init = function(message){
      this.message = message
      this.scope = arguments[1] || Nil
    }
    this.createSetter("message")
    this.createSetter("scope")
  })
  
  ObjectProto.setBuiltin = function(name, func) {
    this.setSlot(name, Builtin.clone(func))
    return this
  }
    
  var StringProto = ObjectProto.cloneWithBlock(function(){
    this.appendProto(ObjectProto)
    this.init = function(){
      this.bytes = ""
    }
    this.init()
  })
  
  var StopStatusNormal   = 0
  var StopStatusBreak    = 1
  var StopStatusContinue = 2
  var StopStatusReturn   = 3
  var StopStatusRaise    = 4
  
  var Coroutine = O.cloneWithBlock(function(){
    this.stack = null
    this.state = null
    this.parentCoroutine = null
    this.returnStatus 
  })
  
  // TODO: maybe transform this into direct 'Locals call' object? (immutable or lazily created?)
  var State = ObjectProto.cloneWithBlock(function(){
    this.message     = null // message to be sent
    this.chainTarget = null // target for a chain of messages (equals to target in the beginning of the chain or after ";")
    this.target      = null // current target for a message
    this.locals      = null // "call context" - object who sent a message to the "target"
    this.slotValue   = null // current slot value (set by lookupSlot)
    this.slotContext = null // object, where last slot is located
    this.sender      = null // != null only in call context
    
    this.init = function(target, message) {
      this.target = this.chainTarget = this.locals = target
      this.message = message
    }
    
    var self = this
    var setReturningBuiltin = function(nativeName, slotName) {
      self.setBuiltin(slotName, function(s){ s.target = s.target[nativeName] })
    }
    setReturningBuiltin("message",     "message")
    setReturningBuiltin("target",      "target")
    setReturningBuiltin("locals",      "sender") // note: sender will be the locals register upon the call
    setReturningBuiltin("slotValue",   "slotValue")
    setReturningBuiltin("slotContext", "slotContext")
  })
  
  var Message = O.cloneWithBlock(function(){
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
  
  var SemicolonMessage = Message.cloneWithBlock(function(){
    this.name = ";"
  })
  
  return O.cloneWithBlock(function(){ // VM
    var coroutine = null
    var state     = null
    var stack     = null
    
    var setCoroutine = function(coro){
      coroutine = coro
      state     = coro.state
      stack     = coro.stack
    }
    
    var lookupSlot = function(name, target /*, state = null */) {
      var state = arguments[2]
      var value = target.slots[name]
      
      if (value) {
        if (state) state.slotContext = target
      } else {
        target.hasDoneSlotLookup = true // prevent infinite loop
      	for each (var proto in target.protos) {
    			if (proto.hasDoneSlotLookup) continue
    			value = lookupSlot(name, proto, state)
    			if (value) break
      	}
      	target.hasDoneSlotLookup = false
      }
      return value
    }
    
    var raiseException = function(msg, state) {
      TODO("Raise proper exception with message: " + msg)
    }
    
    var isBuiltin = function(value) {
      return(value.sysType === BuiltinType)
    }
    
    var isMethod = function(value) {
      return(value.sysType === BlockType)
    }
    
    var objectName = function(object) {
      var type = lookupSlot("type", object, null)
      return type || object.sysType.name
    }
    
    var activateMethod = function(method) {
      var call = state
      
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
              state.slotValue = slotValue
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
      
      var coro = Coroutine.cloneWithBlock(function(){
        this.stack = []
        this.state = State.clone(Nil, message)
      })

      this.setCoroutine(coro)
      this.run()
      
      return state.target
    }
    
  }) // VM
})()

