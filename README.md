# level-update

A levelup plugin that can be used implements conditional updates.

The name of this module may change if I think of something better.

## Example

`level-update' intercepts database mutations (`put, del, batch`),
retrives the current value for that key, and passed the old value,
and the new value to a user supplied `merge` function.

The merge function can be used a number of ways - if it throws an error,
the put/del/batch will callback an error.

If it returns a `string` or `Buffer`, then that value will be saved instead.

And if it returns something else, then the new value will be saved as normal.

``` js
  var Update = require('level-update')

  Update(db, function merge (oldValue, newValue) {
    
  })

  db.put('key', 'VALUE', function (err) {
    //this will be intercepted
  })
```

If `oldValue` is null, the operation is a create.

If `newValue` is null, the operation is a delete.

Otherwise, the operation is an update.

## Use as validation / Authentication.

check that new value is correct, or throw error.

## Use for versioning

check that new value comes after old, or merge concurrent updates.

## License

MIT
