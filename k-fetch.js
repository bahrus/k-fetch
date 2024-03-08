const cache = new Map();
export class KFetch extends HTMLElement {
    static observedAttributes = ['href', 'as', 'shadow', 'target'];
    attributeChangedCallback() {
        this.do();
    }
    connectedCallback() {
        this.do();
    }
    get href() {
        return this.getAttribute('href');
    }
    get as() {
        return this.getAttribute('as') || 'json';
    }
    get accept() {
        if (this.hasAttribute('accept'))
            return this.getAttribute('accept');
        const as = this.as;
        let defaultVal = 'application/json';
        switch (as) {
            case 'html':
                defaultVal = 'text/html';
        }
        return defaultVal;
    }
    get method() {
        return this.getAttribute('method') || 'GET';
    }
    body;
    get init() {
        return {
            method: this.method,
            headers: {
                'Accept': this.accept,
            },
            credentials: this.credentials,
            body: this.body,
        };
    }
    get credentials() {
        return this.getAttribute('credentials') || 'omit';
    }
    onerr(e) {
        const err = this.onerror;
        if (typeof err === 'function') {
            err(e);
        }
    }
    validateResp(resp) {
        return true;
    }
    #lastHref;
    async do() {
        try {
            const href = this.href;
            if (href === null)
                return;
            if (href === this.#lastHref)
                return;
            if (this.onerror !== null) {
                console.error('onerror required');
                return;
            }
            const target = this.getAttribute('target');
            this.#lastHref = href;
            //TODO only cache if get request
            let data = cache.get(this.localName)?.get(href);
            const as = this.as;
            if (data === undefined) {
                const resp = await fetch(href, this.init);
                if (!this.validateResp(resp)) {
                    this.onerr(resp);
                    return;
                }
                ;
                //TODO - validate
                switch (as) {
                    case 'text':
                    case 'html':
                        data = await resp.text();
                        break;
                    case 'json':
                        data = await resp.json();
                        break;
                }
                this.dispatchEvent(new CustomEvent('fetch-complete', {
                    detail: data,
                }));
                if (!cache.has(this.localName)) {
                    cache.set(this.localName, new Map());
                }
            }
            switch (as) {
                case 'text':
                case 'json':
                    this.setAttribute('hidden', '');
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    break;
                case 'html':
                    //TODO: Sanitize unless onload is set
                    let root = target == null ? this : this.getRootNode().querySelector(target);
                    const shadow = this.getAttribute('shadow');
                    if (shadow !== null) {
                        if (this.shadowRoot === null)
                            this.attachShadow({ mode: shadow });
                        root = this.shadowRoot;
                    }
                    root.innerHTML = data;
                    break;
            }
        }
        catch (e) {
            this.onerr(e);
        }
    }
    value;
}
customElements.define('k-fetch', KFetch);
