q=require  # use this to reference q

a=q './app.coffee'  # use this line to reference app
b=q './api.coffee'
t=q 'gqtest'  # use this line to reference gqtest
x=q("child_process").exec

console.log "loading db..."
Datastore=require 'nedb'
db = new Datastore({ filename: '/root/db', autoload: true })
console.log "db loaded..."

f=t.it  # this is done
g=t.doRun  # this is doRun

n=null
l=console.log

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

f "should be able to list project",(f)->
  b.project.list {db:db},(e,r)->
    l r
    f e

g n,(e,r)->    # use this to doRun
  #r.result.fail==0&&a.run()
# this one liner first install npm install
# then test g(null)
# then run a.run() when no error returned from any f tests
# this way, a.run() is ran automatically when npm install and all tests passed