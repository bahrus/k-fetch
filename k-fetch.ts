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
    get targetSelector(){
        return this.getAttribute('target');
    }
    get target(){
        const targetSelector = this.targetSelector;
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
    async setTargetProp(target: Element | null, data: any){
        if(target === null) return;
        const targetSelector = this.targetSelector;
        if(targetSelector === null) return;
        const lastPos = targetSelector.lastIndexOf('[');
        if(lastPos === -1) throw 'NI'; //Not implemented
        const rawPath =  targetSelector.substring(lastPos + 2, targetSelector.length - 1);
        const {lispToCamel} = await import('trans-render/lib/lispToCamel.js');
        const propPath = lispToCamel(rawPath);
        (<any>target)[propPath] = data;
    }
    #lastHref: string | undefined;
    async do(){
        try{
            const href = this.href;
            if(href===null) return;
            if(href === this.#lastHref) return;
            if(this.onerror === null) {
                console.error('onerror required');
                return;
            }
            
            const target = this.target;
            if(target !== null && target.ariaLive === null) target.ariaLive = 'polite';
            this.#lastHref = href!;
            //TODO only cache if get request
            let data: any = cache.get(this.localName)?.get(href);
            const as = this.as;
            if(data === undefined){
                if(target !== null){
                    target.ariaBusy = 'true';
                }
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
                //TODO increment ariaBusy / decrement in case other components are affecting
                if(target !== null) target.ariaBusy = 'false';
            }
            
            switch(as){
                case 'text':
                case 'json':
                    this.hidden = true;
                    this.value = data;
                    this.dispatchEvent(new Event('change'));
                    await this.setTargetProp(target, data);
                    break;
                case 'html':
                    if(this.target !== null){
                        this.hidden = true;
                        await this.setTargetProp(target, data);
                    }else{
                        const target = this.target || this;
                        let root : Element | ShadowRoot = target == null ? this : (this.getRootNode() as DocumentFragment).querySelector(target)!;
                        const shadow = this.getAttribute('shadow') as ShadowRootMode;
                        if(shadow !== null){
                            if(this.shadowRoot === null) this.attachShadow({mode: shadow});
                            root = this.shadowRoot!;
                        }
                        root.innerHTML = data;
                    }

                    break;
            }
        }catch(e){
            this.onerr(e);
        }

    }
    value: any;
}
customElements.define('k-fetch', KFetch);