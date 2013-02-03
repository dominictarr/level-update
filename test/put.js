
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
      Update(db, function (value, _value, key) {
        called ++
        if(called == 1) {
          t.equal(value, r)
          t.equal(_value, undefined)
          t.equal(key, 'key')
        } else if (called == 2) {
          t.equal(value, r2)
          t.equal(_value, r)
          t.equal(key, 'key')
        }

        /*
          level-update may intercept a put/del, and react 3 ways.

          return true : allow update to procede as normal.

          throw error : veto update.

          return string | buffer : save this instead.

          ---

          if the operation is a del, val == null.
          if the operation is the first put, _val = null.

          if the operation was a batch, vetoing a single operation will veto the whole batch.
        */

        return true
      })

      db.put('key', r, function (err) {
        t.equal(called, 1)
        db.put('key', r2, function (err, value) {
          t.equal(called, 2)
          console.log(value)
          t.end()
        })
      })
    })
  })
})
