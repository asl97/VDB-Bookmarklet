 Viewer Download Button - Bookmarklet version
 ----
 Nothing to see here

<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

If you made it this far down, you probably want to know what this is.


Bookmarklet is basically just a template which handles dependencies and script isolation.

```javascript
// Bookmarklet takes three args, an array of dependencies, a function to turn to string and embed it
//  and scope thingy*
bookmarklet([], function(){}, local_scope)

// * a function which return a promise that resolve to an object with a `load` and `run` functions
```

Look at [bookmarklet.js](examples/case1/bookmarklet.js) for an example of usage.

 Notes
----
[Pixiv.js was originally](scratchpad/pixiv.js) implemented using the api, however there was an issue with CORS.

It was reimplemented using the 'poke' method where it send a `GET request` and see if it's successful.

 Changelog
----

[Moved to it's own file cause I want it to be just plain old text](Changelog.txt)
