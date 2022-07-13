if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}  
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
//imports/requires the catch async file in utils
const ExpressError = require('./utils/ExpressError')
//used to format html forms to indicate we will use edit and delete methods in forms since its not included normally
const methodOverride = require('method-override')
//const { join } = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize')

const userRoutes = require('./routes/users');
//Creates access to routes
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/review');

const session1 = require('express-session');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl)
//mongoose.connect(dbUrl)

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//Method that tells express to look for url encoded post requests
app.use(express.urlencoded({ extended: true }))
//Method that states what we will use to indicate we are using edit or delete methods
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'squirrel'
    }
});


store.on('error', function(e) {
    console.log('Session Stor Error', e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash());
//app.use(helmet({contentSecurityPolicy: false}));

//This secction starts passport, creates a session, and uses the User model.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'carlos@gmail.com', username: 'cmadera' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

//Implements the routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//This is an error handeling function that takes caught errors, and sends the function below in its place
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no Something went wrong'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})