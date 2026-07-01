// Avaliações estáticas — exibidas junto com as do Google
var staticReviews = [
  {
    author_name: 'Viviane Santos',
    rating: 5,
    profile_photo_url: 'images/VIviane-santos.jpg',
    relative_time_description: '',
    text: 'Encontrei um ambiente acolhedor, onde me senti à vontade para aprender e criar desde o primeiro dia. Os cursos são excelentes, aprendendo as técnicas passo a passo, permitindo conseguir resultados lindos. É mais do que um curso, é uma experiência relaxante e enriquecedora que recomendo de olhos fechados!'
  },
  {
    author_name: 'Luciane Garcia',
    rating: 5,
    profile_photo_url: null,
    relative_time_description: '11 meses atrás',
    text: 'Experiência melhor impossível!!!! Se você gosta de artesanato, recomendo, recomendo, recomendo. Lugar aconchegante, de muita paz e muito carinho. Carinho este, que recebemos da Deise, proprietária do Ateliê, que em meio às suas "férias", nos atendeu prontamente com toda dedicação. Quanta coisa linda....vontade de fazer tudo. Lindas peças, materiais de ótima qualidade.'
  },
  {
    author_name: 'Jordana Araujo',
    rating: 5,
    profile_photo_url: 'images/jordana-araujo.png',
    relative_time_description: 'um ano atrás',
    text: 'A loja com peças de MDF tem muitas variedades e os preços são ótimos! E amo participar das oficinas de arte que vocês promovem! Amo esse ateliê, tudo maravilhoso ❤️'
  }
];

window.initGoogleReviews = function () {
  var badge     = document.getElementById('google-rating-badge');
  var container = document.getElementById('google-reviews-container');
  if (!container) return;

  var service = new google.maps.places.PlacesService(document.createElement('div'));

  service.findPlaceFromQuery(
    {
      query:  'Amor De Arte Ateliê Poços de Caldas MG',
      fields: ['place_id', 'rating', 'user_ratings_total']
    },
    function (results, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results || !results[0]) {
        initCarousel(container, staticReviews);
        return;
      }

      var found = results[0];
      if (badge && found.rating != null) {
        badge.innerHTML = buildBadgeHTML(found.rating, found.user_ratings_total);
      }

      service.getDetails(
        {
          placeId:  found.place_id,
          fields:   ['rating', 'user_ratings_total', 'reviews'],
          language: 'pt-BR'
        },
        function (place, detailStatus) {
          if (detailStatus !== google.maps.places.PlacesServiceStatus.OK) {
            initCarousel(container, staticReviews);
            return;
          }

          if (badge && place.rating != null) {
            badge.innerHTML = buildBadgeHTML(place.rating, place.user_ratings_total);
          }

          // Combina avaliações do Google com as estáticas, sem duplicar por nome
          var apiReviews  = place.reviews || [];
          var apiNames    = apiReviews.map(function (r) { return r.author_name.toLowerCase(); });
          var extras      = staticReviews.filter(function (r) {
            return apiNames.indexOf(r.author_name.toLowerCase()) === -1;
          });
          var all = apiReviews.concat(extras);

          initCarousel(container, all);
        }
      );
    }
  );
};

function initCarousel(container, reviews) {
  container.innerHTML = reviews.map(buildCardHTML).join('');

  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.owlCarousel !== 'undefined') {
    jQuery(container)
      .addClass('owl-carousel owl-reviews')
      .owlCarousel({
        loop:               reviews.length > 3,
        dots:               true,
        nav:                true,
        autoplay:           true,
        autoplayTimeout:    5000,
        autoplayHoverPause: true,
        margin:             20,
        navText:            ['&#8249;', '&#8250;'],
        responsive: {
          0:   { items: 1 },
          576: { items: 2 },
          992: { items: 3 }
        }
      });
  }
}

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

function buildCardHTML(review) {
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
    '<div class="g-review-card">' +
      '<div class="g-review-top">' +
        avatar +
        '<div class="g-reviewer-meta">' +
          '<strong class="g-reviewer-name">' + review.author_name + '</strong>' +
          '<div class="g-review-stars">' + stars + '</div>' +
          (review.relative_time_description
            ? '<span class="g-review-date">' + review.relative_time_description + '</span>'
            : '') +
        '</div>' +
        '<span class="fa-brands fa-google g-review-badge-icon"></span>' +
      '</div>' +
      '<p class="g-review-body">' + (review.text || '') + '</p>' +
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
