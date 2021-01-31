<a href="https://nodei.co/npm/k-fetch/"><img src="https://nodei.co/npm/p-fetch.png"></a>
# k-fetch

<img src="https://badgen.net/bundlephobia/minzip/k-fetch">

k-fetch is a small, simple fetch web component.  For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch).

Syntax:

```html
<k-fetch href=... as=json|html></k-fetch>
```

If as=json, a custom event, "fetch-complete" is fired, with the data in the detail.  The data is also stored in the "value" field of k-fetch.

If as=html, the response is inserted into the innerHTML of the k-fetch element.

k-fetch doesn't respond to changes in the href or as attribute.  Nor does it support href or as properties.