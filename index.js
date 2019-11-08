const https = require('https');
const allProducts = []

function bruteForce(base_url, page, isLast, minimum_percentage_off) {
    https.get(base_url+'?page=' + page, (res) => {
  const buffer = [];  
  res.on('data', (chunk) => {
    buffer.push(chunk.toString());
  });
  res.on('end', () => {
    //   buffer.join('').split('sku -gallery')
    const block = buffer.join('').split('sTrackingStore.data =');
    const jsons = block[1].split('jsTrackingStore.merge=fu')[0];
    let BigData = [];
    try{
        BigData = JSON.parse(jsons.split(';')[0]).products;
    } catch {
    }
    const productKeys = Object.keys(BigData);
    productKeys.forEach((e,i) => {
        allProducts.push(new Product(BigData[e]).toString())
    })
    if(isLast) {
        const definedProducts = new ProductProcessor(allProducts, minimum_percentage_off).toString();
        console.log(definedProducts)
    }
  })

}).on('error', (e) => {
  console.error(e);
});
}

class Product {
    constructor(data){
        this.data = data;
    }
    toString() {
        const priceLocal = this.data.priceLocal;
        const oldPriceLocal = this.data.hasOwnProperty('oldPriceLocal') ? this.data.oldPriceLocal: priceLocal;
        const percentageOff = ((oldPriceLocal - priceLocal)/oldPriceLocal)*100;
        return {
            'name': this.data.name,
            'priceLocal': this.data.priceLocal,
            'oldPriceLocal': oldPriceLocal,
            'percentageOff': percentageOff
        }
    }
}
class ProductProcessor {
    constructor(data, minimum_percentage_off) {
        this.data = data;
        this.minimum_percentage_off = minimum_percentage_off;
    }
    toString() {
        this.data.sort((a, b) => {
            if(a.percentageOff > b.percentageOff) {
                return -1;
            }
            if (a.percentageOff < b.percentageOff) {
                return 1;
            }
            return 0;

        })
        return this.data.filter((e,i)=> e.percentageOff > this.minimum_percentage_off);
    }
}

const last_page = 25;
const base_url = 'https://www.jumia.com.ng/ios-phones/';
const minimum_percentage_off = 60;


for(let i = 1; i <= last_page; i++){
    bruteForce(base_url, i, i === last_page, minimum_percentage_off);
}

