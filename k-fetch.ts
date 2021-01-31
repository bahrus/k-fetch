export class KFetch extends HTMLElement{
    static observedAttributes = ['href', 'as'];
    attributeChangedCallback(){
        this.do();
    }
    connectedCallback(){
        this.do();
    }
    do(){
        const href = this.getAttribute('href');
        const as = this.getAttribute('as');
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
                        this.innerHTML = html;
                    })
            }
        })
    }
    value = null;
}
customElements.define('k-fetch', KFetch);