const apiKey = 'e0a3cb29'
const moviesDisplayAreaWatchList = document.getElementById('movies-display-area-watchlist')
const displayMessage = document.getElementById("message-container")
let AddeIdsArray = []

document.addEventListener('click', function(e){
    if(e.target.dataset.movieRemove){
        handleRemoveFromWatchList(e.target.dataset.movieRemove)
    }else if(e.target.id === "close-btn"){
        displayMessage.style.display = "none"
    }   
})

function handleRemoveFromWatchList(targetedMovie){
    //remove from localStorage 
    const indexOfMv = AddeIdsArray.indexOf(targetedMovie);
    if (indexOfMv !== -1) {
        AddeIdsArray.splice(indexOfMv, 1)
        // Restore the updated array
        localStorage.setItem('movieIDs', JSON.stringify(AddeIdsArray));
    } 

    // update whatchlist in the wattch list 
    getLocalSorageData()

    //add confirm  message
    displayMessageFn('Removed')
}

function getLocalSorageData(){
    const storedArrayJson = localStorage.getItem('movieIDs')
    if(storedArrayJson)
        AddeIdsArray = JSON.parse(storedArrayJson)
    
    // update whatchlist in the wattch list 
    getMoviesByIds(AddeIdsArray)
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
                moviesDisplayAreaWatchList.innerHTML = 'Error :' +  error;
            })
    }else{
        moviesDisplayAreaWatchList.innerHTML = `
            <p class="no-data-text">
                Your watchlist is looking a little empty...
                <a class="add d-flex-center" href="index.html">Let’s add some movies!</a>
            </p>
        `
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
            <span class="d-flex-center remove" data-movie-remove="${movie.imdbID}">Watchlist </span>
        </div>
        <p>
            ${(movie.Plot !="N/A") ? movie.Plot : "Plot information for this movie is currently unavailable."}
        </p>
    </section>
    `
    }
    moviesDisplayAreaWatchList.innerHTML = movieDataHtml
}

function displayMessageFn(state){
    document.getElementById('message').textContent = `Movie ${state}`
    displayMessage.style.display = "block"
    setTimeout(()=>{
        displayMessage.style.display = "none"
    },1300)
}

getLocalSorageData()