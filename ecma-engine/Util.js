Array.prototype.toString = 
Object.prototype.toString = function() {
  var cont = []
  var addslashes = function(s) {
    // You cannot use replace() - Opera uses toString() inside replace()
    return (s+"").split('\\').join('\\\\').split('"').join('\\"')
  }
  for (var k in this){
    if (cont.length) cont[cont.length-1] += ","
    var v = this[k]
    var vs = ''
    if (typeof(v) == "string"){
      vs = '"' + addslashes(v) + '"'
    }else 
      vs = v
    
    if (typeof this.constructor == Array)
      cont[cont.length]
    else 
      cont[cont.length] = k + ": " + vs
  }
  // Don't use replace() here too! 
  cont = "  " + cont.join("\n").split("\n").join("\n  ")
  var s = cont
  if (this.constructor == Object) {
    s = "{\n"+cont+"\n}"
  } else if (this.constructor == Array) {
    s = "[\n"+cont+"\n]"
  }
  return s
}




// The Y Combinator
var Y = function (gen) {
  return (function(f) {return f(f)})(
    function(f) {
      return gen(function() {return f(f).apply(null, arguments)})
    }
  )
}




// Base object for OOP with inheritance
var O = {
  clone: function() {
    var C = function(){}
    C.prototype = this
    var obj = new C()
    obj.init.apply(obj, arguments)
    return obj
  },
  
  cloneWithBlock: function() {
    var args = Array.prototype.slice.apply(arguments)
    var block = args.pop()
    var obj = this.clone.apply(this, args)
    
    block.apply(obj, args)
    
    var init1 = this.init
    var init2 = obj.init
    
    if (init2 !== init1 || !init2) {
      obj.init = function(){
        if (init1) init1.apply(this, arguments)
        if (init2) init2.apply(this, arguments)
      }
    }
    return obj
  },
  
  createSetter: function(name) {
    this["set" + name.substr(0,1).toUpperCase() + name.substr(1)] = function(v) {
      this[name] = v
      return this
    }
    return this
  },
  
  init: function(){}
}




var TODO = function(msg){
  print("TODO: " + msg)
  quit()
}


//
// Test
//
if (!true){
  (function(){
    var Animal = O.cloneWithBlock(function(){
      this.type = "Animal prototype"
      this.init = function(n){
        this.type = "Animal " + n
      }
      this.createSetter("name")
    })

    var Panda = Animal.cloneWithBlock(1, function(){
      this.init = function(){
        this.type = this.type.replace(/Animal/, "Panda")
      }
    })

    var Kiwi = Animal.cloneWithBlock(2, function(){
      this.init = function(){
        this.type = this.type.replace(/Animal/, "Kiwi")
      }
    })

    var Bob = Panda.clone(3).setName("Bob")
    var Lu  = Kiwi.clone(4).setName("Lu")

    print(Animal["type"] == "Animal prototype")
    print(Panda["type"] == "Animal 1")
    print(Kiwi["type"] == "Animal 2")
    print(Bob["type"] == "Panda 3")
    print(Lu["type"] == "Kiwi 4")
    print(Bob.name == "Bob")
    print(Lu.name == "Lu")
  })()
}
