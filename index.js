var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CheapDate' });
});

module.exports = router;

var request = require('request');

router.post('/new-search', (req, res) => {
  let loc = req.body.loc;
  let start = req.body.start;
  let end = req.body.end;
  let number = req.body.number;
  let food = req.body.food;
  var coord;
  let list_coords = [];
  var list_cinemas;
  var rest;
  var rest_names = [];
  var rest_prices = [];
  var rest_ratings = [];
  var rest_address = [];


  router.get('/search-results', (req, res) => {

    var options = {
      method: 'GET',
      url: 'https://api.yelp.com/v3/businesses/search',
      qs: {term: food, location: loc, categories: 'restaurants,food', price: number},
      headers:
          {
            'Postman-Token': '0eb7a9f0-eec2-4883-a045-dc85e3dadf2b',
            'cache-control': 'no-cache',
            Authorization: 'Bearer NKmWWE3gjKqwPlldeUusFOCGs50athIC0pLEHEga1U1GuCPbazagXtIkuakgesYfVBc-qfLPQzria8pfGCx5lqypsyMEecb-UuXxMmqOrU_cEcv1kbY97BWhWA-VXHYx'
          }
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      res.write('Search Results: ' + ' \n');
      res.write("\n");

      rest = JSON.parse(body);

      var i;
      for (i = 0; i < rest.businesses.length; i++) {
        coord = rest.businesses[i].coordinates.latitude.toString() + "," + rest.businesses[i].coordinates.longitude.toString();
        list_coords.push(coord);
        rest_names.push(rest.businesses[i].name.toString());
        rest_prices.push(rest.businesses[i].price.toString());
        rest_ratings.push(rest.businesses[i].rating.toString());
        rest_address.push(rest.businesses[i].location.display_address[0].toString() + ", " + rest.businesses[i].location.display_address[1].toString());
      }

      console.log(list_coords);

      function call_mov(list_coords) {

      var options = {
        method: 'GET',
        url: 'https://api.internationalshowtimes.com/v4/movies',
        qs:
            {
              time_from: start,
              time_to: end,
              loc: list_coords[0]
            },
        headers:
            {
              'Postman-Token': '8ea82191-c2df-40ef-9024-26a3a6b8d60a',
              'cache-control': 'no-cache',
              'X-API-Key': 'gw2l3BVrsf7CB3t9hMTnG9qeaDYIzpC7'
            }
      };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var movie_list = JSON.parse(body);
        console.log(movie_list);

        res.write("Movies available in your area from " + start + " to " + end + ":\n");
        for (var h = 0; h < movie_list.movies.length && h < 20; h++) {
          if (movie_list.movies[h].title != null) {
            res.write(movie_list.movies[h].title.toString() + "\n");
          }
        }

        res.end();
      });
    }


      let options_list = [];
      let l = 0;

      while (l < list_coords.length) {
        coord = list_coords[l];
        var options = {
          method: 'GET',
          url: 'https://api.internationalshowtimes.com/v4/cinemas',
          qs:
              {
                location: coord,
                distance: '10',
              },
          headers:
              {
                'Postman-Token': '01646ae3-0658-4a31-ac9d-3a746ae22c21',
                'cache-control': 'no-cache',
                'X-API-Key': 'gw2l3BVrsf7CB3t9hMTnG9qeaDYIzpC7'
              }
        };
        options_list.push(options);
        l++;
      }


        function call_cin(options, index) {


        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          console.log("req = " + options.qs.location);
          console.log(index);

          res.write(rest_names[index] + "\n");
          res.write(rest_prices[index] + "\n");
          res.write("Ratings: " + rest_ratings[index] + "\n");
          res.write(rest_address[index] + "\n");

          list_cinemas = JSON.parse(body);

          /*cin_id = list_cinemas.cinemas[0].id.toString();*/
          if (list_cinemas.cinemas.length === 0){
            res.write("There are no theaters nearby; Just watch Netflix!\n");
          } else {
            res.write('Nearest theater is ' + list_cinemas.cinemas[0].name.toString() + "\n");
            if (list_cinemas.cinemas[0].website != null) {
              res.write(list_cinemas.cinemas[0].website.toString() + "\n");
            }
          }
          res.write("\n");
        });
      }

      let f = 0;
      while (f < list_coords.length) {
        /*call_cin(options_list[f]);*/
        setTimeout(call_cin, 1000*f, options_list[f], f);
        f++;
      }
      setTimeout(call_mov, 30000, list_coords);

    });
  });

  res.redirect('/search-results');
});
