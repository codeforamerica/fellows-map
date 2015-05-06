var map, fellowsData;

function init() {
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
}

function makeMap(data, tabletop) {

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
    onEachFeature: onEachFeature,
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

  // add the geojson object to the markers group
  markers.addLayer(geoJson);

  // add the markers to the map now that they are clustered
  map.addLayer(markers);

  // fit the map to the bounds of the markers
  map.fitBounds(markers.getBounds());
}

function markerClick(e) {

  // remove all 'active' classes from markers
  var mrks = document.getElementsByClassName('fellow-marker');
  for (var m = 0; m < mrks.length; m++) {
    mrks[m].className = mrks[m].className.replace('active', '');
  }

  // add active class to clicked item
  this._icon.className += ' active';

}

/* Create a GeoJSON Feature
 *
 */
function makeGeoJsonFeature(feature) {

  var newFeature = {
    "type": "Feature",
    "properties": {
      "image": feature.image,
      "Fellowship City": feature['Fellowship City'],
      "State": feature.State,
      "First Name": feature['First Name'],
      "Last Name": feature['Last Name'],
      "Name": feature['Name'],
      "Skill": feature.Skill,
      "linkedin": feature.LinkedIn,
      "twitter": feature.twitter,
      "Fellowship Year": feature['Fellowship Year']
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


// do this on every single marker/fellow
function onEachFeature (feature, layer) {
    var info = feature.properties;

    var popupContent = "";
    popupContent += "<div class='popup-image'><img src='http://www.codeforamerica.org/media/images/people/" + info.image + "'></div>";
    popupContent += "<p class='popup-city'><strong>" + info["Fellowship City"] + "</strong>, " + info["Fellowship Year"] + "</p>";
    popupContent += "<p class='popup-skill'>" + info.Skill + "</p>";
    popupContent += "<div class='social-links'><a target='_blank' class='social' href='" + info.linkedin + "'><i class='fa fa-linkedin-square'></i></a></div>";
    
    if (info && info.Name) {
        layer.bindPopup(popupContent, {
          offset: L.point(310,280)
        });
    }

}

// set up markers object with markerClusterGroup
var markers = L.markerClusterGroup({
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

window.onload = init();