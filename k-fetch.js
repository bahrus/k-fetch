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
            body: typeof this.body === 'object' ? JSON.stringify(this.body) : this.body,
        };
    }
    get credentials() {
        return this.getAttribute('credentials') || 'omit';
    }
    get targetSelector() {
        return this.getAttribute('target');
    }
    get target() {
        const targetSelector = this.targetSelector;
        if (targetSelector === null)
            return null;
        return this.getRootNode().querySelector(targetSelector);
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
    validateOn() {
        return this.onerr !== null || this.onload !== null || this.oninput !== null || this.onchange !== null;
    }
    async setTargetProp(target, data, shadow) {
        if (target === null)
            return;
        const targetSelector = this.targetSelector;
        if (targetSelector === null)
            return;
        const lastPos = targetSelector.lastIndexOf('[');
        if (lastPos === -1)
            throw 'NI'; //Not implemented
        const rawPath = targetSelector.substring(lastPos + 2, targetSelector.length - 1);
        const { lispToCamel } = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        if (shadow !== null && propPath === 'innerHTML') {
            let root = target.shadowRoot;
            if (root === null) {
                root = target.attachShadow({ mode: shadow });
            }
            root.innerHTML = data;
        }
        else {
            target[propPath] = data;
        }
    }
    #lastHref;
    async do() {
        try {
            const href = this.href;
            if (href === null)
                return;
            if (href === this.#lastHref)
                return;
            if (!this.validateOn()) {
                console.error('on* required');
                return;
            }
            const target = this.target;
            if (target !== null && target.ariaLive === null)
                target.ariaLive = 'polite';
            this.#lastHref = href;
            //TODO only cache if get request
            let data = cache.get(this.localName)?.get(href);
            const as = this.as;
            if (data === undefined) {
                if (target !== null) {
                    target.ariaBusy = 'true';
                }
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
                // this.dispatchEvent(new CustomEvent('fetch-complete', {
                //     detail: data,
                // }));
                const loadEvent = new LoadEvent(data);
                this.dispatchEvent(loadEvent);
                data = loadEvent.data;
                if (!cache.has(this.localName)) {
                    cache.set(this.localName, new Map());
                }
                //TODO increment ariaBusy / decrement in case other components are affecting
                if (target !== null)
                    target.ariaBusy = 'false';
            }
            switch (as) {
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(target, data, null);
                    break;
                case 'html':
                    const shadow = this.getAttribute('shadow');
                    if (this.target !== null) {
                        this.hidden = true;
                        await this.setTargetProp(target, data, shadow);
                    }
                    else {
                        const target = this.target || this;
                        let root = this;
                        if (shadow !== null) {
                            if (this.shadowRoot === null)
                                this.attachShadow({ mode: shadow });
                            root = this.shadowRoot;
                        }
                        root.innerHTML = data;
                    }
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
// https://github.com/webcomponents-cg/community-protocols/issues/12#issuecomment-872415080
export class LoadEvent extends Event {
    data;
    static EventName = 'load';
    constructor(data) {
        super(LoadEvent.EventName);
        this.data = data;
    }
}
