var configAuth = require('./config/auth');
var request = require('request');

module.exports = function(app, passport) {
    var resultList = {arr : []};
    var cinName;
    var currentRest;

    function blah(options1) {
        request(options1, function(error1, response1, body1) {
            var rest2 = JSON.parse(body1);
            currentRest = rest2.cinemas[0].name;
        });

    }

    /* ***********
    HOME PAGE STUFF
    ************** */
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    /* ***********
    SEARCH STUFF
    ************** */

    app.post('/results', function(req, res) {

        let loc = req.body.loc;
        let start = req.body.start;
        let end = req.body.end;
        let number = req.body.number;
        let food = req.body.food;

        var options = {
            method: 'GET',
            url: 'https://api.yelp.com/v3/businesses/search',
            qs: {term: food, location: loc, categories: 'restaurants,food', price: number},
            headers:
                {
                    'Postman-Token': '0eb7a9f0-eec2-4883-a045-dc85e3dadf2b',
                    'cache-control': 'no-cache',
                    Authorization: configAuth.YelpAuth
                }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            var i;
            var rest = JSON.parse(body);

            for (i = 0; i < rest.businesses.length; i++) {
                var newResult = {
                    coord: rest.businesses[i].coordinates.latitude.toString() + "," + rest.businesses[i].coordinates.longitude.toString(),
                    restName: rest.businesses[i].name.toString(),
                    restPrice: rest.businesses[i].price.toString(),
                    cinema: ''
                };
                 resultList.arr.push(newResult);
            }

            var x;
            for (x=0; x < resultList.arr.length; x++) {
                var options1 = {
                    method: 'GET',
                    url: 'https://api.internationalshowtimes.com/v4/cinemas',
                    qs:
                        {
                            location: resultList.arr[x].coord,
                            distance: '1000'
                        },
                    headers:
                        {
                            'Postman-Token': '01646ae3-0658-4a31-ac9d-3a746ae22c21',
                            'cache-control': 'no-cache',
                            'X-API-Key': configAuth.XAuth
                        }
                };

                blah(options1);
                resultList.arr[x].cinema = currentRest;
                console.log(resultList.arr[x].cinema);
            }

            //res.render('search.html', {location: coord, bus: selectBusinesses});
            res.render('results.pug', resultList);
        });

    });


    /* ***********
    LOGIN STUFF
    ************** */


    app.get('/login', function(req, res) {

        // render page, and if some flash message is needed, display it
        res.render('login.ejs', { message: req.flash('loginMessage')});
    });

    // process FORM
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    /* ***********
    SIGNUP STUFF
    ************** */


    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // use route middleware to verify this isLoggedIn
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    /* ***********
    LOGOUT STUFF
    ************** */
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    /* ***********
    GOOGLE STUFF
    ************** */
    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    //after google auths the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));

};

/* ***********
MIDDLEWARE STUFF
************** */
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}