<a href="https://nodei.co/npm/k-fetch/"><img src="https://nodei.co/npm/p-fetch.png"></a>
# k-fetch

[![NPM version](https://badge.fury.io/js/k-fetch.png)](http://badge.fury.io/js/k-fetch)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/k-fetch?style=for-the-badge)](https://bundlephobia.com/result?p=k-fetch)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/k-fetch?compression=gzip">
<!--[![Playwright Tests](https://github.com/bahrus/k-fetch/actions/workflows/CI.yml/badge.svg?branch=baseline)](https://github.com/bahrus/k-fetch/actions/workflows/CI.yml)-->


## [Demo](https://jsfiddle.net/bahrus/ma0vtbnx/1/)

k-fetch is a small, bare-bones simple fetch web component.  For more features (but larger footprint), see [xtal-fetch](https://www.npmjs.com/package/xtal-fetch). k-fetch provides no support for rendering while streaming.  For such support, see alternatives, such as [be-written](https://github.com/bahrus/be-written).

k-fetch can act as a base web component for "web components as a service".  [be-kvetching](https://github.com/bahrus/be-kvetching) and [be-fetching](https://github.com/bahrus/be-fetching) [TODO] actually do just that - they can dynamically create such a web component on the fly, declaratively, that extends this base class.

Markup:

```html
<k-fetch 
href=https://cors-anywhere.herokuapp.com/https://www.theonion.com/ 
as=html shadow=open onerror="console.error(href)"></k-fetch>
    
```

For this very specific example shown above, due to restrictions of the cors-anywhere utility the link above uses, you will first need to go to https://cors-anywhere.herokuapp.com/corsdemo to unlock the service for a limited amount of time.

Required attributes are href and at least one of these attributes: onerror, oninput, onload, onchange.  The reason for insisting on at least one of these on* attributes is this:  Since these attributes can't pass through any decent sanitizer that prevents xss attacks, the presence of one or more of them indicates that the web site trusts the content from which the data is being retrieved.

When the fetch is complete, event "load" is fired, which can allow for manipulation of the data.  The (modified) data is then stored in the "value" field of the k-fetch (or subclassed) instance. Also, event "change" is fired. 

If as=html, the response is inserted into the innerHTML of the k-fetch element, unless attribute shadow is present, in which case it will first create a shadowRoot, then insert the innerHTML.

k-fetch has no support for "href" or "as" properties, only attributes.

k-fetch caches get's based on the localName of the custom element as the base key of the cache. 

## Sending data to a target:

```html
<k-fetch 
    href=https://newton.now.sh/api/v2/integrate/x^2 
    target=json-viewer[-object]
    onerror=console.error(href)
>
</k-fetch>
...
<json-viewer -object></json-viewer>
```

k-fetch will set aria-busy to true while fetch is in progress, and also set aria-live=polite if no aria-live value is found.

## Viewing Demos Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

<!--## Running Tests

```
> npm run test
```
-->
## Using from ESM Module:

```JavaScript
import 'k-fetch/k-fetch.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/k-fetch';
</script>
```


