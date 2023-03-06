const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
//宣告變數以存放搜尋完的結果
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `

  })

  //把寫好的html代換進html檔案
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(movieAmount){
  const numberOfPages = Math.ceil(movieAmount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    //1) 在a的標籤上綁上data-page以利之後加上監聽器 2) 將rawHTML依照for迴圈指定次數重新複寫
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//效果：輸入page number, 提供該頁應該顯示出來的電影清單
function getMoviesByPage(page){
  //不僅total page的movies要使用get page, filtered movies也要。而他們的區分在於長度是否為零
  const data = filteredMovies.length ? filteredMovies : movies
  // page 1 -> movie 0 - 11
  // page 2 -> movie 12 - 23
  // page 3 -> movie 24 - 35
  const StartIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(StartIndex, StartIndex + MOVIES_PER_PAGE)
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

//收藏至最愛電影清單
function addToFavorite(id) {
  //回傳favorite清單。用json.parse把回傳進來的object變成string以符合local storage的格式要求
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //去把movies陣列裡的八十個清單一一檢視並找出movie.id和傳入值id完全相同的項目
  const movie = movies.find((movie) => movie.id === id)
  //先篩掉已經存在的以免重複存入
  if (list.some((movie) => movie.id === id)) {
    return alert('this movie had already been saved.')
  }
  list.push(movie)
  //把list轉成JSON字串後丟進local storage裡
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


//點擊more時，載入該部電影的資料
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

//當search form被submit時，重新render電影清單
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //請瀏覽器不要做預設的動作
  event.preventDefault()
  //命名keyword並且把輸入值都變成英文小寫並去頭去尾
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)


  //// 若輸入值為false, 跳alert
  // if (!keyword.length){
  //   return alert('Please enter a valid string.')
  // }

  // 方法二（filter）
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  // //方法一（迴圈）：比對電影title並把包含關鍵字的項目推進filteredMovies
  // for (const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }
  //重新render分頁器 並且依照page長度重新render電影清單
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    //render分頁器
    renderPaginator(movies.length)
    //加入分頁器顯示電影清單的效果
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

