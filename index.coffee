gqexpress=require "gqexpress" 
log=console.log 
l=console.log
Datastore=require 'nedb'
api=require "./api.coffee"

fs=require "fs"
ini=require "ini"
config={}
try
  config=ini.parse(fs.readFileSync("./config.ini").toString())
catch e

console.log "loading db..."
db = new Datastore({ filename: config.server.db||'/root/db', autoload: true })
db.persistence.setAutocompactionInterval 120000
db.ensureIndex {fieldName:"id"}
console.log "db loaded..."
workFolder=config.server.workFolder||"./"
userjs={}
try
  userjs=require("./user.js")._from
catch e
  log e

mainConfig=
  basicauth: 
    authenticate:true 
    challenge:true 
    users: 
      admin:"password" 
  server:config.server
  emailserver:userjs
  general: 
    jadepath:process.cwd()+"/views" 
    staticpath:process.cwd()+"/public/www/"
#log mainConfig
gqexpress.startServer  # invoke start server like this 
  config:mainConfig
  set:(app,o)->  # override set object like this 
    return app  # kindly return app back to startServer with app.sets 
  use:(app,o)->  # override use object like this 
    app=api.routeHandler app,db
    app.get "/",(req,res)-> 
      res.render "index",  # you can render jade in /views folder like this 
        title:"gqonenote"  # meta info passed to jade and render using #{title} 
    return app  # kindly return app back to startServer with app.gets 
,(e,o)-> 
  log "Server started!"  # if you see this, then the server is running correctly.