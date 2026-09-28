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

tryrun=require "gqtryrun"
l=console.log
fs=require "fs"

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

project.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:JSON.parse(o.doc.id)},{$set:{name:o.doc.name}},{multi:false},cb
  tryrun.run o.query,o,cb

project.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:JSON.parse(o.doc.id)},{$set:{enabled:false}},{multi:false},cb
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

  app.get "/project",(req,res)->
    project.list {db:db},(e,r)->
      res.send 200,r
  
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