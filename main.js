'use strict';
/* global $ */
/* global google */

//https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJ852WrnFbwokRlgQEBWk5Ry8&key=AIzaSyDsUCcz1-Fwcf_G5IPn858lI4jO8GONcyc
const AUTH_KEY = 'AIzaSyDsUCcz1-Fwcf_G5IPn858lI4jO8GONcyc';
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ZOOM = 16;
const RADIUS = 500;
const PLACES = ['restaurant'];

const htmlMap = document.getElementById('map');

const STORE = {
  searchTerm: null,
  latitude: 40.6645459,
  longitude: -73.9539815,
  map: null,
  keyword: null,
  place_id: null
};

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position, error) => {
      if (!error) {
        STORE.latitude = position.coords.latitude;
        STORE.longitude = position.coords.longitude;
        initMap();
      } else {
        initMap();
      }
    });
  } else {
    initMap();
  }
}

/*********************   API Query   *********************/

function getSearchLocation(searchValue, callback) {
  const query = {
    address: searchValue,
    key: AUTH_KEY
  };
  $.getJSON(GEOCODE_URL, query, callback);
}

/*********************   HTML Generators   *********************/

function renderHTML(results) {
  console.log(results);
  return (
    `<div>
      <span><a href="https://www.google.com/maps/place/?q=place_id:${results.place_id}" target="_blank">
      ${results.name}(${results.vicinity}) Rating: ${results.rating}, Price Level: ${results.rating}</a></span>
    </div>`
  );
}

function genereateDataList(data) {
  STORE.latitude = data.results[0].geometry.location.lat;
  STORE.longitude = data.results[0].geometry.location.lng;
  initMap();
}

/*********************   Event Handlers   *********************/

function handleSearchClick() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    const searchTarget = $(event.currentTarget).find('.js-query');
    const search = searchTarget.val();
    STORE.searchTerm = search;
    searchTarget.val('');
    getSearchLocation(search, genereateDataList);
    $('#map').show();
    $('.js-search-results').show();
  });
}

/*********************   GOOGLE MAPS API   *********************/

let map;
let infowindow;

function initMap() {
  const searchPlace = {lat: STORE.latitude, lng:  STORE.longitude};

  map = new google.maps.Map(htmlMap, {
    center: searchPlace,
    zoom: ZOOM
  });

  infowindow = new google.maps.InfoWindow();

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: searchPlace,
    radius: RADIUS,
    type: PLACES
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
    const list = results.map(item => renderHTML(item));
    $('.js-search-results').html(list);
  }
}

function createMarker(place) {
  const placeLoc = place.geometry.location;
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  marker.addListener('click', toggleBounce);
  function toggleBounce() {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function initialize() {
  let input = document.getElementById('searchTextField');
  let autocomplete = new google.maps.places.Autocomplete(input);
}

google.maps.event.addDomListener(window, 'load', initialize);

$(() => {
  handleSearchClick();
});
