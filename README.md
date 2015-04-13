# Fellows Map

Since 2011 the Code for America fellowship program has seen over 100 individuals pass through through its doors. Despite our best efforts to memorize everyone's names and LinkedIn accounts, it's hard to keep us all straight. This is a coordinated effort to gather all fellows, past and current, into one final, incredibly up-to-date, perfectly aligned, and beautifully designed map.

**This project is a work-in-progress** currently being spearheaded by the adroit [@beccablazak](https://github.com/beccablazak). :facepunch: 

### How?

As a database, we're using a Google Spreadsheet and [Tabletop.js](https://github.com/jsoma/tabletop) to bring in information and keep it as up-to-date as possible. Tabletop gracefully pulls information from the sheet and delivers it as a nicely formatted JSON object, where we convert it into a [GeoJSON](http://geojson.io/), which is consumed by [Leaflet](http://leafletjs.com/), our mapping library.

We are also using a custom build of the [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) plugin. *Don't replace the `cluster.js` file otherwise some of this will break!* Here's [the issue](https://github.com/Leaflet/Leaflet.markercluster/issues/467) in that repository that started the custom work.

### Contribute!

If you're wanting to help out you can clone or fork this repository with `git clone git@github.com:codeforamerica/fellows-map.git`. The project is best served with the Python server by running `python -m SimpleHTTPServer`, which will make the map available at `localhost:8000` in your browser.

Feel free to [drop issues](https://github.com/codeforamerica/fellows-map/issues) and we'll do our best to make updates asap.

