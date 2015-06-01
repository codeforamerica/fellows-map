var map, fellowsData, markers;
var fellowsNameArray = [];

/*
**
** INITIALIZE
** Initializes the map, tiles, and Tabletop, and event listeners
**
*/
function init() {

  console.log('waka');
  //initialize the map
  map = L.map('map').setView([34.30714385628804, -112.0166015625], 4);
  
  fellowsData = {
    "type": "FeatureCollection",
    "features": []
  };

  L.tileLayer('https://{s}.tiles.mapbox.com/v4/codeforamerica.map-hhckoiuj/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY29kZWZvcmFtZXJpY2EiLCJhIjoiSTZlTTZTcyJ9.3aSlHLNzvsTwK-CYfZsG_Q').addTo(map);

  Tabletop.init({
    key: '1yFx14zL13sz1UXOhY8MVZSzWWG-tvEdcFVe2CaEs-sQ',
    callback: makeMap,
    simpleSheet: true
  });

  addEventListeners();
  function addEventListeners() {
    // set filter click event listener
    $('.filter').on('click', function(){
      filter($(this).attr('id'));
    });

    // set search event listener
    $("#search").bind("keypress", {}, search);
  }
}

/*
**
** RESET
** Used globally to reset UI when needed.
**
*/
var reset = {
  
  // resets filters to 'all' state
  filters: function() {
    filter('all');
  },

  // resets map view, preserves current filter
  view: function() {
    map.fitBounds(markers.getBounds())
  },

  // resets filters then updates map view to bounds
  all: function() {
    this.filters();
    this.view();
  }
}

/*
**
** MAKE MAP
** Callback from Tabletop after it has loaded data from spreadsheets.
** This function prepares all map data, adds it to the map, and initializes
** the search functionality (since it depends on the map data).
**
*/
function makeMap(data, tabletop) {

  console.log(data, tabletop);

  // convert json to geojson spec and 
  // add as a feature to the fellowsData object
  for (var i = 0; i < data.length; i++) {
    (function(row) {
      if (row.Lat) {
        var f = makeGeoJsonFeature(row);
        fellowsData.features.push(f);
      }
    })(data[i]);
  }

  // add a new geojson object to the map from
  // the fellowsData object
  geoJson = L.geoJson(fellowsData, {
    onEachFeature: preparePopups,
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'fellow-marker cf',
          html: '<span class="fellow-marker-name">'+feature.properties.Name+'<i class="fa fa-chevron-right pull-right"></i></span>',
          iconAnchor: L.point(0,20)
        })
      }).on('click', markerClick);
    }
  });

  // create popups for each feature
  function preparePopups (feature, layer) {

    var info = feature.properties;

    // push to array for typeahead usage
    fellowsNameArray.push(info.Name);

    var popupContent = "";
    popupContent += "<div class='popup-image'><img src='http://www.codeforamerica.org/media/images/people/" + info.image + "'></div>";
    popupContent += "<p class='popup-city'><strong>" + info["fellowship_city"] + "</strong>, " + info["fellowship_year"] + "</p>";
    popupContent += "<p class='popup-skill'>" + info.Skill + "</p>";
    popupContent += "<div class='social-links'><a target='_blank' class='social' href='" + info.linkedin + "'><i class='fa fa-linkedin-square'></i></a>&nbsp;&nbsp;<a target='_blank' class='social' href='" + info.twitter + "'><i class='fa fa-twitter-square'></i></a></div>";
    popupContent += "<div class='popup-seal'><a href='" + info.city_page +"'> <img src='http://www.codeforamerica.org/media/images/governments/" + info.seal + "'></a> </div>";
    
    if (info && info.Name) {
      layer.bindPopup(popupContent, {
        offset: L.point(310,280),
        autoPanPadding: L.point(100, 80)
      });
    }
  }

  // marker click callback from .on('click') above
  function markerClick(e) {
    var mrks = document.getElementsByClassName('fellow-marker');
    for (var m = 0; m < mrks.length; m++) {
      mrks[m].className = mrks[m].className.replace('active', '');
    }
    this._icon.className += ' active';
  }

  /*
  **
  ** MARKER CLUSTER PREP
  ** Initialize the markers with markerClusterGroup to be used below
  **
  */
  markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      return new L.DivIcon({
        className: 'cluster-wrapper',
        html: "<div class='cluster'><div class='cluster-outer'><div class='cluster-inner'>"+cluster.getChildCount()+"</div></div></div>",
        iconAnchor: L.point(22,22)
      })
    },
    showCoverageOnHover: false,
    spiderfyLinear: true, // custom implementation of cluster
    spiderfyLinearDistance: 50, // custom implementation of cluster
    spiderfyLinearSeparation: 50, // custom implementation of cluster
  });

  // add the geojson object to the markers group
  markers.addLayer(geoJson);

  // add the markers to the map now that they are clustered
  map.addLayer(markers);

  // fit the map to the bounds of the markers
  map.fitBounds(markers.getBounds());

  // prepare typeahead search object
  prepareSearch();
}

/*
**
** SEARCH: prepare
** Uses Typeahead.js and names from the GeoJSON file.
** Currently binds event listener based on 'enter' keypress
**
*/
function prepareSearch() {
  var fellowSearch = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
    local: fellowsNameArray
  });

  $('#search').typeahead({
    highlight: true,
    minLength: 1
  },
  {
    name: 'fellow-names',
    source: fellowSearch
  });
}

function search(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code == 13) {                   
    e.preventDefault();
    var value = document.getElementById('search').value;
    getSearchData(value);
  } else {
    console.log('That name does not match anything in our records!');
  }
};

/*
**
** SEARCH: run search
** Used globally to reset UI when needed.
**
*/
function getSearchData(name) {
  // reset filters
  // https://github.com/codeforamerica/fellows-map/issues/34
  reset.filters();

  // run through each marker and match search with names
  markers.eachLayer(function (layer) {
    if (name == layer.feature.properties.Name) {
      markers.zoomToShowLayer(layer, function() {
        layer._icon.className += ' active';
        layer.openPopup();
      });
    }
  });
}

/*
**
** FILTER
** Updates buttons
** Passes filter id to filter the map markers
**
*/
function filter( id ) {
  $('.filter').removeClass('current');
  $('#'+id).addClass('current');
  filterMap(id);
}

/*
**
** FILTER: map
** Loops through all layers and adds them to 'layersToRemove'
** to prepare for removal and use for future filter actions
**
*/
var layersToRemove = [];
function filterMap(id) {
  // update map before filtering
  markers.addLayers(layersToRemove);

  // reset for next filter
  layersToRemove = [];

  if (id != 'all') {
    // check each layer, if it matches the id, push into array
    markers.eachLayer(function(layer) {
      if (id != layer.feature.properties.fellowship_year) {
        layer.closePopup();
        layersToRemove.push(layer);
      }
    });

    // fit bounds of markers to un spiderfy them
    markers.getParent

    // use array to remove layers
    // https://github.com/Leaflet/Leaflet.markercluster#bulk-adding-and-removing-markers
    markers.removeLayers(layersToRemove);
  }

  map.fitBounds(markers.getBounds());
}


/*
**
** GEOJSON FEATURE CREATION
** Returns data from tabletop to fit the geojson spec
** geojson.org
**
*/
function makeGeoJsonFeature(feature) {

  var newFeature = {
    "type": "Feature",
    "properties": {
      "image": feature.image,
      "fellowship_city": feature['Fellowship City'],
      "State": feature.State,
      "first_name": feature['First Name'],
      "Last Name": feature['Last Name'],
      "Name": feature['Name'],
      "Skill": feature.Skill,
      "linkedin": feature.LinkedIn,
      "twitter": feature.Twitter,
      "fellowship_year": feature['Fellowship Year'],
      "seal": feature.Seal,
      "city_page": feature['City Page']
    },
    "geometry": {
      "type": "Point",
      "coordinates": [
        feature.Lng,
        feature.Lat
      ]
    }
  };

  return newFeature;
}

window.onload = init();