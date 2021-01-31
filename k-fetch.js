export class KFetch extends HTMLElement {
    constructor() {
        super(...arguments);
        this.value = null;
    }
    attributeChangedCallback() {
        this.do();
    }
    connectedCallback() {
        this.do();
    }
    do() {
        const href = this.getAttribute('href');
        if (href === this._lastHref)
            return;
        this._lastHref = href;
        const as = this.getAttribute('as');
        if (as === null)
            return;
        fetch(href).then(resp => {
            switch (as) {
                case 'json':
                    this.style.display = 'none';
                    resp.json().then(data => {
                        this.value = data;
                        this.dispatchEvent(new CustomEvent('fetch-complete', {
                            detail: data,
                        }));
                    });
                case 'html':
                    resp.text().then(html => {
                        let root = this;
                        if (this.hasAttribute('shadow')) {
                            if (this.shadowRoot === null)
                                this.attachShadow({ mode: 'open' });
                            root = this.shadowRoot;
                        }
                        root.innerHTML = html;
                    });
            }
        });
    }
}
KFetch.observedAttributes = ['href', 'as', 'shadow'];
customElements.define('k-fetch', KFetch);
