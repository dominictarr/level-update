
var levelup = require('levelup')
var tape    = require('tape')
var rimraf  = require('rimraf')

var Update  = require('..')

var path = '/tmp/test-level-update'

rimraf(path, function () {

  tape('test', function (t) {

    var r = 'VALUE' + Math.random(), r2 = 'value2' + Math.random()

    levelup(path, function (err, db) {
      var called = 0
      Update(db, function (value, _value, key) {
        called ++
        if(key == 'veto') throw new Error('veto')
        return true
      })

      db.put('key', r, function (err) {
        if(err) throw err

        db.batch([
          {type: 'put', key: 'key', value: r}, 
          {type: 'put', key: 'key2', value: r2}, 
          {type: 'put', key: 'veto', value: 'whatever'}
        ], function (err) {
          console.log(err)
          t.equal(err.message, 'veto')
          t.equal(called, 4)
          t.end()
        })

      })
    })
  })
})
