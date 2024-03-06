var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _KFetch_lastHref;
export class KFetch extends HTMLElement {
    constructor() {
        super(...arguments);
        _KFetch_lastHref.set(this, void 0);
    }
    attributeChangedCallback() {
        this.do();
    }
    connectedCallback() {
        this.do();
    }
    async do() {
        const href = this.getAttribute('href');
        if (href === __classPrivateFieldGet(this, _KFetch_lastHref, "f"))
            return;
        const as = this.getAttribute('as') || 'json';
        if (as === null || href === null)
            return;
        const target = this.getAttribute('target');
        __classPrivateFieldSet(this, _KFetch_lastHref, href, "f");
        const resp = await fetch(href);
        switch (as) {
            case 'text':
            case 'json':
                this.setAttribute('hidden', '');
                const data = await resp[as]();
                this.value = data;
                this.dispatchEvent(new CustomEvent('fetch-complete', {
                    detail: data,
                }));
                this.dispatchEvent(new Event('change'));
                break;
            case 'html':
                resp.text().then(html => {
                    let root = target == null ? this : this.getRootNode().querySelector(target);
                    if (this.hasAttribute('shadow')) {
                        if (this.shadowRoot === null)
                            this.attachShadow({ mode: 'open' });
                        root = this.shadowRoot;
                    }
                    root.innerHTML = html;
                });
                break;
        }
    }
}
_KFetch_lastHref = new WeakMap();
KFetch.observedAttributes = ['href', 'as', 'shadow', 'target'];
customElements.define('k-fetch', KFetch);
