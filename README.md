Verifies Googlebot, using Google's recommended method (reverse DNS). This middleware also takes performance into account, and caches the results.

# usage
```
app.use(require('express-isgooglebot'));
```

this will add a property to the request object that can be used like this

```
function (request, response, next) {
	response.send(request.isGoogleBot);
}
```
