#!/usr/bin/env js

load("IonVM.js")
load("IonGrammar.js")

var verify = function(testName, message) {
  var vm = IonVM.clone()
  var result = vm.runMessage(message)
  print(result.sysType.name)
}

verify("test nil message", IonVM.Nil)

//verify("test nil message", VM.Message.clone().setCachedResult(VM.))
