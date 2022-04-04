var express = require('express');
var router = express.Router();
const stripe = require('stripe')('sk_test_51KjjNEJzWy4Ilo0k4954ZtMSF1EC3CVesI1lwysu5rZtNXxF6QfpP6fO4qwnsEFa9s4EOETilTT6Mj5aNPdAV5wq00CLY7lYP8');


var dataBike = [
  {name:"BIKO45", url:"/images/bikeshop-assets/bike-1.jpg", price:679},
  {name:"ZOOK47", url:"/images/bikeshop-assets/bike-2.jpg", price:799},
  {name:"LIKO89", url:"/images/bikeshop-assets/bike-3.jpg", price:839},
  {name:"GEW08", url:"/images/bikeshop-assets/bike-4.jpg", price:1249},
  {name:"KIW1T", url:"/images/bikeshop-assets/bike-5.jpg", price:899},
  {name:"NAZAY", url:"/images/bikeshop-assets/bike-6.jpg", price:1399},
]

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('variable de session avant initialisation :'+req.session.dataCardBike)
  res.render('index', {dataBike:dataBike});
});

router.get('/shop', function(req, res, next) {

  if(req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];

  };
  var alreadyExist = false;

  for(var i = 0; i < req.session.dataCardBike.length; i++) {
    if(req.session.dataCardBike[i].name == req.query.bikeNameFromFront) {
      req.session.dataCardBike[i].quantity = Number(req.session.dataCardBike[i].quantity) + 1;
      alreadyExist = true;
    }
  };

  if(alreadyExist == false) {
    req.session.dataCardBike.push({
    name: req.query.bikeNameFromFront,
    url: req.query.bikeImageFromFront,
    price: req.query.bikePriceFromFront,
    quantity: 1
    });
  };

  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.position,1)
  res.render('shop',{dataCardBike:req.session.dataCardBike});
})

router.post('/update-shop', function(req, res, next) {
  var position = req.body.position;
  var newQuantity = req.body.quantity;
  req.session.dataCardBike[position].quantity = newQuantity;

  res.render('shop',{dataCardBike:req.session.dataCardBike});
})

router.post('/create-checkout-session', async (req, res) => {
  if(req.session.dataCardBike == undefined) {
    req.session.dataCardBike = [];
  }

  var stripeItems = [];
  const YOUR_DOMAIN = 'http://localhost:3000';

  for(var i = 0; i < req.session.dataCardBike.length; i++) {
    stripeItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name
        },
        unit_amount: req.session.dataCardBike[i].price * 100,
      },
      quantity: req.session.dataCardBike[i].quantity
    })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: stripeItems,
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  res.redirect(303, session.url);
});

router.get('/success', function (req, res, next) {
  res.render('success')
})

router.get('/cancel', function (req, res, next) {
  res.render('cancel')
})

module.exports = router;
