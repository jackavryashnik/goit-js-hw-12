import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const input = document.querySelector('.search-input');
const btn = document.querySelector('.search-btn');
const gallery = document.querySelector('.gallery');
let page = 1;
const request = {
  key: '41300766-2a2685b0426849001fa971f21',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
  page: page,
};
const options = {
  overlayOpacity: 0.8,
  captionsData: 'alt',
  captionDelay: 250,
};
let URL = `https://pixabay.com/api/?`;
const lightbox = new SimpleLightbox('.gallery a', options);

const getImagesFromAPI = async (url, scrollHight) => {
  await axios
    .get(url)
    .then(({ data }) => {
      if (!data.hits[0]) {
        iziToast.error({
          message:
            'Sorry, there are no images matching your search query. Please try again!',
          backgroundColor: '#EF4040',
          messageColor: '#FAFAFB',
          position: 'topRight',
          iconUrl: '/img/bi_x-octagon.svg',
          iconColor: '#ffffff',
          maxWidth: 432,
          messageSize: 16,
        });

        if (document.querySelector('.load-more-btn')) {
          document.querySelector('.load-more-btn').remove();
        }
        gallery.innerHTML = '';
        return;
      }

      const totalPages = Math.ceil(data.totalHits / request.per_page);

      if (page === totalPages) {
        iziToast.info({
          message: "We're sorry, but you've reached the end of search results.",
          position: 'topRight',
          maxWidth: 432,
          messageSize: 16,
        });

        if (document.querySelector('.load-more-btn')) {
          document.querySelector('.load-more-btn').remove();
        }

        if (document.querySelector('.loader')) {
          document.querySelector('.loader').remove();
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
      console.log(error);
    });
};

btn.addEventListener('click', event => {
  event.preventDefault();
  if (document.querySelector('.loader')) {
    document.querySelector('.loader').remove();
  }
  if (document.querySelector('.load-more-btn')) {
    document.querySelector('.load-more-btn').remove();
  }
  gallery.insertAdjacentHTML('afterend', `<span class="loader"></span>`);
  page = 1;

  request.q = input.value;
  URL += new URLSearchParams(request);
  input.value = '';
  getImagesFromAPI(URL, 0);
});

const renderMarkup = data => {
  let markup = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="gallery-item">
        <a class="gallery-link" href=${largeImageURL}>
          <img class="gallery-image" src=${webformatURL} data-source=${largeImageURL} alt="${tags}" width="360" height="200"/>
          <ul class="image-stats">
            <li class="stats-item"><h3 class="stat-title">Likes</h3><p class="stat-value">${likes}</p></li>
            <li class="stats-item"><h3 class="stat-title">Views</h3><p class="stat-value">${views}</p></li>
            <li class="stats-item"><h3 class="stat-title">Comments</h3><p class="stat-value">${comments}</p></li>
            <li class="stats-item"><h3 class="stat-title">Downloads</h3><p class="stat-value">${downloads}</p></li>
          </ul>  
          </a>
        </li>`;
      }
    )
    .join('');

  let loadMoreBtn = `<button type="submit" class="load-more-btn">Load more</button>`;

  document.querySelector('.loader').remove();
  gallery.insertAdjacentHTML('beforeend', markup);
  gallery.insertAdjacentHTML('afterend', loadMoreBtn);
  document.querySelector('.load-more-btn').addEventListener('click', event => {
    event.preventDefault();
    document.querySelector('.load-more-btn').remove();
    gallery.insertAdjacentHTML('afterend', `<span class="loader"></span>`);
    page += 1;

    URL += new URLSearchParams(request);
    const scrollHight =
      document.querySelector('.gallery-item').getBoundingClientRect().height *
      2;

    getImagesFromAPI(URL, scrollHight);
  });

  lightbox.refresh();
};
