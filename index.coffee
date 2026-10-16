gqexpress=require "gqexpress" 
l=log=console.log 
Datastore=require 'nedb'
api=require "./api.coffee"

fs=require "fs"
ini=require "ini"

# load config
config={}
try
  config=ini.parse(fs.readFileSync("./config.ini").toString())
catch e

# load db
console.log "loading db..."
db = new Datastore({ filename: config.server.db||'/root/db', autoload: true })
setTimeout ()->
  db.persistence.setAutocompactionInterval 120000
  db.ensureIndex {fieldName:"id"}
,120000
console.log "db loaded..."

workFolder=config.server.workFolder||"./"

# load email agent
userjs={}
try
  userjs=require("./user.js")._from
catch e

# init main config
mainConfig=
  basicauth: 
    authenticate:true 
    challenge:true 
    users: 
      admin:"password"
      user:"password"
      root:"password"
  server:config.server
  emailserver:userjs
  general: 
    jadepath:process.cwd()+"/views" 
    staticpath:process.cwd()+"/public/www/"
#l mainConfig

l "argv: ",process.argv

if process.argv[2]=="execute"
  xpath=process.argv[3]
  api.mod.getXPathScript {db:db,xpath:xpath},(e,script)->
    api.mod.runSH {db:db,script:script,shell:"coffeescript"},(e,r)->
      if e
        l e
  #api.mod.runxpath {db:db,xpath:xpath},(e,r)->
  #  if e
  #    l e
else
  # start gqexpress
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
    l "Server started!"  # if you see this, then the server is running correctly.