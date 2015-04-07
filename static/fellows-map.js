var map, fellowsData;

function init() {
  //initialize the map
  map = L.map('map').setView([34.30714385628804, -112.0166015625], 4);
  fellowsData = {
    "type": "FeatureCollection",
    "features": []
  };
  L.tileLayer('http://{s}.tiles.mapbox.com/v3/svmatthews.lidab7g5/{z}/{x}/{y}.png').addTo(map);


  Tabletop.init({
    key: '1yFx14zL13sz1UXOhY8MVZSzWWG-tvEdcFVe2CaEs-sQ',
    callback: makeMap,
    simpleSheet: true
  });
}

function makeMap(data, tabletop) {
  for (var i = 0; i < data.length; i++) {
    (function(row) {
      if (row.Lat) {
        var f = makeGeoJsonFeature(row);
        fellowsData.features.push(f);
      }
    })(data[i]);
  }

  geoJson = L.geoJson(fellowsData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.divIcon({
          className: 'fellow-marker cf',
          html: '<img class="fellow-marker-image" src="http://www.codeforamerica.org/media/images/people/'+feature.properties.image+'"><span class="fellow-marker-name">'+feature.properties.Name+'</span>'
        })
      })
    }
  });

  // add the geojson object to the markers group
  markers.addLayer(geoJson);

  // add the markers to the map now that they are clustered
  map.addLayer(markers);

  // fit the map to the bounds of the markers
  map.fitBounds(markers.getBounds());
}

function makeGeoJsonFeature(feature) {
  console.log(feature);

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

    var popupContent = "<h1>"+info.Name+"</h1>";
    popupContent += "<div class='social-links'><a target='_blank' class='social' href='" + info.linkedin + "'><i class='fa fa-linkedin-square'></i></a></div>";
    popupContent += "<strong>Fellowship City: </strong> " + info["Fellowship City"] + ", " + info["Fellowship Year"] + "<br>";
    popupContent += "<strong>Skill: </strong>" + info.Skill + "<br>";
    popupContent += "<img src='http://www.codeforamerica.org/media/images/people/" + info.image + "'>";
    
    if (info && info.Name) {
        layer.bindPopup(popupContent);
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
  spiderfyLinear: true
});

window.onload = init();