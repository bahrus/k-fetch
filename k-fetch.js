export class KFetch extends HTMLElement {
    attributeChangedCallback() {
        this.do();
    }
    connectedCallback() {
        this.do();
    }
    async do() {
        const href = this.getAttribute('href');
        if (href === this._lastHref)
            return;
        const as = this.getAttribute('as');
        if (as === null || href === null)
            return;
        const target = this.getAttribute('target');
        this._lastHref = href;
        const resp = await fetch(href);
        switch (as) {
            case 'json':
                this.style.display = 'none';
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
}
KFetch.observedAttributes = ['href', 'as', 'shadow', 'target'];
customElements.define('k-fetch', KFetch);
