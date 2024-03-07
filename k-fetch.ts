export class KFetch extends HTMLElement{
    static observedAttributes = ['href', 'as', 'shadow', 'target'];
    attributeChangedCallback(){
        this.do();
    }
    connectedCallback(){
        this.do();
    }
    #lastHref: string | undefined;
    async do(){
        const href = this.getAttribute('href');
        if(href === this.#lastHref) return;
        const as = this.getAttribute('as') || 'json';
        if(as===null || href===null) return;
        const target = this.getAttribute('target');
        this.#lastHref = href!;
        const resp = await fetch(href!);
        switch(as){
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
                //TODO: Sanitize unless onload is set
                resp.text().then(html => {
                    let root : Element | ShadowRoot = target == null ? this : (this.getRootNode() as DocumentFragment).querySelector(target)!;
                    if(this.hasAttribute('shadow')){
                        if(this.shadowRoot === null) this.attachShadow({mode: 'open'});
                        root = this.shadowRoot!;
                    }
                    root.innerHTML = html;
                });
                break;
        }
    }
    value: any;
}
customElements.define('k-fetch', KFetch);