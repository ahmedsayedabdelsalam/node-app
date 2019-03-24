const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product
    .findAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  productId = req.params.productId;
  // Product.findAll({where: {id: productId}})
  //   .then(products => {
  //     res.render('shop/product-detail', {
  //       product: products[0],
  //       pageTitle: products[0].title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
  Product.findByPk(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product
    .findAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
  // Cart.getCart(cart => {
  //   Product.fetchAll(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(prod => prod.id === product.id);
  //       if (cartProductData) {
  //         cartProducts.push({productData: product, qty: cartProductData.qty});
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   })

  // });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId
  let fetchedCart
  let newQuantitiy = 1;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
      let product;
      if(products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantitiy = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(productId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {through: {quantity: newQuantitiy}});
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
  // Product.findById(productId, product => {
  //   Cart.addProduct(product.id, product.price)
  // })
  // res.redirect('/cart')
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
  // Product.findById(productId, product => {
  //   Cart.deleteProduct(productId, product.price);
  //   res.redirect('/cart')
  // });
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            product.orderItem = {quantity: product.cartItem.quantity};
            return product;
          }))
        })
        .catch(err => console.log(err));
      console.log(products);
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({include: [Product]})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
  
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
