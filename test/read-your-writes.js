
var levelup = require('level')
var tape    = require('tape')
var rimraf  = require('rimraf')

var Update  = require('..')

var path = '/tmp/test-level-update'


/*
code paths to test with batch...

test veto...

test modify,

*/
rimraf(path, function () {

  tape('test', function (t) {

    levelup(path, function (err, db) {
      var called = 0
      var n = 1000, r = 1000, r2 = 1000
      var counter = 2, ops = []

      function tryToEnd() {
        if (!--counter)
          t.end()
      }

      function putAndGet(key, value) {
        db.put(key, value, function () {
          db.get(key, function (err, val) {
            t.equal(val, val)
            if(!--r)
              tryToEnd()
          })
        })
      }

      while(n--) {
        putAndGet('key_' + Date.now(), 'val_' + Date.now())

        ops.push({
          type  : 'put',
          key   : ('batch_key_' + n),
          value : ('batch_val_' + n)
        })
      }

      db.batch(ops, function(err) {
        t.ok(err == null)

        db.createKeyStream({
          start   : 'batch_key_\xff',
          end     : 'batch_key_\x00',
          reverse : true
        }).on('data', function(item) {
          --r2
        }).on('end', function(){
          t.equal(r2, 0)
          tryToEnd()
        });
      })
    })
  })
})

