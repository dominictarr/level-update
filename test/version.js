
var levelup = require('levelup')
var tape    = require('tape')
var rimraf  = require('rimraf')

var HashVersion = require('../hash-version')
var hash = HashVersion.hash

var path = '/tmp/test-level-update'


/*
this test implements a simple versioning system
that works like couchdb.
each record gets assigned a _hash property, 
which is a hash of it's content (with _hash property removed)
and a _prev property, which points to the previous update.

if the user attempts to save a record, but _prev is not equal
to _hash for the current value, then that update will be rejected.

Many other schemes are possible!
*/

function parse (v) {
  return v == null ? null : JSON.parse(v.toString())
}

rimraf(path, function () {

  tape('version test', function (t) {

    levelup(path, function (err, db) {
      HashVersion(db)

      var r = hash({
        value: Math.random(),
      })

      var r_wrong = hash({
        value: 'WRONG_' + Math.random(),
      })

      var r2 = hash({
        value: Math.random(),
        _prev: r._hash
      })

      db.put('key', JSON.stringify(r), function (err, _r) {
        console.log('1')
        t.equal(err, null)
        db.put('key', JSON.stringify(r_wrong), function (err) {
        console.log(2)
          t.notEqual(err, null)
          db.get('key', function (err, val) {
            console.log(3)
            t.deepEqual(r, parse(val))
            db.put('key', JSON.stringify(r2), function (err) {
              console.log(4)
              db.get('key', function (err, val) {
                t.deepEqual(r2, parse(val))
                t.end()
              })
            })
          })
        })
      })
    })
  })
})

