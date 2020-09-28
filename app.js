const express = require('express');
const app = express();
const port = 80;
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Create DB connection
var mongoDB = 'mongodb://localhost:27017/yes';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Setting App
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

// Mongoose Schema and Model
const ProductSchema = new mongoose.Schema({
    _id: Number,
    Cat: String,
    PartNum: String,
    Name: String,
    Desc: String,
    Brand: String,
    Packing: String,
    Partial: String,
    OrigUrl: String,
    Image: String,
    DescrP: String,
    Table: String,
    Images: Array
  });
  const Products = mongoose.model('Product', ProductSchema);

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


app.get('/', function (req, res) {
    res.render('index', {title : "Main"});
    console.log(req.query);
  });


app.get('/products', function (req, res) {
  if (req.query.page < 0) {res.status(404).send('Not found')} else {
  var offsetPage = req.query.page * 20;
  Products.find({}, null, {sort: {'date': -1}, limit: 20, skip: offsetPage}, function (err, products) {
    console.log(req.query.page);
    res.render('page-listing-grid', {products : products, page : req.query.page, title : "allproductspage" });
  });}
  });

  app.get('/products/cat/:cat', function (req, res) {
    if (req.params.cat == null || req.query.page < 0) {res.status(404).send('Not found')} else {
    var offsetPage = Number(req.query.page) * 20;
    Products.find({Cat: req.params.cat}, null, {sort: {'date': -1}, limit: 20, skip: offsetPage}, function (err, products) {
      console.log(offsetPage);
      res.render('page-listing-grid-cats', {products : products, page : req.query.page, cat: req.params.cat, title : "catspage"});
    });}
    });
  
    app.get('/products/brand/:brand', function (req, res) {
      if (req.params.brand == null || req.query.page < 0) {res.status(404).send('Not found')} else {
      var offsetPage = Number(req.query.page) * 20;
      Products.find({Brand: {'$regex': req.params.brand,$options:'i'}}, null, {sort: {'date': -1}, limit: 20, skip: offsetPage}, function (err, products) {
        console.log(req.params.brand);
        res.render('page-listing-grid-brands', {products : products, page : req.query.page, brand: req.params.brand, title : "brandspage"});
      });}
      });

  app.get('/products/view/:id', function (req, res) {
    Products.findOne({_id : Number(req.params.id)}, function (err, details) {
      console.log(details);
      res.render('page-detail-product', {details : details, title : "productpage"});
    });      
    });

  app.post('/contact', function (req, res) {
      const output = `
      <p>You have a new contact request from egr.kz</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Telephone: ${req.body.tel}</li>
      </ul>`;
    
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: 'mail20.mymailcheap.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: 'info@electrogroup.kz', // generated ethereal user
              pass: 'Electro@2019'  // generated ethereal password
          },
          tls:{
            rejectUnauthorized:false
          }
        });
    
      let mailOptions = {
        from: 'info@electrogroup.kz', // sender address
        to: 'info@electrogroup.kz', // list of receivers
        subject: 'New mail from website egr.kz', // Subject line
        html: output // html body
      };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
    
        res.render('contact', {msg:'Заявка Отправлена', title:'Заявка в Egr.kz'});
        console.log(req.body);
     })
});
