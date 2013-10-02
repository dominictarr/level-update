
/*
okay, so I'm pretty sure that ordering will break when doing lots of updates.
If you do a bunch of gets really fast - then they won't necessarily come back in order.

so, hmm, so I should make a test that breaks, and then implement locks,
and but make locks disableable, so that I can verify that the test still fails...

so, what is a test that could fail?

the update is two part - 
it does a get, and then (possiblly) a put.
it is essential that the value has not changed in between the get and the put.

so... if I do a 1000 paralell updates 
say, updating the same key, with the same _prev, see ./version.js,
then one of the pair should always fail, it should not be possible for both to succede.

only one should succede, and a get after that should return the correct value.

I don't actually care which one wins, as long as only one wins.
*/


var levelup = require('level')
var tape    = require('tape')
var rimraf  = require('rimraf')

var HashVersion  = require('../hash-version')

var path = '/tmp/test-level-update'


/*
code paths to test with batch...

test veto...

test modify,

TODO test coverage for batches, and dels

*/
rimraf(path, function () {

  tape('test', function (t) {

    var r = 'VALUE' + Math.random(), r2 = 'value2' + Math.random()

    levelup(path, function (err, db) {

      HashVersion(db)

      function parallel (cb) {

        var k = 'key_' + Math.random()

        var A = HashVersion.hash({
          value: 'A' + Math.random()
        })

        var B = HashVersion.hash({
          value: 'B' + Math.random(),
          _prev: A._hash
        })

        var C = HashVersion.hash({
          value: 'C' + Math.random(),
          _prev: A._hash
        })

        db.put(k, JSON.stringify(A), function () {
          var i = 2, error = 0, okay
          console.log('PUT1', k, B)
          db.put(k, JSON.stringify(B), _next(B))
          console.log('PUT2', k, C)
          db.put(k, JSON.stringify(C), _next(C))

          function _next(x) {
            return function next(err) {
              if(err) error ++
              else okay = x
              if(!--i) {
                t.equal(error, 1, 'expect one update to fail')
                db.get(k, function (err, value) {
                  value = JSON.parse(value)
                  t.deepEqual(value, okay)
                  cb()
                })
              }
            }
          }
        })

      }

      //do a bunch of updates, do they all callback in order?

      var r, l = r = 100

      while(l--) { (function (i) {
          parallel(function () {
            
            if(!--r) t.end()
          })
        })(l)
      }

    })
  })
})
