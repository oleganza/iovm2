Array.prototype.toString = 
Object.prototype.toString = function() {
  var cont = []
  var addslashes = function(s) {
    // You cannot use replace() - Opera uses toString() inside replace()
    return (s+"").split('\\').join('\\\\').split('"').join('\\"')
  }
  for (var k in this) 
  {
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

var O = {
  create: function() {
    var C = function(){}
    C.prototype = this
    var obj = new C()
    
    if (obj["init"]) obj.init.apply(obj, arguments)
    
    if (arguments.length < 1) return obj
    var last = arguments[arguments.length - 1]
    if (typeof(last) === "function") last.apply(obj, arguments)
    
    var init1 = this.init
    var init2 = obj.init
    
    if (init2 !== init1 || !init2)
    {
      obj.init = function(){
        if (init1) init1.apply(this, arguments)
        if (init2) init2.apply(this, arguments)
      }
    }
    
    return obj
  },
  init: function(){}
}

//
// Test
//
if (false){
  (function(){
    var Animal = O.create(function(){
      this.type = "Animal prototype"
      this.init = function(n){
        this.type = "New Animal " + n
      }
    })

    var Panda = Animal.create(1, function(){
      this.init = function(){
        this.type = this.type.replace(/Animal/, "Panda")
      }
    })

    var Kiwi = Animal.create(2, function(){
      this.init = function(){
        this.type = this.type.replace(/Animal/, "Kiwi")
      }
    })

    var Bob = Panda.create(3)
    var Lu  = Kiwi.create(4)

    print(Animal["type"])
    print(Panda["type"])
    print(Kiwi["type"])
    print(Bob["type"])
    print(Lu["type"])
  })()
}