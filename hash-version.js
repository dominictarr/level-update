var Update = require('./')
var shasum  = require('shasum')

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function hash (obj) {
  if(obj == null) return null
  obj = clone(obj)
  delete obj._hash
  obj._hash = shasum(JSON.stringify(obj))
  return obj
}

function parse (v) {
  return v == null ? null : JSON.parse(v.toString())
}

var HashVersion = module.exports = function (db) {
  Update(db, function (value, _value, key) {
    value  = hash(parse(value))
    _value = hash(parse(_value))
    if(_value) {
      if(!value || value._prev !== _value._hash)
        throw new Error(JSON.stringify(value)
          + ' does not follow '
          + JSON.stringify(_value)
          + ' concurrent update?'
        )
    }
  })
}

HashVersion.hash = hash
