
var levelup = require('levelup')
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

    var r = 'VALUE' + Math.random(), r2 = 'value2' + Math.random()

    levelup(path, function (err, db) {
      var called = 0
      var k = 'key_' + Math.random()
      var v = 'val_' + Math.random()
      var n = 1000, r = 1000

      while(n--) {

        db.put(k, v, function () {
          db.get(k, function (err, val) {
            t.equal(val, v)
            if(!--r)
              t.end()
          })
        })
      }
    })
  })
})

