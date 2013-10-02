var Lock = require('lock')

module.exports = function (db, opts) {

  var lock = Lock()

  if('function' === typeof opts)
    opts = {merge: opts}
  opts.start = opts.start || ''
  opts.end   = opts.end || '~'

  /*
  A value must not change between GET and PUT/DEL/BATCH
  so, locking is necessary. 

  */

  var merge = opts.merge

  var put = db.put, del = db.del, batch = db.batch

  function op (key, value, cb) {
    var ks = key.toString()
    if(ks < opts.start || opts.end < ks)
      return put.call(db, key, value, options, cb)

    db.get(key, function (err, _value) {
      if(err && err.name != 'NotFoundError') return cb(err)
      var merged
      try {
        merged = merge(value, _value, key)
      } catch (err) {
        return cb(err)
      }
      if('string' === typeof merged || Buffer.isBuffer(merged))
        value = merged

      cb(null, value)
    })
  }

  db.put = function(key, value, options, cb) {
    if(!cb) cb = options, options = null
    lock(key, function (release) {
      var _cb = release(cb)
      op(key, value, function (err, value) {
        if(err) return _cb(err)
        if(!value) return del.call(db, key, options, _cb)
        return put.call(db, key, value, options, _cb)
      })
    })
  }

  db.del = function(key, options, cb) {
    lock(key, function (release) {
      var _cb = release(cb)
      op(key, null, function (err, value) {
        if(err) return _cb(err)
        if(value) return put.call(db, key, value, _cb)
        return del.call(db, key, options, _cb)
      })
    })
  }

  db.batch = function (ops, options, cb) {
    if(!cb)
      cb = options, options = null
    //check all the ops, and veto if any error, else run the batch...
    var done = ops.length, error

    lock(ops.map(function (e) {
      return e.key.toString()
    }), function (release) {
      var _cb = release(cb)
      ops.forEach(function (item) {
        var n = 0
        op(item.key, item.value || null, function (err, value) {
          if(n++)   return //enforce onceness of cb
          if(error) return //the batch has been vetoed.
                           //release all keys
          if(err)   return _cb(error = err)

          item.value = value

          if(--done) return //not the last thing yet..

          //if this was the last operation...
          batch.call(db, ops, options, _cb)
        })
      })
    })
  }
}

