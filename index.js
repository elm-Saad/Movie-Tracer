const apiKey = 'e0a3cb29'
const movieNameForm = document.getElementById('movie-form')
const moviesDisplayAreaMain = document.getElementById('movies-display-area-main')
const displayMessage = document.getElementById("message-container")
let MvArraysdata =[]
let AddeIdsArray = []

//local storage 
const storedArrayJson = localStorage.getItem('movieIDs')
if(storedArrayJson)
    AddeIdsArray = JSON.parse(storedArrayJson)

//handle clikces
movieNameForm.addEventListener('submit',getMoviesData)
document.addEventListener('click', function(e){
    if(e.target.dataset.movieAdd){
       handleAddToWatchList(e.target.dataset.movieAdd) 
    }else if(e.target.id === "close-btn"){
        displayMessage.style.display = "none"
    }
})

function getMoviesData(e){
    MvArraysdata=[]
    e.preventDefault()
    const movieName = new FormData(movieNameForm).get('Search-input')

    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${movieName}`)
        .then(res => res.json())
        .then(data => { 
            if(data.Search){
                const unicIdsArrays = data.Search.map(unicMv => unicMv.imdbID);
                // get movies by ids 
                getMoviesByIds(unicIdsArrays)
            }else{//Unable to find data
                moviesDisplayAreaMain.innerHTML = `
                    <p class="no-data-text">
                        Unable to find what you’re looking for. Please try another search.
                    </p>
                `
            }
        })
}

function getMoviesByIds(IdsArray){
    if(IdsArray.length > 0){
        const fetchPromises = IdsArray.map(id => {
            return fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
                .then(res => res.json());
        });
        //make sure that each movie id get fetched before rendering the data 
        Promise.all(fetchPromises)
            .then(MvArraysdata => {
                renderMvData(MvArraysdata);
            })
            .catch(error => {
                moviesDisplayAreaMain.innerHTML = 'Error :' +  error;
            })
    }
}

function renderMvData(MvArraysdata){
    let movieDataHtml = ''
    for(let movie of MvArraysdata ){
        movieDataHtml +=`
            <section class="movie-data">
                <img src="${(movie.Poster !="N/A") ? movie.Poster : "images/no-image.png"}">
                <h2 class="d-flex-center">
                    <span>${(movie.Title.length < 24)? movie.Title : movie.Title.substring(0, 24) + "..."}</span>
                    <span class="d-flex-center">${movie.imdbRating}</span>
                </h2>
                <div class="info d-flex">
                    <time>${movie.Runtime}</time>
                    <span>${movie.Genre}</span>
                    <span class="d-flex-center add" data-movie-add="${movie.imdbID}">Watchlist </span>
                </div>
                <p>
                    ${(movie.Plot !="N/A") ? movie.Plot : "Plot information for this movie is currently unavailable. "}
                </p>
            </section>
    `
    }
    moviesDisplayAreaMain.innerHTML = movieDataHtml
}

function handleAddToWatchList(targetedMovie){
    if(AddeIdsArray.includes(targetedMovie)){
        displayMessageFn('is alredy Added')
    }else{
        AddeIdsArray.push(targetedMovie)
        //add to localStorage 
        localStorage.setItem('movieIDs', JSON.stringify(AddeIdsArray))

        // auto update in app.js

        //add confirm  message
        displayMessageFn('Added')
    }
}

function displayMessageFn(state){
    document.getElementById('message').textContent = `Movie ${state}`
    displayMessage.style.display = "block"
    setTimeout(()=>{
        displayMessage.style.display = "none"
    },1300)
}