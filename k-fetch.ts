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
    get accept(){
        if(this.hasAttribute('accept')) return this.getAttribute('accept');
        const as = this.as;
        let defaultVal = 'application/json';
        switch(as){
            case 'html':
                defaultVal = 'text/html';
        }
        return defaultVal;
    }
    get method(){
        return this.getAttribute('method') || 'GET';
    }
    body: undefined;
    get init(){
        return {
            method: this.method,
            headers: {
                'Accept': this.accept,
            },
            credentials: this.credentials,
            body: typeof this.body === 'object' ? JSON.stringify(this.body) : this.body,
        } as RequestInit;
    }
    get credentials(): RequestCredentials{
        return (this.getAttribute('credentials') as RequestCredentials) || 'omit';
    }
    get target(){
        const targetSelector = this.getAttribute('target');
        if(targetSelector === null) return null;
        return (this.getRootNode() as DocumentFragment).querySelector(targetSelector);
    }
    onerr(e: any){
        const err = this.onerror;
        if(typeof err === 'function'){
            err(e);
        }
    }
    validateResp(resp: Response){
        return true;
    }
    #lastHref: string | undefined;
    async do(){
        try{
            const href = this.href;
            if(href===null) return;
            if(href === this.#lastHref) return;
            if(this.onerror !== null) {
                console.error('onerror required');
                return;
            }
            
            const target = this.getAttribute('target');
            this.#lastHref = href!;
            //TODO only cache if get request
            let data: any = cache.get(this.localName)?.get(href);
            const as = this.as;
            if(data === undefined){
                const resp = await fetch(href!, this.init);
                if(!this.validateResp(resp)) {
                    this.onerr(resp);
                    return;
                };
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
                    const shadow = this.getAttribute('shadow') as ShadowRootMode;
                    if(shadow !== null){
                        if(this.shadowRoot === null) this.attachShadow({mode: shadow});
                        root = this.shadowRoot!;
                    }
                    root.innerHTML = data;
                    break;
            }
        }catch(e){
            this.onerr(e);
        }

    }
    value: any;
}
customElements.define('k-fetch', KFetch);