
func := method(i, i println)
n := 10

# We start with a simple for() loop:

for(i, 0, n, 
  func(i)
)


# Transform it into a simpler while() loop
 
i := 0
while(i <= n, 
  func(i)
  i := i + 1
)


# Simplify it further to use loop(), if() and break() instructions

i := 0
loop(
  if(i > n, break)
  func(i)
  i := i + 1
)

# Let's see what bytecode is that
/*
  loop:
    pushThisByteCodePosition
    performMessageArgument1
    popAndJumpByteCodePosition
*/


