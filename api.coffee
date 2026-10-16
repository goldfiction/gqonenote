# schemas
#---
# index
# {
#   "type":"index"
#   "projectID":0
#   "sectionID":0
#   "pageID":0
#   "noteID":0
# }
# select
# {
#   "type":"select"
#   "projectID":0
#   "sectionID":0
#   "pageID":0
#   "noteID":0
# }
# project
# {
#     "name":"project",
#     "type":"project",
#     "id":1,
#     "enabled":true
# }
# {
#     "name":"section",
#     "type":"section",
#     "project":1,
#     "id":1,
#     "enabled":true
# }
# {
#     "name":"page",
#     "type":"page",
#     "section":1,
#     "id":1,
#     "enabled":true
# }
# {
#     "name":"note",
#     "type":"note",
#     "page":1,
#     "id":1,
#     "title":"",
#     "text":"",
#     "enabled":true
# }

ver=1.2

tryrun=require "gqtryrun"
l=console.log
fs=require "fs"
path=require "path"
exec=require("child_process").execSync
spawn=require('child_process').spawn
vm=require "vm"
async=require "async"
_=require "lodash"
CoffeeScript=require "coffeescript"
#LuaState=require("lua-state").LuaState
#---

mod={}
mod.indexTemp=
  "type":"index"
  "projectID":0
  "sectionID":0
  "pageID":0
  "noteID":0

mod.selectTemp=
  "type":"select"
  "projectID":0
  "sectionID":0
  "pageID":0
  "noteID":0

mod.getID=(o,cb)->
  o.db.find
    "type":"index"
  ,(e,r)->
    if r.length==1
      cb e,r[0]
    else
      o.doc=mod.indexTemp
      o.db.insert o.doc,(e,r)->
        cb e,r

mod.updateID=(o,cb)->
  o.db.update {type:'index'},{$set:o.doc},{multi:false},cb

mod.getSelectID=(o,cb)->
  o.db.find
    "type":"select"
  ,(e,r)->
    if r.length==1
      cb e,r[0]
    else
      o.doc=mod.selectTemp
      o.db.insert o.doc,(e,r)->
        cb e,r

mod.updateSelectID=(o,cb)->
  #l o
  o.db.update {type:'select'},{$set:o.doc},{multi:false},cb

mod.getTheme=(o,cb)->
  folderPath="./public/www/ace/css/theme"
  try
    files = fs.readdirSync folderPath
    files = files.filter (file)->
      path.extname(file)=='.css'
    l 'CSS Files:',files
    cb null,files
  catch e
    console.error('Error reading folder:',e)
    cb e

mod.getLanguage=(o,cb)->
  folderPath="./public/www/ace/src-min"
  try
    files = fs.readdirSync folderPath
    files = files.filter (file)->
      path.extname(file)=='.js'&&file.indexOf("mode-")!=-1
    l 'Language Files:',files
    cb null,files
  catch e
    console.error('Error reading folder:',e)
    cb e

runSH1=(o,cb)->
  l "trying to execute sh script\n",o.script
  fs.writeFileSync("./runscript",o.script)
  exec "npm run-script runscript",(error, stdout, stderr)->
    if error
      l "Execution error:",error
    if stderr
      l "Shell stderr:",stderr
    l "Output:\n",stdout
    cb(error,stdout)

runSH1_2=(o,cb)->
  o.query=(o,cb)->
    l "trying to execute sh script\n",o.script
    fs.writeFileSync("./runscript",o.script)
    child=null
    msg=""
    if o.shell=="/bin/bash"
      child = spawn 'bash',["./runscript"],{ shell: true, cwd: "./" }
    else if o.shell=="/bin/sh"
      child = spawn 'sh',["./runscript"],{ shell: true , cwd: "./"}
    child.stdout.on 'data',(data)->
      l "stdout: ",data.toString()
      msg+=data.toString()
    child.stderr.on 'data',(data)->
      l "stderr: ",data.toString()
    child.on 'close',(code)->
      l "Child process exited with code ",code
      cb null,msg
  tryrun.run o.query,o,cb

runPY=(o,cb)->
  o.query=(o,cb)->
    l "trying to execute python script\n",o.script
    fs.writeFileSync("./runscript",o.script)
    child=null
    msg=""
    child = spawn 'python',["./runscript"],{ shell: true , cwd: "./"}
    child.stdout.on 'data',(data)->
      l "stdout: ",data.toString()
      msg+=data.toString()
    child.stderr.on 'data',(data)->
      l "stderr: ",data.toString()
    child.on 'close',(code)->
      l "Child process exited with code ",code
      cb null,msg
  tryrun.run o.query,o,cb

runSH2=(o,cb)->
  o.query=(o,cb)->
    child=null
    msg=""
    if o.shell=="/bin/bash"
      child = spawn 'bash',['-c', o.script],{ shell: true, cwd: "./" }
    else if o.shell=="/bin/sh"
      child = spawn 'sh',['-c', o.script],{ shell: true , cwd: "./"}
    child.stdout.on 'data',(data)->
      l "stdout: ",data.toString()
      msg+=data.toString()
    child.stderr.on 'data',(data)->
      l "stderr: ",data.toString()
    child.on 'close',(code)->
      l "Child process exited with code ",code
      cb null,msg
  tryrun.run o.query,o,cb

runLua_1=(o,cb)->
  o.param=o.param||{}
  lua = new LuaState()
  #lua.setGlobal("multiplier", 5)  # set variable values
  for key, value of o.param
    lua.setGlobal(key, value)
  try
    result = lua.eval o.script
    l("Result from Lua:", result)
    cb null,result
  catch e
    cb e
  lua.close()

runLua=(o,cb)->
  o.query=(o,cb)->
    l "trying to execute lua script\n",o.script
    fs.writeFileSync("./runscript",o.script)
    child=null
    msg=""
    child = spawn 'lua',["./runscript"],{ shell: true , cwd: "./"}
    child.stdout.on 'data',(data)->
      l "stdout: ",data.toString()
      msg+=data.toString()
    child.stderr.on 'data',(data)->
      l "stderr: ",data.toString()
    child.on 'close',(code)->
      l "Child process exited with code ",code
      cb null,msg
  tryrun.run o.query,o,cb
mod.runSH=(o,cb)->
  #l o
  l "running script using shell: "+o.shell
  l "script: \n",o.script
  o.query=(o,cb)->
    if o.shell=="/bin/sh"||o.shell=="/bin/bash"
      runSH1_2 o,cb
    else if o.shell=="javascript"
      mod.runOneScript {db:o.db,code:o.script},cb
    else if o.shell=="coffeescript"
      code = CoffeeScript.compile(o.script, { bare: true })
      mod.runOneScript {db:o.db,code:code},cb
    else if o.shell=="python"
      runPY o,cb
    else if o.shell=="lua"
      runLua o,cb
  tryrun.run o.query,o,cb

mod.getXpathNote=(o,cb)->
  result=null
  note.listAll {db:o.db},(e,notes)->
    #l notes
    async.eachSeries notes,(noteData,cb)->
      if !result
        #l "processing note: ",noteData
        note.path {db:o.db,doc:noteData},(e,noteXpath)->
          #l noteXpath
          if noteXpath&&noteXpath.indexOf(o.xpath)!=-1
            result=noteData
          cb()
      else
        cb()
    ,(e,r)->
      #l "finding: ",o.xpath
      #l "result: ",result
      cb null,result

mod.runxpath=(o,cb)->
  mod.getXpathNote {db:o.db,xpath:o.xpath},(e,noteData)->
    if noteData
      note.getText {db:o.db,doc:noteData},(e,noteData2)->
        #l noteData2[0]        
        mod.runOneScript {db:o.db,code:atob(noteData2[0].text)},cb
    else
      l "no note found"
      cb()

mod.getXPathScript=(o,cb)->
  mod.getXpathNote {db:o.db,xpath:o.xpath},(e,noteData)->
    if noteData
      note.getText {db:o.db,doc:noteData},(e,noteData2)->
        #l noteData2[0]        
        cb(e,atob(noteData2[0].text))
    else
      l "no note found"
      cb()

mod.runOneScript=(o,cb)->
  contextObject=
    o:o
    db:o.db
    eval:eval
    require:require
    console:console
    spawn:spawn
    exec:exec
    async:async
    _:_
    fs:fs
    global:global
    xpath:mod.getXPathScript
    runSH:mod.runSH
  try
    result=vm.runInNewContext o.code,contextObject
    cb null,result
  catch e
    cb e
  
mod.restartServer=()->
  o={}
  o.query=()->
    child=spawn "npm",["start"],
      detached:true
      shell:true
      stdio:'inherit'
    child.unref()
    setTimeout ()->
      process.exit(0)
    ,2000
  tryrun.run o.query,o,(e,r)->
#---

project={}
section={}
page={}
note={}

project.getID=(o,cb)->
  mod.getID o,(e,r)->
    cb e,r.projectID

section.getID=(o,cb)->
  mod.getID o,(e,r)->
    cb e,r.sectionID

page.getID=(o,cb)->
  mod.getID o,(e,r)->
    cb e,r.pageID

note.getID=(o,cb)->
  mod.getID o,(e,r)->
    cb e,r.noteID

#---

project.incrementID=(o,cb)->
  mod.getID o,(e,r)->
    o.doc={}
    o.doc.projectID=r.projectID+1
    mod.updateID o,cb

project.create=(o,cb)->
  o.query=(o,cb)->
    mod.getID o,(e,id)->
      o.doc= 
        "name":o.doc.name||"project"
        "type":"project"
        "id":id.projectID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        project.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

project.list=(o,cb)->
  o.query=(o,cb)->
    o.db.find
      type:"project"
      enabled:true
    ,cb
  tryrun.run o.query,o,cb

project.export=(o,cb)->
  o.query=(o,cb)->
    o.db.find
      type:"project"
      enabled:true
    ,(e1,projectData)->
      o.db.find
        type:"section"
        enabled:true
      ,(e2,sectionData)->
        o.db.find
          type:"page"
          enabled:true
        ,(e3,pageData)->
          o.db.find
            type:"note"
            enabled:true
          ,(e4,noteData)->
            total=[]
            total=total.concat(projectData,sectionData,pageData,noteData)
            cb(e1||e2||e3||e4,total)
  tryrun.run o.query,o,cb

project.importData=(data,cb)->
  o={}
  o.doc=data
  o.db.insert o.doc,cb

project.import=(o,cb)->
  o.query=(o,cb)->
    data=JSON.parse(fs.readFileSync("./import.json").toString())
    projectData=data.filter(item => item.type == 'project')
    sectionData=data.filter(item => item.type == 'section')
    pageData=data.filter(item => item.type == 'page')
    noteData=data.filter(item => item.type == 'note')
    projectData.forEach (data)->
      project.importData data,(e,r)->
      l "project imported"
    sectionData.forEach (data)->
      project.importData data,(e,r)->
      l "section imported"
    pageData.forEach (data)->
      project.importData data,(e,r)->
      l "page imported"
    noteData.forEach (data)->
      project.importData data,(e,r)->
      l "note imported"
  tryrun.run o.query,o,cb

project.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:JSON.parse(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

project.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:JSON.parse(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

project.readPackage=(o,cb)->
  o.query=(o,cb)->
    try
      packageJSON=fs.readFileSync("./package.json").toString()
      cb(null,packageJSON)
    catch e
      cb e
  tryrun.run o.query,o,cb

project.writePackage=(o,cb)->
  o.query=(o,cb)->
    try
      packageJSON=o.doc.text
      if packageJSON
        fs.writeFileSync("./package.json",packageJSON)
        cb(null,"OK")
    catch e
      cb e
  tryrun.run o.query,o,cb

#---

section.incrementID=(o,cb)->
  mod.getID o,(e,r)->
    o.doc={}
    o.doc.sectionID=r.sectionID+1
    mod.updateID o,cb

section.create=(o,cb)->
  o.query=(o,cb)->
    mod.getID o,(e,id)->
      o.doc= 
        "name":o.doc.name||"section"
        "type":"section"
        "project":JSON.parse(o.doc.project)
        "id":id.sectionID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        section.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

section.list=(o,cb)->
  o.query=(o,cb)->
    o.db.find
      "type":"section"
      "project":JSON.parse(o.doc.project)
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

section.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"section",id:JSON.parse(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

section.remove=(o,cb)->
  o.query=(o,cb)->
    #l o
    o.db.update {type:"section",id:JSON.parse(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

page.incrementID=(o,cb)->
  mod.getID o,(e,r)->
    o.doc={}
    o.doc.pageID=r.pageID+1
    mod.updateID o,cb

page.create=(o,cb)->
  o.query=(o,cb)->
    mod.getID o,(e,id)->
      o.doc= 
        "name":o.doc.name||"page"
        "type":"page"
        "project":JSON.parse(o.doc.project)
        "section":JSON.parse(o.doc.section)
        "id":id.pageID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        page.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

page.list=(o,cb)->
  o.query=(o,cb)->
    #l o
    o.db.find
      "type":"page"
      "project":JSON.parse(o.doc.project)
      "section":JSON.parse(o.doc.section)
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

page.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update 
      type:"page"
      id:JSON.parse(o.doc.id)
      project:JSON.parse(o.doc.project)
      section:JSON.parse(o.doc.section)
    ,{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

page.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update 
      type:"page"
      id:JSON.parse(o.doc.id)
      project:JSON.parse(o.doc.project)
      section:JSON.parse(o.doc.section)
    ,{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

note.incrementID=(o,cb)->
  mod.getID o,(e,r)->
    o.doc={}
    o.doc.noteID=r.noteID+1
    mod.updateID o,cb

note.create=(o,cb)->
  o.query=(o,cb)->
    mod.getID o,(e,id)->
      o.doc= 
        "name":o.doc.name||"note"
        "type":"note"
        "project":JSON.parse(o.doc.project)
        "section":JSON.parse(o.doc.section)
        "page":JSON.parse(o.doc.page)
        "title":o.doc.title||""
        "text":o.doc.text||""
        "id":id.noteID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        note.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

note.path=(o,cb)->
  o.query=(o,cb)->
    o.db.find {type:"note",id:JSON.parse(o.doc.id),enabled:true},{multi:false},(e1,noteDoc)->
      noteDoc=noteDoc[0]
      o.db.find {type:"project",id:JSON.parse(noteDoc.project),enabled:true},{multi:false},(e2,projectDoc)->
        o.db.find {type:"section",id:JSON.parse(noteDoc.section),enabled:true},{multi:false},(e3,sectionDoc)->
          o.db.find {type:"page",id:JSON.parse(noteDoc.page),enabled:true},{multi:false},(e4,pageDoc)->
            xpath=projectDoc[0].name+"\\\\"+sectionDoc[0].name+"\\\\"+pageDoc[0].name+"\\\\"+noteDoc.name
            cb e1||e2||e3||e4,xpath
      
  tryrun.run o.query,o,cb

note.list=(o,cb)->
  o.query=(o,cb)->
    #l o
    o.db.find
      "type":"note"
      "project":JSON.parse(o.doc.project)
      "section":JSON.parse(o.doc.section)
      "page":JSON.parse(o.doc.page)
      "enabled":true
    ,(e,r)->
      r = r.map(({ text, ...rest }) => rest)
      cb e,r
  tryrun.run o.query,o,cb

note.listAll=(o,cb)->
  o.query=(o,cb)->
    #l o
    o.db.find
      "type":"note"
      "enabled":true
    ,(e,r)->
      r = r.map(({ text, ...rest }) => rest)
      cb e,r
  tryrun.run o.query,o,cb

note.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:JSON.parse(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

note.updateTitle=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:JSON.parse(o.doc.id)},{$set:{title:o.doc.title}},{multi:false},cb
  tryrun.run o.query,o,cb

note.updateText=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:JSON.parse(o.doc.id)},{$set:{text:o.doc.text}},{multi:false},cb
  tryrun.run o.query,o,cb

note.getText=(o,cb)->
  o.query=(o,cb)->
    o.db.find {type:"note",id:JSON.parse(o.doc.id),enabled:true},{multi:false},cb
  tryrun.run o.query,o,cb

note.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:JSON.parse(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

routeHandler=(app,db)->
  app.get "/size",(req,res)->
    stats = fs.statSync('/root/db')
    res.send 200,stats.size

  app.get "/theme",(req,res)->
    mod.getTheme {db:db},(e,r)->
      res.send 200,r

  app.get "/language",(req,res)->
    mod.getLanguage {db:db},(e,r)->
      res.send 200,r

  app.get "/motd",(req,res)->
    motd=fs.readFileSync('./resource/motd').toString()
    res.send 200,motd

  app.get "/server/stop",(req,res)->
    res.send 200,"OK"
    setTimeout ()->
      process.exit(0)
    ,500

  app.get "/server/restart",(req,res)->
    res.send 200,"OK"
    setTimeout ()->
      mod.restartServer()
    ,500
  
  app.get "/user",(req,res)->
    l req.auth
    res.send 200,req.auth.username
  
  app.post "/runsh",(req,res)->
    mod.runSH {db:db,script:req.body.script,shell:(req.body.shell||"/bin/sh"),cwd:(req.body.cwd||"./")},(e,r)->
      if e
        res.send 404,e.message
      else
        res.send 200,r

  app.get "/project",(req,res)->
    project.list {db:db},(e,r)->
      res.send 200,r

  app.get "/project/export",(req,res)->
    project.export {db:db},(e,r)->
      data=JSON.stringify(r,null,2)
      fs.writeFileSync "./export.json",data
      l "project exported to ./export.json"
      if e
        res.send 404,"Failed to import"
      else
        res.send 200,"OK"

  app.get "/project/import",(req,res)->
    project.import {db:db},(e,r)->
      cb e,{status:"OK"}

  app.post "/project",(req,res)->
    project.create {db:db,doc:req.body},(e,r)->
      project.list {db:db},(e,r)->
        res.send 200,r
  
  app.put "/project",(req,res)->
    project.rename {db:db,doc:req.body},(e,r)->
      project.list {db:db},(e,r)->
        res.send 200,r
  
  app.delete "/project",(req,res)->
    project.remove {db:db,doc:req.body},(e,r)->
      project.list {db:db},(e,r)->
        res.send 200,r
  
  app.get "/package",(req,res)->
    project.readPackage {db:db},(e,r)->
      res.send 200,r

  app.put "/package",(req,res)->
    project.writePackage {db:db,doc:req.body},(e,r)->
      res.send 200,r
  #--
  
  app.get "/section",(req,res)->
    #l req.query
    section.list {db:db,doc:req.query},(e,r)->
      res.send 200,r
  
  app.post "/section",(req,res)->
    section.create {db:db,doc:req.body},(e,r)->
      section.list {db:db,doc:req.body},(e,r)->
        res.send 200,r

  app.put "/section",(req,res)->
    section.rename {db:db,doc:req.body},(e,r)->
      section.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  app.delete "/section",(req,res)->
    section.remove {db:db,doc:req.body},(e,r)->
      section.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  #--

  app.get "/page",(req,res)->
    page.list {db:db,doc:req.query},(e,r)->
      res.send 200,r
  
  app.post "/page",(req,res)->
    page.create {db:db,doc:req.body},(e,r)->
      page.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  app.put "/page",(req,res)->
    page.rename {db:db,doc:req.body},(e,r)->
      page.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  app.delete "/page",(req,res)->
    page.remove {db:db,doc:req.body},(e,r)->
      page.list {db:db,doc:req.body},(e,r)->
        res.send 200,r

  #--

  app.get "/note",(req,res)->
    note.list {db:db,doc:req.query},(e,r)->
      res.send 200,r

  app.get "/note/all",(req,res)->
    note.listAll {db:db,doc:req.query},(e,r)->
      res.send 200,r
  
  app.post "/note",(req,res)->
    note.create {db:db,doc:req.body},(e,r)->
      note.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  app.put "/note/title",(req,res)->
    note.updateTitle {db:db,doc:req.body},(e,r)->
      note.list {db:db,doc:req.body},(e,r)->
        res.send 200,r

  app.get "/note/text",(req,res)->
    note.getText {db:db,doc:req.query},(e,r)->
      res.send 200,r

  app.get "/note/path",(req,res)->
    note.path {db:db,doc:req.query},(e,r)->
      res.send 200,r

  app.put "/note/text",(req,res)->
    note.updateText {db:db,doc:req.body},(e,r)->
      note.list {db:db,doc:req.body},(e,r)->
        res.send 200,r

  app.put "/note",(req,res)->
    note.rename {db:db,doc:req.body},(e,r)->
      note.list {db:db,doc:req.body},(e,r)->
        res.send 200,r
  
  app.delete "/note",(req,res)->
    note.remove {db:db,doc:req.body},(e,r)->
      note.list {db:db,doc:req.body},(e,r)->
        res.send 200,r

  app.get "/select",(req,res)->
    mod.getSelectID {db:db},(e,r)->
      res.send 200,r 

  app.put "/select",(req,res)->
    mod.updateSelectID {db:db,doc:req.body},(e,r)->
      res.send 200,r 

  return app

#---

module.exports={mod:mod,project:project,section:section,page:page,note:note,routeHandler:routeHandler}