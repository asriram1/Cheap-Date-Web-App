
module.exports = function(app, passport) {

    /* ***********
    HOME PAGE STUFF
    ************** */
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    /* ***********
    SEARCH STUFF
    ************** */

    app.get('/search', function(req, res) {
        res.render('index.ejs');
    });

    app.post('/search', function(req, res) {
        let loc = req.body.location;
        let price= req.body.price;
        var request = require("request");

        app.get('/search-results', function(req, res) {

            var options = {
                method: 'GET',
                url: 'https://api.yelp.com/v3/businesses/search',
                qs: {location: loc},
                headers:
                    {
                        'Postman-Token': '0eb7a9f0-eec2-4883-a045-dc85e3dadf2b',
                        'cache-control': 'no-cache',
                        Authorization: 'Bearer NKmWWE3gjKqwPlldeUusFOCGs50athIC0pLEHEga1U1GuCPbazagXtIkuakgesYfVBc-qfLPQzria8pfGCx5lqypsyMEecb-UuXxMmqOrU_cEcv1kbY97BWhWA-VXHYx'
                    }
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                res.write('Results for: ' + loc + '\n');

                var rest = JSON.parse(body);

                //for loop to print them all
                var i;
                for(i = 0; i < rest.businesses.length; i++){
                    var current = rest.businesses[i];
                    res.write(rest.businesses[i].name.toString() + " \n");
                }

                res.end();
            });

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