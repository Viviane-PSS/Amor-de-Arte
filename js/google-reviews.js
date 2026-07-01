// Busca e renderiza avaliações reais do Google Places API
window.initGoogleReviews = function () {
  var badge     = document.getElementById('google-rating-badge');
  var container = document.getElementById('google-reviews-container');
  if (!container) return;

  var service = new google.maps.places.PlacesService(document.createElement('div'));

  service.findPlaceFromQuery(
    {
      query:  'Amor De Arte Ateliê Poços de Caldas MG',
      fields: ['place_id']
    },
    function (results, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results[0]) return;

      service.getDetails(
        {
          placeId:  results[0].place_id,
          fields:   ['rating', 'user_ratings_total', 'reviews'],
          language: 'pt-BR'
        },
        function (place, detailStatus) {
          if (detailStatus !== google.maps.places.PlacesServiceStatus.OK) return;

          if (badge && place.rating) {
            badge.innerHTML = buildBadgeHTML(place.rating, place.user_ratings_total);
          }

          if (place.reviews && place.reviews.length) {
            container.innerHTML = place.reviews
              .map(function (review, i) { return buildCardHTML(review, i); })
              .join('');
          }
        }
      );
    }
  );
};

function buildBadgeHTML(rating, total) {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span class="gstar" style="color:' + (i <= Math.round(rating) ? '#FBBC05' : '#ccc') + '">★</span>';
  }
  return (
    '<div class="google-brand">' +
      '<span class="fa-brands fa-google google-g-icon"></span>' +
      '<span class="google-brand-text">Google</span>' +
    '</div>' +
    '<div class="google-score-wrap">' +
      '<span class="google-score-num">' + rating.toFixed(1).replace('.', ',') + '</span>' +
      '<div class="google-stars-row">' + stars + '</div>' +
      '<span class="google-count-text">' + total + ' avaliações</span>' +
    '</div>'
  );
}

function buildCardHTML(review, index) {
  var stars = '';
  for (var i = 1; i <= 5; i++) {
    stars += '<span style="color:' + (i <= review.rating ? '#FBBC05' : '#ccc') + '">★</span>';
  }

  var avatar = review.profile_photo_url
    ? '<img src="' + review.profile_photo_url + '" alt="' + review.author_name + '" class="g-reviewer-img">'
    : '<div class="g-reviewer-initial" style="background-color:' + avatarColor(review.author_name) + '">' +
        review.author_name.charAt(0).toUpperCase() +
      '</div>';

  return (
    '<div class="col-sm-12 col-md-6 col-lg-4 wow fadeInUp" data-wow-delay="' + (index * 0.1).toFixed(1) + 's">' +
      '<div class="g-review-card">' +
        '<div class="g-review-top">' +
          avatar +
          '<div class="g-reviewer-meta">' +
            '<strong class="g-reviewer-name">' + review.author_name + '</strong>' +
            '<div class="g-review-stars">' + stars + '</div>' +
            '<span class="g-review-date">' + review.relative_time_description + '</span>' +
          '</div>' +
          '<span class="fa-brands fa-google g-review-badge-icon"></span>' +
        '</div>' +
        '<p class="g-review-body">' + (review.text || '') + '</p>' +
      '</div>' +
    '</div>'
  );
}

function avatarColor(name) {
  var palette = ['#7B68EE', '#4285F4', '#34A853', '#EA4335', '#FBBC05', '#00BCD4', '#9C27B0', '#FF5722'];
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
