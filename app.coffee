# this is a test

l=console.log

@a={}

@a.b="abc"

@a.run=()->
  l "a.run is ran!"

@a.default=@a

module.exports=@a