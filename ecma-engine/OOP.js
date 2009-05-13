#!/usr/bin/env js

load("Util.js")

var O = (function(){
  var o = {}
  
  o.create = function() {
    var C = function(){}
    C.prototype = this
    var b = new C()
    b.proto = this
    b.init.apply(b, arguments)
    return b
  }
  
  o.forward = function(func) {
    var restArgs = Array.prototype.slice.call(arguments, 1)
    return this.proto[func].apply(this.proto, restArgs)
  }
  
  o.init = function() {
    if (arguments.length < 1) return
    var last = arguments[arguments.length - 1]
    if (typeof(last) === "function") last.apply(this, arguments)
  }
  
  return o
})()

//
// Test
//

var Model = O.create(function(){
  print("init Model")
  var self = this
  var id = 0
  this.repository = "Repository"
  this.init = function() {
    id += 1
    this.id = id
  }
  this.maxid = function() {
    return id
  }
})

print([Model.id, Model.maxid()].join(", "))

var Person = Model.create(function(){
  print("init Person")
  this.name = null
  this.init = function(name) {
    this.forward("init")
    this.name = name
  }
})

print([Person.id, Person.maxid()].join(", "))

var Oleg = Person.create("Oleg", function(){
  print("init " + this.name)
  this.mood = ":-)"
})

print([Oleg.id, Oleg.maxid()].join(", "))


