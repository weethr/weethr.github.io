# 4xxi_weather
Simple weather app for 4xxi

## Building
For production:
```bash
$ npm update
$ gulp
```

For debugging:
```bash
$ npm update
$ gulp debug
```

## Running
To run this app, you need to run server-side code:
```bash
$ node server.js --staticDir=<static dir name> --owmApiKey=<openweathermap api key> --googleApiKey=<google places api key>
```
Agruments:
* `--staticDir` - name of folder with builded static front-end files. Use `public` for production and `debug` for debugging
* `--owmApiKey` - private API key, used my [openweathermap.org](http://openweathermap.org/api) for access to their API
* `--googleApiKey` - private API key for [Google Places API](https://developers.google.com/places/) (this API used to implement autocomplete for city names)

