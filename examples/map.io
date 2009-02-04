# Map code should be efficiently inlined.
 
code := message(
  numbers := list(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20)
  i := 1
  while(i < 42000, 
    numbers map(x, x*2)
  )
)
