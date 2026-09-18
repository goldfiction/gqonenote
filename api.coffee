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

#---

mod={}
mod.indexTemp=
  "type":"index"
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
  o.db.update {type:'index'},{$set:o.doc},{multi:false},(err,numAffected)->
    cb err,numAffected

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
      "type":"project"
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

project.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:o.doc.id},{$set:{name:o.doc.name}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

project.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"project",id:o.doc.id},{$set:{enabled:false}},{multi:false},(err,numAffected)->
      cb err,numAffected
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
        "project":o.doc.project
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
      "project":o.doc.project
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

section.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"section",id:o.doc.id},{$set:{name:o.doc.name}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

section.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"section",id:o.doc.id},{$set:{enabled:false}},{multi:false},(err,numAffected)->
      cb err,numAffected
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
        "project":o.doc.project
        "section":o.doc.section
        "id":id.pageID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        page.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

page.list=(o,cb)->
  o.query=(o,cb)->
    o.db.find
      "type":"page"
      "project":o.doc.project
      "section":o.doc.section
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

page.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"page",id:o.doc.id},{$set:{name:o.doc.name}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

page.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"page",id:o.doc.id},{$set:{enabled:false}},{multi:false},(err,numAffected)->
      cb err,numAffected
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
        "project":o.doc.project
        "section":o.doc.section
        "page":o.doc.page
        "title":o.doc.title||""
        "text":o.doc.text||""
        "id":id.noteID+1
        "enabled":true
        "createdAt": new Date() 
      o.db.insert o.doc,(e,r)->
        note.incrementID o,(e2,r2)->
          cb e||e2,r
  tryrun.run o.query,o,cb

note.list=(o,cb)->
  o.query=(o,cb)->
    o.db.find
      "type":"note"
      "project":o.doc.project
      "section":o.doc.section
      "page":o.doc.page
      "enabled":true
    ,cb
  tryrun.run o.query,o,cb

note.rename=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:o.doc.id},{$set:{name:o.doc.name}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

note.updateTitle=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:o.doc.id},{$set:{title:o.doc.title}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

note.updateText=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:o.doc.id},{$set:{text:o.doc.text}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

note.remove=(o,cb)->
  o.query=(o,cb)->
    o.db.update {type:"note",id:o.doc.id},{$set:{enabled:false}},{multi:false},(err,numAffected)->
      cb err,numAffected
  tryrun.run o.query,o,cb

#---

routeHandler=(app)->
  

#---

module.exports={mod:mod,project:project,section:section,page:page,note:note}