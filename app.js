var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bcryptjs = require("bcryptjs");
const Pusher = require("pusher");
// require("dotenv").config(); //bring in the dotenv package.
const { authConfig, databaseConfig, mailConfig, pusherConfig } = require("./engine/config");
var logger = require('morgan');
const nodemailer = require("nodemailer");
const mongodb = require("mongodb");
const session = require("express-session"); 
const mongodbSession = require("connect-mongodb-session")(session);


//create the mongodb client
const MongoClient = mongodb.MongoClient;

 //const client = new MongoClient(process.env.DB_URL)
const client = new MongoClient(databaseConfig.uri)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const registerRouter = require("./routes/register")
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const userRouter = require("./routes/user");

var app = express();

const mongodbSessionStore = new mongodbSession({
  uri: databaseConfig.uri,
  databaseName: "broomsticks-sessions",
  collection: "broomsticks-sessions"
})

const pusher = new Pusher({
  appId: pusherConfig.pusher_app_id,
  key: pusherConfig.pusher_key,
  secret: pusherConfig.pusher_secret,
  cluster: pusherConfig.pusher_cluster,
  useTLS: pusherConfig.pusher_use_tls
});


//bring in the session
app.use(session({
  secret: authConfig.secret,
  resave: false,
  saveUninitialized: false,
  store: mongodbSessionStore

}))



app.use(express.json());



//Email Setup
var transporter = nodemailer.createTransport({
  service: mailConfig.service,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password
  }
});

//functions
const internally_check_user_exists = async (email, password) => {

  console.log("Checking Password: ", password);

  const feedback = await client.db(databaseConfig.dbname).collection("users").findOne({ "email": email });

  if(feedback){
    //compare with the email address
    const isMatchedPassword = await bcryptjs.compare(password, feedback.password);

    if(isMatchedPassword){
      return {
        message: "user is valid",
        code: "valid-user",
        data: { email: feedback.email , firstname: feedback.firstname, lastname: feedback.lastname }
      }

    }else{
      return{
        message: "user is invalid",
        code: "invalid-user",
        data: null
  
      }
    }



  }else{
    return{
      message: "user is invalid",
      code: "invalid-user",
      data: null

    }
  }


}
//Endpoints
app.post("/logout", function(req, res){
  //logout the user 
  req.session.destroy(function(error){
    if(error) throw error;

    res.redirect("/login");

  })


})

app.post("/create-new-post", function(request, response){

  // Pusher.logToConsole = true;

  pusher.trigger("simpleapp", "new-post", {
    post_title: request.body.post_title,
    post_content: request.body.post_content,
    post_date: new Date().getTime()
})


  response.send({});
  
})


//Login User
app.post("/login-user", async function(request, response){

  const {email, password } = request.body;


  //check the user again ..,
  const feedback = await internally_check_user_exists(email, password);

  console.log("checks: ", feedback)
  if(feedback){
    if(feedback.code == "valid-user"){
      request.session.loginStatus = {
        "is_user_logged_in": true,
        "email": feedback.data.email,
        "firstname" : feedback.data.firstname,
        "lastname": feedback.data.lastname 
    }

     //redirect
     response.send({
      message: "user logged in successfully",
      code: "authenticated",
      data: {}
    })

  }else{

    response.send({
      message: "invalid email/password combination",
      code: "not-authenticated",
      data: {}
    })


  }

  }

 

 



})



//Register User
app.post("/register-user", async function(request, response){
    const firstname = request.body.firstname
    const lastname = request.body.lastname
    const email = request.body.email
    const password = request.body.password

    //hash the password
    let hashedPassword = await bcryptjs.hash(password, 12);


    const email_link = `http://localhost:3000/verify_account?email=${email}&&key=123`;

    //send email to this user
    const mailOptions =  {
      from: 'ghena.bright@gmail.com',
      to: email,
      subject: `Activate Your Account`,
      html: `<body>
                  <h3>Congratulations.</h3>
                  <hr>
                  Your account has been created. Please verify by clicking the link 
                  below: <br>
                  <a target='_blank' href='${email_link}'>${email_link}</a>
          </body>`
    };

    transporter.sendMail(mailOptions, async function(error, info){
      if (error) {
          console.log(error);
          throw error
        } else {
          console.log('Email sent: ' + info.response);

          //save to database
          const feedback = await client.db("db1").collection("broomsticks").insertOne({
            firstname: firstname,
            lastname: lastname,
            email: email,
            password: hashedPassword,
            key: 123,
            is_user_verified: false

          })
          
          if(feedback){
            //emai sent
            response.send("Email was sent to "+email)
          }
          
  
        
        }
  
  
    })
    
})

//check if this user exists already
app.post("/check-user-details", async function(request, response){

  const email = request.body.email;
  const password = request.body.password;

  const feedback = await client.db(databaseConfig.dbname).collection("broomsticks").findOne({ "email": email });

  if(feedback){
      //this user is a valid user..
      const isPasswordMatched = await bcryptjs.compare(password, feedback.password);
      if(isPasswordMatched){
        response.send({
          message: "user is valid",
          code: "valid-user",
          data: { email: feedback.email , firstname: feedback.firstname, lastname: feedback.lastname }
        })
      }else{
        response.send({
          message: "user is invalid",
          code: "invalid-user",
          data: null
        })
      }

  }else{

    response.send({
      message: "user is invalid",
      code: "invalid-user",
      data: null

    })

  }
  

})


// app.get("/logout", function(req, res){
//   console.log("works")
// })

app.get("/verify_account", async function(request, response){

  //console.log(request.query);
  let email = request.query.email;
  let key = request.query.key;

  //check the database to see if the query data matches
  //check if email exists
  const feedback = await client.db("db1").collection("broomsticks").findOne({'email': email})

  console.log(feedback);

  if(feedback != null){
    //the email exists
    //check the key
    console.log(feedback);

    if(feedback.key == key ){
      
      //check if this user has been verified already..
      const verified = await client.db("db1").collection("broomsticks").findOne({"is_user_verified": true});
      if(verified){
        response.render("account-verified-already-status");
      }else{
          //if not verified
        const updateFeedback = await client.db("db1").collection("broomsticks").updateOne({"email": email}, {$set: {"is_user_verified": true }})

        console.log(updateFeedback);
        if(updateFeedback){
          response.send("account-verified");
      }
      }

    



      
    
    }else{
      response.render("error", {
        message: "Your link is invalid",
        error: {
          stack: "The problem is the key",
          status: 402
        }
      });
    }

    
  }else{
    response.render("error", {
      message: "You link is invalid", 
      error: {
        stack: "The problem is the email",
        status: 402
      }
    });
  }


  

})





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/user", userRouter); //the user's dashboard


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;