const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')



const app = express();


//connect to mongoose
mongoose.connect('mongodb://localhost/prospect-dev', {
  useMongoClient: true
})
.then(() => console.log('MongoDB Connected!!!!'))
.catch(err => console.log(err));

// load model
require('./models/Idea');
const Idea = mongoose.model('ideas');

//handlebars middleware 

app.engine('handlebars', exphbs({
  defaultLayout: 'main'}));
app.set('view engine', 'handlebars')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//method overide
app.use(methodOverride('_method'))





  //INDEX route
app.get('/',  (req, res) =>{
  res.render('index');
});

app.get('/about',  (req, res) =>{
  res.render('about')
});

//idea index page
app.get('/ideas',  (req, res) =>{
  Idea.find({})
   .sort({date:'desc'})
   .then(ideas => {
      res.render('ideas/index', {
        ideas:ideas
      });
   });
  
});


//add idea form
app.get('/ideas/add',  (req, res) =>{
  res.render('ideas/add')
});
// edit idea form
app.get('/ideas/edit/:id',  (req, res) =>{
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit', {
      idea:idea
    });
  });
});


// process formS

app.post('/ideas',  (req, res) =>{
  let errors = [];

   if(!req.body.title){
     errors.push({text: 'Please add a Title!'})
   }
   if(!req.body.number){
    errors.push({text: 'Please add a Contact number!'})
  }
  if(!req.body.company){
    errors.push({text: 'Please add a Company or business name associated with this contact, in none just type N/A!'})
  }
   if(!req.body.details){
    errors.push({text: 'Please add some Details!'})
   }
   if(errors.length > 0){
     res.render('ideas/add', {
       errors: errors,
       title: req.body.title,
       number: req.body.number,
       company: req.body.company,
       details: req.body.details
     });
   } else {
     const newUser = {
       title: req.body.title,
       number: req.body.number,
       company: req.body.company,
       details: req.body.details
     }
     new Idea(newUser)
     .save()
     .then(idea => {
       res.redirect('/ideas');
     })
   }
});

//edit form process
app.put('/ideas/:id', (req, res) =>{
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    idea.title = req.body.title;
    idea.number = req.body.number;
    idea.company = req.body.company;
    idea.details = req.body.details;

    idea.save()
    .then(idea => {
      res.redirect('/ideas');
    })
  });
});

//delet idea
app.delete('/ideas/:id', (req, res) =>{
  Idea.remove({_id: req.params.id})
  .then(() => {
    res.redirect('/ideas');
  });
});



const port = 5000;

app.listen(port, () =>{
  console.log(`Server started on ${port}`);
});