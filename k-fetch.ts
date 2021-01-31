export class KFetch extends HTMLElement{
    static observedAttributes = ['href', 'as', 'shadow'];
    attributeChangedCallback(){
        this.do();
    }
    connectedCallback(){
        this.do();
    }
    _lastHref: string | undefined;
    do(){
        const href = this.getAttribute('href');
        if(href === this._lastHref) return;
        this._lastHref = href!;
        const as = this.getAttribute('as');
        if(as===null) return;
        fetch(href!).then(resp => {
            switch(as){
                case 'json':
                    this.style.display = 'none';
                    resp.json().then(data => {
                        this.value = data;
                        this.dispatchEvent(new CustomEvent('fetch-complete', {
                            detail: data,
                        }))
                    });
                case 'html':
                    resp.text().then(html => {
                        let root : HTMLElement | ShadowRoot = this;
                        if(this.hasAttribute('shadow')){
                            if(this.shadowRoot === null) this.attachShadow({mode: 'open'});
                            root = this.shadowRoot!;
                        }
                        root.innerHTML = html;
                    })
            }
        })
    }
    value = null;
}
customElements.define('k-fetch', KFetch);