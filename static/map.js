$(document).ready(function(){
    var ua_is_mobile = navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1;
    if (ua_is_mobile) {
        $('body').addClass('mobile');
    }
  
    var header_title = $('h1').html();
    var map_styles = [
       {
          "featureType": "poi",
          "stylers":[
             {
                "visibility": "off"
             }
          ]
       },
       { 
          "featureType": "administrative.country",
          "stylers": [
             {
                "visibility": "off"
             }
          ]
       },
       {
          featureType: 'poi.park',
          stylers:[
             {
                visibility: 'off'
             }
          ]
       },
       {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers:[
             {
                visibility: 'off'
             }
          ]
       },
       {
          "elementType": "geometry",
          "stylers":[
             {
                "lightness": 30
             }
          ]
       }
    ];
    
    var map = new google.maps.Map($('.page_container')[0], {
        center: new google.maps.LatLng(48.4,15.2),
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: map_styles,
        maxZoom: 11
    });

    map.addListener('idle', function() {
      // console.log(map.getCenter().toUrlValue());
      // console.log(map.getZoom());
    });
    
    function setScale(map, inner, outer, scale) {
        return function() {
            if (scale == 1) {
                outer.setMap(null);
                inner.setClickable(true);
            } else {
                var icono = outer.get('icon');
                icono.strokeOpacity = Math.cos((Math.PI/2) * scale);
                icono.fillOpacity = icono.strokeOpacity * 0.5;
                icono.scale = Math.sin((Math.PI/2) * scale) * 15;
                outer.set('icon', icono);

                var iconi = inner.get('icon');
                var newScale = (icono.scale < 3.0 ? 0.0 : 3.0);
                if (iconi.scale != newScale) {
                    iconi.scale = newScale;
                    inner.set('icon', iconi);
                    if (!inner.getMap()) {
                        inner.setMap(map);
                    } 
                }
            }
        }
    }
    
    var infowindow = new google.maps.InfoWindow();
    
    google.maps.event.addListener(map, 'click', function(ev) {
        infowindow.close();
    });

    function l(what) {
      console.log(what);
    }

    function getFeatureHTML(rowData, location) {
      var title = rowData.title;
      var subtitle = rowData.created;

      var html = '<div data-x="' + location.lng() + '" data-y="' + location.lat() + '"><strong>' + title + '</strong><br/>' + subtitle + '</div>';
      return html;            
    }

    var orders_total = 0;
    
    function renderFeature(rowData) {
      $('#time').text(rowData.created);

      var p_x = rowData.lon;
      var p_y = rowData.lat;
      var location = new google.maps.LatLng(p_y, p_x);

      $('#orders').prepend(getFeatureHTML(rowData, location)).find(':first').slideUp(0).slideDown('fast');

      orders_total += 1;
      $('#orders_total').html(orders_total);

      var marker_color = '#FF0000';

      var outer = new google.maps.Marker({
          position: location,
          clickable: false,
          icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillOpacity: 0.5,
              fillColor: marker_color,
              strokeOpacity: 1.0,
              strokeColor: marker_color,
              strokeWeight: 1.0,
              scale: 0
          },
          optimized: false,
          map: map
      });

      var inner = new google.maps.Marker({
          position: location,
          clickable: false,
          icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillOpacity: 1.0,
              fillColor: marker_color,
              strokeWeight: 0,
              scale: 0
          },
          optimized: false
      });

      google.maps.event.addListener(inner, 'click', function() {
        var html = '<div class="iw_map">' + getFeatureHTML(rowData, location) + '</div>';
        infowindow.setContent(html);
        infowindow.open(map, inner);
      });

      for (var i = 0; i <= 10; i++) {
        setTimeout(setScale(map, inner, outer, i / 10), i * 100);
      }
    }

    $('#orders').on('click', 'div', function(){
      var p_x = parseFloat($(this).attr('data-x'));
      var p_y = parseFloat($(this).attr('data-y'));
      var location = new google.maps.LatLng(p_y, p_x);
      map.panTo(location);
      var zoomTo = 12;
      if (map.getZoom() < zoomTo) {
        map.setZoom(zoomTo);
      }
    });


    $.getJSON('static/ttn-data.json?v=1', function(data){
      var row_id = 0;

      function updateFeature() {
        // if (row_id >= 10) {
        //   clearInterval(updateInterval);
        //   return;
        // }

        if ((typeof data[row_id]) === 'undefined') {
          clearInterval(updateInterval);
          return;
        }

        renderFeature(data[row_id]);

        row_id += 1;
      }
      var updateInterval = setInterval(function(){
        updateFeature();
      }, 300);
    });
});