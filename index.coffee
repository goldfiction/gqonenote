gqexpress=require "gqexpress" 
log=console.log 
Datastore=require 'nedb'
api=require "./api.coffee"

console.log "loading db..."
db = new Datastore({ filename: '/root/db', autoload: true })
console.log "db loaded..."

gqexpress.startServer  # invoke start server like this 
  config: 
    basicauth: 
      authenticate:true 
      challenge:true 
      users: 
        admin:"password" 
    server: 
      port:7000 
      sslport:7443 
      domain:"0.0.0.0" 
      forceSecure:false 
    general: 
      jadepath:process.cwd()+"/views" 
      staticpath:process.cwd()+"/public/www/" 
  set:(app,o)->  # override set object like this 
    return app  # kindly return app back to startServer with app.sets 
  use:(app,o)->  # override use object like this 
    app.get "/",(req,res)-> 
      res.render "index",  # you can render jade in /views folder like this 
        title:"gqmario"  # meta info passed to jade and render using #{title} 
    return app  # kindly return app back to startServer with app.gets 
,(e,o)-> 
  log " All done!"  # if you see this, then the server is running correctly.