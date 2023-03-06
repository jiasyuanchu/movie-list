const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'



//將movies來源改為local storage存好的電影
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  let rawHTML = ''
  //在傳進來的data陣列中，去取每一個的title.image
  data.forEach((item) => {
    console.log(item)
    //把html的架構拿過來並且修改「需要動態產生」的內容
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `

  })

  //把寫好的html代換進html檔案
  dataPanel.innerHTML = rawHTML
}

//把該id下的各個資料一一綁進來並且show在modal上，取得 API 資料，放進 template 的適當位置裡
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

//將該電影從最愛清單中移除
function removeFromFavorite(id) {
  //如果id 在收藏清單中不存在，或收藏清單是空的，就結束這個函式
  if (!movies || !movies.length) return 
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return 
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

//點擊more時，載入該部電影的資料
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)