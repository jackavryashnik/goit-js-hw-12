import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import icon from './img/bi_x-octagon.svg';
import iziToast from 'izitoast';
import axios from 'axios';

const input = document.querySelector('.search-input');
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
let page = 1;
let currentURL = '';
let totalPages = 0;
const request = {
  key: '41300766-2a2685b0426849001fa971f21',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
};
const lightboxOptions = {
  overlayOpacity: 0.8,
  captionsData: 'alt',
  captionDelay: 250,
};
let URL = `https://pixabay.com/api/?`;
const lightbox = new SimpleLightbox('.gallery a', lightboxOptions);

const removeElemenyBySelector = selestor => {
  if (document.querySelector(selestor))
    document.querySelector(selestor).remove();
};

const getImagesFromAPI = async (url, scrollHight) => {
  await axios
    .get(url)
    .then(({ data }) => {
      if (!data.totalHits) {
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          backgroundColor: '#EF4040',
          messageColor: '#FAFAFB',
          position: 'topRight',
          iconUrl: icon,
          iconColor: '#ffffff',
          maxWidth: 432,
          messageSize: 16,
        });

        removeElemenyBySelector('.loader');
        removeElemenyBySelector('.load-more-btn');

        gallery.innerHTML = '';
        return;
      }

      totalPages = Math.ceil(data.totalHits / request.per_page);

      if (data.hits.length < request.per_page || page === totalPages) {
        iziToast.info({
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
          maxWidth: 432,
          messageSize: 16,
        });

        removeElemenyBySelector('.loader');
        removeElemenyBySelector('.load-more-btn');

        if (data.hits.length <= request.per_page && data.hits.length > 0) {
          renderMarkup(data);
        }

        return;
      }

      renderMarkup(data);

      window.scrollBy({
        top: scrollHight,
        behavior: 'smooth',
      });
    })
    .catch(error => {
      removeElemenyBySelector('.loader');
      console.log(error);
    });
};

form.addEventListener('submit', event => {
  event.preventDefault();

  if (!input.value) return;

  gallery.innerHTML = '';
  request.q = input.value;

  gallery.insertAdjacentHTML('afterend', `<span class="loader"></span>`);
  removeElemenyBySelector('.load-more-btn');

  page = 1;

  currentURL = URL + new URLSearchParams(request) + `&page=${page}`;
  input.value = '';
  getImagesFromAPI(currentURL, 0);
});

const renderMarkup = data => {
  let markup = data.hits.reduce(
    (
      html,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => {
      return (
        html +
        `<li class="gallery-item">
        <a class="gallery-link" href=${largeImageURL}>
          <img class="gallery-image" src=${webformatURL} data-source=${largeImageURL} alt="${tags}" width="360" height="200"/>
          <ul class="image-stats">
            <li class="stats-item"><h3 class="stat-title">Likes</h3><p class="stat-value">${likes}</p></li>
            <li class="stats-item"><h3 class="stat-title">Views</h3><p class="stat-value">${views}</p></li>
            <li class="stats-item"><h3 class="stat-title">Comments</h3><p class="stat-value">${comments}</p></li>
            <li class="stats-item"><h3 class="stat-title">Downloads</h3><p class="stat-value">${downloads}</p></li>
          </ul>  
          </a>
        </li>`
      );
    },
    ''
  );

  removeElemenyBySelector('.load-more-btn');
  removeElemenyBySelector('.loader');
  gallery.insertAdjacentHTML('beforeend', markup);

  gallery.insertAdjacentHTML(
    'afterend',
    `<button type="submit" class="load-more-btn">Load more</button>`
  );

  document.querySelector('.load-more-btn').addEventListener('click', () => {
    gallery.insertAdjacentHTML('afterend', `<span class="loader"></span>`);
    page += 1;

    currentURL = URL + new URLSearchParams(request) + `&page=${page}`;
    const scrollHight =
      document.querySelector('.gallery-item').getBoundingClientRect().height *
      2;

    getImagesFromAPI(currentURL, scrollHight);
  });

  if (
    (document.querySelector('.load-more-btn') &&
      data.hits.length > request.per_page) ||
    (document.querySelector('.load-more-btn') && page === totalPages)
  ) {
    removeElemenyBySelector('.load-more-btn');
  }

  lightbox.refresh();
};
