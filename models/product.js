const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

const postProductsToFile = (products, cb) => {
  fs.writeFile(p, JSON.stringify(products), err => {
    console.log(err);
    if (!err && cb) {
      cb()
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(product => product.id === this.id);
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        postProductsToFile(updatedProducts)
      } else {
        this.id = Math.random().toString();
        products.push(this);
        postProductsToFile(products)
      }
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      cb(product)
    })
  }

  static deleteById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      const updatedProducts = products.filter(product => product.id !== id);
      postProductsToFile(updatedProducts, () => {
        Cart.deleteProduct(id, product.price);
      });
      cb()
    })
  }
};
