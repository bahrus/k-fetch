export class KFetch extends HTMLElement {
    static observedAttributes = ['href', 'as', 'shadow', 'target'];
    attributeChangedCallback() {
        this.do();
    }
    connectedCallback() {
        this.do();
    }
    #lastHref;
    async do() {
        const href = this.getAttribute('href');
        if (href === this.#lastHref)
            return;
        const as = this.getAttribute('as') || 'json';
        if (as === null || href === null)
            return;
        const target = this.getAttribute('target');
        this.#lastHref = href;
        const resp = await fetch(href);
        switch (as) {
            case 'json':
                this.setAttribute('hidden', '');
                resp.json().then(data => {
                    this.value = data;
                    this.dispatchEvent(new CustomEvent('fetch-complete', {
                        detail: data,
                    }));
                });
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
            case 'text':
                this.style.display = 'none';
                resp.text().then(text => {
                    this.value = text;
                    this.dispatchEvent(new CustomEvent('fetch-complete', {
                        detail: text,
                    }));
                });
        }
    }
    value;
}
customElements.define('k-fetch', KFetch);
