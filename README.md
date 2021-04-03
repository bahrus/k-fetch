<a href="https://nodei.co/npm/k-fetch/"><img src="https://nodei.co/npm/p-fetch.png"></a>
# k-fetch

<img src="https://badgen.net/bundlephobia/minzip/k-fetch">

## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

k-fetch is a small, bare-bones simple fetch web component.  For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch).

Syntax:

```html
<k-fetch href=... as=json|text|html [shadow]></k-fetch>
```

If as=json, a custom event, "fetch-complete" is fired, with the data in the detail.  The data is also stored in the "value" field of k-fetch.

If as=html, the response is inserted into the innerHTML of the k-fetch element, unless attribute shadow is present, in which case it will first create a shadowRoot, then insert the innerHTML.

k-fetch has no support for "href" or "as" properties, only attributes.