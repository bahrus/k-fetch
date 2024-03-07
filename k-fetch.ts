const cache: Map<string, Map<string, any>> = new Map();

export class KFetch extends HTMLElement{
    static observedAttributes = ['href', 'as', 'shadow', 'target'];
    attributeChangedCallback(){
        this.do();
    }
    connectedCallback(){
        this.do();
    }
    get href(){
        return this.getAttribute('href');
    }
    get as(){
        return this.getAttribute('as') || 'json';
    }
    get init(){
        return undefined
    }
    validateResp(resp: Response){
        return true;
    }
    #lastHref: string | undefined;
    async do(){
        const href = this.href;
        if(href===null) return;
        if(href === this.#lastHref) return;
        
        
        const target = this.getAttribute('target');
        this.#lastHref = href!;
        //TODO only cache if get request
        let data: any = cache.get(this.localName)?.get(href);
        const as = this.as;
        if(data === undefined){
            const resp = await fetch(href!, this.init);
            if(!this.validateResp(resp)) return;
            //TODO - validate
            switch(as){
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
            if(!cache.has(this.localName)){
                cache.set(this.localName, new Map());
            }
        }
        
        switch(as){
            case 'text':
            case 'json':
                this.setAttribute('hidden', '');
                this.value = data;
                this.dispatchEvent(new Event('change'));
                break;
            case 'html':
                //TODO: Sanitize unless onload is set
                let root : Element | ShadowRoot = target == null ? this : (this.getRootNode() as DocumentFragment).querySelector(target)!;
                if(this.hasAttribute('shadow')){
                    if(this.shadowRoot === null) this.attachShadow({mode: 'open'});
                    root = this.shadowRoot!;
                }
                root.innerHTML = data;
                break;
        }
    }
    value: any;
}
customElements.define('k-fetch', KFetch);