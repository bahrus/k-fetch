<a href="https://nodei.co/npm/k-fetch/"><img src="https://nodei.co/npm/p-fetch.png"></a>
# k-fetch

<img src="https://badgen.net/bundlephobia/minzip/k-fetch">

## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

k-fetch is a small, bare-bones simple fetch web component.  For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch).

k-fetch can act as a base web component.  [be-kvetching](https://github.com/bahrus/be-kvetching) and [be-fetching](https://github.com/bahrus/be-fetching) [TODO] actually can dynamically create such a web component on the fly, declaratively, that extends this base class.

Markup:

```html
<k-fetch 
href=https://cors-anywhere.herokuapp.com/https://www.theonion.com/ 
as=html shadow=open credentials=omit onerror="console.error(href)"></k-fetch>
    
```

If as=json, a custom event, "fetch-complete" is fired, with the data in the detail.  The data is also stored in the "value" field of k-fetch. Also, event "change" is fired. 

If as=html, the response is inserted into the innerHTML of the k-fetch element, unless attribute shadow is present, in which case it will first create a shadowRoot, then insert the innerHTML.

k-fetch has no support for "href" or "as" properties, only attributes.

k-fetch caches get's based on the localName of the custom element as the base key of the cache. 