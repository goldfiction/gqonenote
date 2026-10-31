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
# note entry
# {
#     "name":"note",
#     "type":"note",
#     "page":1,
#     "id":1,
#     "title":"",
#     "text":"",
#     "enabled":true
# }
# temp file
# {
#     "name":"temp",
#     "type":"temp",
#     "id":1,
#     "title":"temp",
#     "text":"",
#     "enabled":true
# }

ver=1.2

r=require
tryrun=r "gqtryrun"
l=console.log
err=console.error

n=null
u=undefined
fs=r "fs"
nf=(e,r)->
  if e
    err e

ressend=(res,ctnt)->
  #if !res.hasHeader('Content-Length')
  #  res.setHeader 'Content-Length',ctnt.legnth
  #res.writeHead(200, { 'Content-Type': 'text/plain' });
  #res.write ctnt
  #res.end()
  res.send 200,ctnt

path=r "path"
exec=r("child_process").execSync
spawn=r('child_process').spawn
vm=r "vm"
async=r "async"
_=r "lodash"
CoffeeScript=r "coffeescript"
nodeiframe=r "node-iframe"
#createIframe=nodeiframe.createIframe
#import createIframe from "node-iframe"
configureResourceControl = nodeiframe.configureResourceControl
configureResourceControl 
  safeMode: true 
  inline: { script: true, link: true }
  cors: { script: true }
#---

cleanID=(id)->
  id2=id
  try
    id2=JSON.parse id
  catch e
  id2

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

mod.getID=(o,cb=nf)->
  o.db.find
    "type":"index"
  ,(e,r)->
    if r.length==1
      cb e,r[0]
    else
      o.doc=mod.indexTemp
      o.db.insert o.doc,(e,r)->
        cb e,r

mod.updateID=(o,cb=nf)->
  o.db.update {type:'index'},{$set:o.doc},{multi:false},cb

mod.getSelectID=(o,cb=nf)->
  o.db.find
    "type":"select"
  ,(e,r)->
    if r.length==1
      cb e,r[0]
    else
      o.doc=mod.selectTemp
      o.db.insert o.doc,(e,r)->
        cb e,r

mod.updateSelectID=(o,cb=nf)->
  #l o
  o.db.update {type:'select'},{$set:o.doc},{multi:false},cb

mod.getTheme=(o,cb=nf)->
  folderPath="./public/www/ace/css/theme"
  try
    files = fs.readdirSync folderPath
    files = files.filter (file)->
      path.extname(file)=='.css'
    #l 'CSS Files:',files
    cb null,files
  catch e
    console.error('Error reading folder:',e)
    cb e

mod.getLanguage=(o,cb=nf)->
  folderPath="./public/www/ace/src-min"
  try
    files = fs.readdirSync folderPath
    files = files.filter (file)->
      path.extname(file)=='.js'&&file.indexOf("mode-")!=-1
    #l 'Language Files:',files
    cb null,files
  catch e
    console.error('Error reading folder:',e)
    cb e

determineShell=(script)->
  try
    firstLine=script.split("\n")[0].trim()
    if(firstLine.includes("#!")!=-1)
      return firstLine.split("#!")[1]
  catch e
    return null  

runGeneric=(o,cb=nf)->
  o.query=(o,cb=nf)->
    #l "trying to execute script with shell: "+o.shell+"\n",o.script
    fs.writeFileSync("./runscript",o.script)
    child=null
    msg=""
    child = spawn o.shell,["./runscript"],{ shell: true , cwd: "./"}
    child.stdout.on 'data',(data)->
      l "stdout: ",data.toString()
      msg+=data.toString()
    child.stderr.on 'data',(data)->
      l "stderr: ",data.toString()
    child.on 'close',(code)->
      l "Child process exited with code ",code
      cb null,msg
  tryrun.run o.query,o,cb

mod.runSH=(o,cb=nf)->
  #l o
  o.shell=o.shell||determineShell(o.script)
  if !o.shell
    throw new Error("No shell found for script.")
  l "running script using shell: "+o.shell+"\n",o.script
  o.query=(o,cb=nf)->
    if o.shell=="javascript"
      mod.runOneScript {db:o.db,code:o.script},cb
    else if o.shell=="coffeescript"
      code = CoffeeScript.compile(o.script, { bare: true })
      mod.runOneScript {db:o.db,code:code},cb
    else
      runGeneric o,cb
  tryrun.run o.query,o,cb

mod.getXpathNote=(o,cb=nf)->
  result=null
  note.listAll {db:o.db},(e,notes)->
    #l notes
    async.eachSeries notes,(noteData,cb=nf)->
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

mod.runxpath=(o,cb=nf)->
  mod.getXpathNote {db:o.db,xpath:o.xpath},(e,noteData)->
    if noteData
      note.getText {db:o.db,doc:noteData},(e,noteData2)->
        #l noteData2[0]        
        mod.runOneScript {db:o.db,code:atob(noteData2[0].text)},cb
    else
      l "no note found"
      cb()

mod.getXPathScript=(o,cb=nf)->
  mod.getXpathNote {db:o.db,xpath:o.xpath},(e,noteData)->
    if noteData
      note.getText {db:o.db,doc:noteData},(e,noteData2)->
        #l noteData2[0]        
        cb(e,atob(noteData2[0].text))
    else
      l "no note found"
      cb()

mod.runOneScript=(o,cb=nf)->
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

mod.find=(o,cb=nf)->
  o={}
  o.query=(o,cb=nf)->
    o.db.find o.doc.key,cb
  tryrun.run o.query,o,(e,r)->

mod.update=(o,cb=nf)->
  o={}
  o.query=(o,cb=nf)->
    o.db.update o.doc.key,{$set:o.doc.data},{multi:o.multi||false},cb
  tryrun.run o.query,o,(e,r)->

mod.remove=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update o.doc.key,{$set:{enabled:false}},{multi:o.multi||false},cb
  tryrun.run o.query,o,cb

mod.create=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.doc.data.enabled=true
    o.doc.data.createdAt=new Date()
    o.db.insert o.doc.data,cb
  tryrun.run o.query,o,cb

#---

project={}
section={}
page={}
note={}
temp={}

project.getID=(o,cb=nf)->
  mod.getID o,(e,r)->
    cb e,r.projectID||0

section.getID=(o,cb=nf)->
  mod.getID o,(e,r)->
    cb e,r.sectionID||0

page.getID=(o,cb=nf)->
  mod.getID o,(e,r)->
    cb e,r.pageID||0

note.getID=(o,cb=nf)->
  mod.getID o,(e,r)->
    cb e,r.noteID||0

#---

project.incrementID=(o,cb=nf)->
  mod.getID o,(e,r)->
    o2={}
    o2.doc={}
    o2.doc.projectID=o.doc.id+1
    o2.db=o.db
    mod.updateID o2,cb

project.checkID=(o,id,cb=nf)->
  o.db.find {type:"project",id:id},{multi:true},(e,r)->
    cb(n,r.length==0)

project.getNextID=(o,id,cb=nf)->
  project.checkID o,id,(e,r)->
    if(r)
      cb(null,id)
    else
      project.getNextID(o,id+1,cb=nf)

project.create=(o,cb=nf)->
  projectName=o.doc.name||"project"
  o.query=(o,cb=nf)->
    mod.getID o,(e,id)->
      project.getNextID o,id.projectID+1,(e,id)->
        #l o.doc
        o2={}
        o2.doc= 
          "name":projectName
          "type":"project"
          "id":id
          "enabled":true
          "createdAt": new Date() 
        #l o2.doc
        o2.db=o.db
        o.db.insert o2.doc,(e,r)->
          project.incrementID o2,(e2,r2)->
            cb e||e2,r
  tryrun.run o.query,o,cb

project.list=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find
      type:"project"
      enabled:true
    ,cb
  tryrun.run o.query,o,cb

project.export=(o,cb=nf)->
  o.query=(o,cb=nf)->
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

project.importData=(data,cb=nf)->
  o={}
  o.doc=data
  o.db.insert o.doc,cb

project.import=(o,cb=nf)->
  o.query=(o,cb=nf)->
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

project.rename=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"project",id:cleanID(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

project.remove=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"project",id:cleanID(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

project.readPackage=(o,cb=nf)->
  o.query=(o,cb=nf)->
    try
      packageJSON=fs.readFileSync("./package.json").toString()
      cb(null,packageJSON)
    catch e
      cb e
  tryrun.run o.query,o,cb

project.writePackage=(o,cb=nf)->
  o.query=(o,cb=nf)->
    try
      packageJSON=o.doc.text
      if packageJSON
        fs.writeFileSync("./package.json",packageJSON)
        cb(null,"OK")
    catch e
      cb e
  tryrun.run o.query,o,cb

#---

section.incrementID=(o,cb=nf)->
  mod.getID o,(e,r)->
    o2={}
    o2.doc={}
    o2.doc.sectionID=o.doc.id+
    o2.db=o.db
    mod.updateID o2,cb

section.checkID=(o,id,cb=nf)->
  o.db.find {type:"section",id:id},{multi:true},(e,r)->
    cb(n,r.length==0)

section.getNextID=(o,id,cb=nf)->
  section.checkID o,id,(e,r)->
    if(r)
      cb(null,id)
    else
      section.getNextID(o,id+1,cb=nf)

section.create=(o,cb=nf)->
  o.query=(o,cb=nf)->
    mod.getID o,(e,id)->
      section.getNextID o,id.sectionID+1,(e,id)->
        o2={}
        o2.doc= 
          "name":o.doc.name||"section"
          "type":"section"
          "project":cleanID(o.doc.project)
          "id":id
          "enabled":true
          "createdAt": new Date() 
        o2.db=o.db
        o.db.insert o2.doc,(e,r)->
          section.incrementID o2,(e2,r2)->
            cb e||e2,r
  tryrun.run o.query,o,cb

section.list=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find
      "type":"section"
      "project":cleanID(o.doc.project)
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

section.listAll=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find
      "type":"section"
      "project":cleanID(o.doc.project)
    ,cb
  tryrun.run o.query,o,cb

section.rename=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"section",id:cleanID(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

section.remove=(o,cb=nf)->
  o.query=(o,cb=nf)->
    #l o
    o.db.update {type:"section",id:cleanID(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

section.enable=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"section",id:cleanID(o.doc.id)},{$set:{enabled:true}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

page.incrementID=(o,cb=nf)->
  mod.getID o,(e,r)->
    o2={}
    o2.doc={}
    o2.doc.pageID=o.doc.id+1
    o2.db=o.db
    mod.updateID o2,cb

page.checkID=(o,id,cb=nf)->
  o.db.find {type:"page",id:id},{multi:true},(e,r)->
    cb(n,r.length==0)

page.getNextID=(o,id,cb=nf)->
  page.checkID o,id,(e,r)->
    if(r)
      cb(null,id)
    else
      page.getNextID(o,id+1,cb=nf)

page.create=(o,cb=nf)->
  o.query=(o,cb=nf)->
    mod.getID o,(e,id)->
      page.getNextID o,id.pageID+1,(e,id)->
        o2={}
        o2.doc=
          "name":o.doc.name||"page"
          "type":"page"
          "project":cleanID(o.doc.project)
          "section":cleanID(o.doc.section)
          "id":id
          "enabled":true
          "createdAt": new Date() 
        o2.db=o.db
        o.db.insert o2.doc,(e,r)->
          page.incrementID o2,(e2,r2)->
            cb e||e2,r
  tryrun.run o.query,o,cb

page.list=(o,cb=nf)->
  o.query=(o,cb=nf)->
    #l o
    o.db.find
      "type":"page"
      "project":cleanID(o.doc.project)
      "section":cleanID(o.doc.section)
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

page.rename=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update 
      type:"page"
      id:cleanID(o.doc.id)
      project:cleanID(o.doc.project)
      section:cleanID(o.doc.section)
    ,{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

page.remove=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update 
      type:"page"
      id:cleanID(o.doc.id)
      project:cleanID(o.doc.project)
      section:cleanID(o.doc.section)
    ,{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

note.incrementID=(o,cb=nf)->
  mod.getID o,(e,r)->
    o2={}
    o2.doc={}
    o2.doc.noteID=o.doc.id+1
    o2.db=o.db
    mod.updateID o2,cb

note.checkID=(o,id,cb=nf)->
  o.db.find {type:"note",id:id},{multi:true},(e,r)->
    cb(n,r.length==0)

note.getNextID=(o,id,cb=nf)->
  note.checkID o,id,(e,r)->
    if(r)
      cb(null,id)
    else
      note.getNextID(o,id+1,cb=nf)

note.create=(o,cb=nf)->
  o.query=(o,cb=nf)->
    mod.getID o,(e,id)->
      note.getNextID o,id.noteID+1,(e,id)->
        o2={}
        o2.doc= 
          "name":o.doc.name||"note"
          "type":"note"
          "project":cleanID(o.doc.project)
          "section":cleanID(o.doc.section)
          "page":cleanID(o.doc.page)
          "title":o.doc.title||""
          "text":o.doc.text||""
          "id":id
          "enabled":true
          "createdAt": new Date() 
        o2.db=o.db
        o.db.insert o2.doc,(e,r)->
          note.incrementID o2,(e2,r2)->
            cb e||e2,r
  tryrun.run o.query,o,cb

note.path=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find {type:"note",id:cleanID(o.doc.id),enabled:true},{multi:false},(e1,noteDoc)->
      l noteDoc
      if noteDoc.length==0
        cb null,""
      else
        noteDoc=noteDoc[0]
        o.db.find {type:"project",id:cleanID(noteDoc.project),enabled:true},{multi:false},(e2,projectDoc)->
          o.db.find {type:"section",id:cleanID(noteDoc.section),enabled:true},{multi:false},(e3,sectionDoc)->
            o.db.find {type:"page",id:cleanID(noteDoc.page),enabled:true},{multi:false},(e4,pageDoc)->
              xpath=projectDoc[0].name+"\\\\"+sectionDoc[0].name+"\\\\"+pageDoc[0].name+"\\\\"+noteDoc.name
              cb e1||e2||e3||e4,xpath      
  tryrun.run o.query,o,cb

note.list=(o,cb=nf)->
  o.query=(o,cb=nf)->
    #l o
    o.db.find
      "type":"note"
      "project":cleanID(o.doc.project)
      "section":cleanID(o.doc.section)
      "page":cleanID(o.doc.page)
      "enabled":true
    ,(e,r)->
      r = r.map(({ text, ...rest }) => rest)
      cb e,r
  tryrun.run o.query,o,cb

note.listAll=(o,cb=nf)->
  o.query=(o,cb=nf)->
    #l o
    o.db.find
      "type":"note"
      "enabled":true
    ,(e,r)->
      r = r.map(({ text, ...rest }) => rest)
      cb e,r
  tryrun.run o.query,o,cb

note.rename=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"note",id:cleanID(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

note.updateTitle=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"note",id:cleanID(o.doc.id)},{$set:{title:o.doc.title}},{multi:false},cb
  tryrun.run o.query,o,cb

note.updateText=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"note",id:cleanID(o.doc.id)},{$set:{text:o.doc.text}},{multi:false},cb
  tryrun.run o.query,o,cb

note.getText=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find {type:"note",id:cleanID(o.doc.id),enabled:true},{multi:false},cb
  tryrun.run o.query,o,cb

note.remove=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.update {type:"note",id:cleanID(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
  tryrun.run o.query,o,cb

#---

temp.get=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find {type:"temp",id:cleanID(o.doc.id||1),enabled:true},{multi:false},cb
  tryrun.run o.query,o,cb

temp.save=(o,cb=nf)->
  o.query=(o,cb=nf)->
    o.db.find {type:"temp",id:cleanID(o.doc.id||1),enabled:true},{multi:true},(e,r)->
      if r.length==0
        # create new temp doc when it is not found
        o2={}
        o2.doc=
          "name":o.doc.name||"temp"
          "type":"temp"
          "title":o.doc.title||"temp"
          "text":o.doc.text||""
          "id":cleanID(o.doc.id||1)
          "enabled":true
          "createdAt": new Date() 
        o.db.insert o2.doc,(e,r)->
          cb e,r
      else
        # update existing temp doc when it exists
        o.db.update {type:"temp",id:cleanID(o.doc.id)},{$set:o.doc},{multi:false},cb
  tryrun.run o.query,o,cb

temp.output=(o,cb=nf)->
  o.query=(o,cb=nf)->
    text=""
    try
      text=fs.readFileSync("./output.log").toString()
    catch e
    cb(n,{text:text})
  tryrun.run o.query,o,cb
#---

routeHandler=(app,db)->
  #app.use createIframe

  app.get "/size",(req,res)->
    stats = fs.statSync('/root/db')
    ressend res,stats.size

  app.get "/theme",(req,res)->
    mod.getTheme {db:db},(e,r)->
      ressend res,r

  app.get "/language",(req,res)->
    mod.getLanguage {db:db},(e,r)->
      ressend res,r

  app.get "/motd",(req,res)->
    ressend res,fs.readFileSync('./resource/motd').toString()

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
    r=req.auth.username
    #l result
    ressend res,r

  app.post "/runsh",(req,res)->
    mod.runSH {db:db,script:req.body.script,shell:(req.body.shell||null),cwd:(req.body.cwd||"./")},(e,r)->
      if e
        res.send 500,e.Message
      else
        res.send 200,r

  app.get "/ajax",(req,res)->
    mod.find {db:db,doc:req.query},(e,r)->
      res.send 200,r

  app.post "/ajax",(req,res)->
    mod.create {db:db,doc:req.body},(e,r)->
      res.send 200,r
  
  app.put "/ajax",(req,res)->
    mod.update {db:db,doc:req.body},(e,r)->
      res.send 200,r
  
  app.delete "/ajax",(req,res)->
    mod.remove {db:db,doc:req.body},(e,r)->
      res.send 200,r

  app.get "/iframe",(req, res)->
    res.set 'Content-Type','text/html'
    res.send await nodeiframe.fetchFrame
      url: req.query.url
      baseHref: req.query.baseHref+"/iframe?url="
      config: { cors: { script: true } }
    #res.createIframe
    #  url: req.query.url
    #  baseHref: req.query.baseHref
    #  config: { cors: { script: true } }

  app.get "/project",(req,res)->
    project.list {db:db},(e,r)->
      res.send 200,r

  app.get "/project/export",(req,res)->
    project.export {db:db},(e,r)->
      data=JSON.stringify(r,null,2)
      fs.writeFileSync "./export.json",data
      l "project exported to ./export.json"
      if e
        res.send 500,"Failed to import"
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
  
  app.get "/section/all",(req,res)->
    #l req.query
    section.listAll {db:db,doc:req.query},(e,r)->
      l r
      res.send 200,r

  app.get "/section/enable",(req,res)->
    #l req.query
    section.enable {db:db,doc:req.query},(e,r)->
      l r
      res.send 200,r

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

  #--

  app.get "/temp",(req,res)->
    temp.get {db:db,doc:req.body},(e,r)->
      res.send 200,r

  app.post "/temp",(req,res)->
    temp.save {db:db,doc:req.body},(e,r)->
      res.send 200,r

  app.get "/output",(req,res)->
    temp.output {db:db},(e,r)->
      #l r
      res.send 200,r

  #--

  return app

#---

module.exports={mod:mod,project:project,section:section,page:page,note:note,routeHandler:routeHandler}