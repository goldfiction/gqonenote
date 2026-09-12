q=require  # use this to reference q

a=q './app.coffee'  # use this line to reference app
b=q './api.coffee'  # api for server
t=q 'gqtest'  # use this line to reference gqtest
x=q("child_process").exec

console.log "loading db..."
Datastore=require 'nedb'
db = new Datastore({ filename: '/root/db', autoload: true })
console.log "db loaded..."

f=t.it  # this is done
d=t.describe
g=t.doRun  # this is doRun

n=null
u=undefined
l=console.log
er=console.error

getRandomInt=(min,max)->
  Math.floor(Math.random() * (max - min + 1)) + min

t.staging.beforeAll=(f)->
  x "npm install  --prefer-offline  --no-audit  --openssl-legacy-provider  --require coffeescript/register  --no-bin-links",(e,sto,ste)->
    f e
    #  --prefer-offline  --no-audit  cause npm install to be fast when nothing new needs to be installed
    #  --require coffeescript/register  makes script capable to run .coffee script without precompiling
    #  --no-bin-links  makes script not install binary references, so it can be ran in docker environment

# dummy test for code integrity
f "should be able to run",(f)->
  f n  # f n is same as f(null)

f "should be able to retrieve index",(f)->
  b.mod.getID {db:db},(e,r)->
    l r
    f e

id=getRandomInt 1,9999
project_id=id
section_id=id
page_id=id
note_id=id
projectID=n
sectionID=n
pageID=n
noteID=n

d "project tests ",()->
  
  f "should be able to list project",(f)->
    b.project.list {db:db},(e,r)->
      l r
      f e
  
  f "should be able to create project",(f)->
    b.project.create {db:db,doc:{name:project_id+""}},(e,r)->
      l r
      projectID=r.id
      f e
  
  f "should be able to rename project",(f)->
    b.project.rename {db:db,doc:{id:projectID,name:project_id+"_renamed"}},(e,r)->
      l r
      f e
  
  f "should be able to remove project",(f)->
    b.project.remove {db:db,doc:{id:projectID}},(e,r)->
      l r
      f e

d "section tests",()->
  
  f "should be able to create project",(f)->
    b.project.create {db:db,doc:{name:project_id+""}},(e,r)->
      l r
      projectID=r.id
      f e

  f "should be able to list section",(f)->
    b.section.list {db:db,doc:{project:projectID}},(e,r)->
      l r
      f e
  
  f "should be able to create section ",(f)->
    b.project.create {db:db,doc:{project:projectID,name:section_id+""}},(e,r)->
      l r
      sectionID=r.id
      f e
  
  f "should be able to rename section",(f)->
    b.project.rename {db:db,doc:{id:sectionID,name:section_id+"_renamed"}},(e,r)->
      l r
      f e
  
  f "should be able to remove section",(f)->
    b.project.remove {db:db,doc:{id:sectionID}},(e,r)->
      l r
      f e

d "page tests",()->
  
  f "should be able to create project",(f)->
    b.project.create {db:db,doc:{name:project_id+""}},(e,r)->
      l r
      projectID=r.id
      f e

  f "should be able to create section ",(f)->
    b.project.create {db:db,doc:{project:projectID,name:section_id+""}},(e,r)->
      l r
      sectionID=r.id
      f e

  f "should be able to list page",(f)->
    b.page.list {db:db,doc:{project:projectID,section:sectionID}},(e,r)->
      l r
      f e
  
  f "should be able to create page",(f)->
    b.page.create {db:db,doc:{project:projectID,section:sectionID,name:page_id+""}},(e,r)->
      l r
      pageID=r.id
      f e
  
  f "should be able to rename page",(f)->
    b.page.rename {db:db,doc:{id:pageID,name:page_id+"_renamed"}},(e,r)->
      l r
      f e
  
  f "should be able to remove page",(f)->
    b.page.remove {db:db,doc:{id:pageID}},(e,r)->
      l r
      f e

d "note tests",()->
  
  f "should be able to create project",(f)->
    b.project.create {db:db,doc:{name:project_id+""}},(e,r)->
      l r
      projectID=r.id
      f e
  
  f "should be able to create section ",(f)->
    b.project.create {db:db,doc:{project:projectID,name:section_id+""}},(e,r)->
      l r
      sectionID=r.id
      f e
  
  f "should be able to create page",(f)->
    b.page.create {db:db,doc:{project:projectID,section:sectionID,name:page_id+""}},(e,r)->
      l r
      pageID=r.id
      f e
  
  f "should be able to list note",(f)->
    b.note.list {db:db,doc:{project:projectID,section:sectionID,page:pageID}},(e,r)->
      l r
      f e
  
  f "should be able to create note",(f)->
    b.note.create {db:db,doc:{project:projectID,section:sectionID,page:pageID,name:note_id+""}},(e,r)->
      l r
      noteID=r.id
      f e
  
  f "should be able to rename note",(f)->
    b.note.rename {db:db,doc:{id:noteID,name:note_id+"_renamed"}},(e,r)->
      l r
      f e
  
  f "should be able to update note title",(f)->
    b.note.updateText {db:db,doc:{id:noteID,title:"updated title"}},(e,r)->
      l r
      f e

  f "should be able to update note text",(f)->
    b.note.updateText {db:db,doc:{id:noteID,text:"updated text"}},(e,r)->
      l r
      f e
  
  f "should be able to remove note",(f)->
    b.note.remove {db:db,doc:{id:noteID}},(e,r)->
      l r
      f e

g n,(e,r)->    # use this to doRun
  #r.result.fail==0&&a.run()
# this one liner first install npm install
# then test g(null)
# then run a.run() when no error returned from any f tests
# this way, a.run() is ran automatically when npm install and all tests passed