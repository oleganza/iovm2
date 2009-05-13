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
    if (arguments.length < 1) return obj
    var last = arguments[arguments.length - 1]
    if (typeof(last) === "function") last.apply(obj, arguments)
    return obj
  }
}
