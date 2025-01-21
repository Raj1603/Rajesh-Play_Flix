
  // Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where,getDoc,doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3VZw2WEmDvMXyFEbpc00umhEykmmY8N8",
  authDomain: "login-form-f5168.firebaseapp.com",
  projectId: "login-form-f5168",
  storageBucket: "login-form-f5168.appspot.com",
  messagingSenderId: "374763286727",
  appId: "1:374763286727:web:b9773388aadfbd40cd8ee2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get logged-in user ID
export const loggedInUserId = localStorage.getItem("loggedInUserId");


const userId = loggedInUserId;
console.log(`Logged-in user ID: ${loggedInUserId}`);
// Cache movies to prevent redundant fetches
let moviesCache = [];
let userCache = null;


// Fetch movies from Firebase
export const fetchMovies = async () => {

  
  // Clear the cache if needed to fetch fresh data
  moviesCache = [];  // Clear the cache for fresh data
  userCache = null;   // Clear the user cache
  
  // Check if the cache is empty
  if (moviesCache.length === 0 || !userCache) {
    // Fetch movies data
    const snapshot = await getDocs(collection(db, "movies"));
    moviesCache = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Include document ID if needed

    // Fetch user data only if user is logged in
    if (userId) {
      const userDetails = await getDoc(doc(db, "users", userId));
      userCache = { id: userDetails.id, ...userDetails.data() };
    } else {
      // If no user is logged in, use a default empty user object
      userCache = { wishlist: [] };
    }
  }

  return { moviesData: moviesCache, userData: userCache };
};


// Upload movies from JSON file to Firebase
(async () => {
  try {
    const response = await fetch("../data/movies.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch movies.json: ${response.statusText}`);
    }
    const data = await response.json();
    
    const moviesCollection = collection(db, "movies");

    for (const movie of data.movies) {
      const duplicateCheckQuery = query(moviesCollection, where("name", "==", movie.name), where("year", "==", movie.year));
      const duplicateCheckSnapshot = await getDocs(duplicateCheckQuery);

      if (duplicateCheckSnapshot.empty) {
        await addDoc(moviesCollection, movie);
        console.log(`Uploaded: ${movie.name}`);
      } else {
        console.log(`Skipped (already exists): ${movie.name}`);
      }
    }
  } catch (err) {
    console.error("Error uploading movies:", err);
  }
})();

// Render all movies
const renderSlides = (slides,wishlist) => {
  const carouselMoviesContainer = document.getElementById("movies");
  

  slides.forEach((movie) => {
    const buttonLabel = loggedInUserId ? "More Info" : "More info";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const slideHTML = `
      <div class="swiper-slide">
        <img class="swiper-lazy" src="${movie.image}" alt="${movie.name} poster">
        <div class="swiper-lazy-preloader"></div>
        <div class="movie-details">
          <h2 class="view"><span>Movie:</span> ${movie.name}</h2>
          <p class="hide"><span>Description:</span> ${movie.description}</p>
          <div class="buttons">
            <a href="${buttonLink}" class="btn">${buttonLabel}</a>
             ${wishlist.includes(movie.name) ? `<div class="hover-text"><i class="fa-sharp fa-solid fa-heart remove-btn " data-movie-id="${movie.name}" ></i><span class="tooltip-text">Remove movie from wishlist</span></div>` 
                 :`<div class="hover-text"><i class="fa-regular fa-heart watch-later-btn" data-movie-id="${movie.name}"></i> <span class="tooltip-text">Add in your wishlist</span><div>`}
          </div>
        </div>
      </div>`;
    carouselMoviesContainer.insertAdjacentHTML("beforeend", slideHTML);
  });
};


// Split movies into initial and remaining slides
const initializeSlides = (movies, userData) => {
  // console.log("User Details inside initializeSlides:", userData);
  const wishlist = userData.wishlist || []; // Default to empty array
  const movieArray = Array.isArray(movies) ? movies : Object.values(movies);

  // Render initial slides (first 3 movies)
  const initialSlides = movieArray.slice(0, 3);
  renderSlides(initialSlides,wishlist);

  // Initialize Swiper after rendering the initial slides
  swiper.update();

  // Render remaining slides after a delay
  setTimeout(() => {
    const remainingSlides = movieArray.slice(3);
    renderSlides(remainingSlides,wishlist);
    swiper.update(); // Update Swiper to recognize the new slides
  }, 100);
};

// Wait for movies to load and then initialize slides


// Render new released movies
const renderNewReleased = (movies, userData) => {
  // console.log("User Details inside renderNewReleased:", userData);

  const wishlist = userData.wishlist || []; // Default to empty array

  const newReleasedContainer = document.getElementById("newReleasedmovies-list");
  newReleasedContainer.innerHTML = ""; // Clear container

  const currentYear = new Date().getFullYear();
  const newMovies = movies.filter((movie) => parseInt(movie.year) === currentYear);

  let htmlContent = "";
  newMovies.forEach((movie) => {
    const buttonLabel = loggedInUserId ?  "More Info" : "More info";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="released-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <div class=Movie-Card-Details>
        
        <h1 class="view">${movie.name}</h1>
        

        
        <div class="Childbuttons">
              ${buttonHTML}
                    ${wishlist.includes(movie.name) ? `<div class="child-hover-text"><i class="fa-sharp fa-solid fa-heart remove-btn " data-movie-id="${movie.name}" ></i><span class="child-tooltip-text">Remove movie from wishlist</span></div>` 
                 :` <div class="child-hover-text"><i class="fa-regular fa-heart watch-later-btn  " data-movie-id="${movie.name}" ></i> <span class="child-tooltip-text" >Add in your wishlist</span></div>`}
             
                 </div>
             </div>
      </div>`;
  });

  newReleasedContainer.innerHTML = htmlContent;
};

// Render top-rated movies
const renderTopRated = (movies, userData) => {
  // console.log("User Details inside renderTopRated:", userData);
  const topRatedContainer = document.getElementById("movies-list");

  const wishlist = userData.wishlist || []; // Default to empty array


  topRatedContainer.innerHTML = ""; // Clear container

  const topRatedMovies = movies.filter((movie) => parseFloat(movie.rating) >= 6.6);

  let htmlContent = "";
  topRatedMovies.forEach((movie) => {
    const buttonLabel = loggedInUserId ?  "More Info" : "More info";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="favorite-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
         <h2><strong>Rating: </strong>${movie.rating}</h2>
         <div class="Childbuttons">
              ${buttonHTML}
                    ${wishlist.includes(movie.name) ? `<div class="child-hover-text"><i class="fa-sharp fa-solid fa-heart remove-btn " data-movie-id="${movie.name}" ></i><span class="child-tooltip-text">Remove movie from wishlist</span></div>` 
                 :` <div class="child-hover-text"><i class="fa-regular fa-heart watch-later-btn  " data-movie-id="${movie.name}" ></i> <span class="child-tooltip-text" >Add in your wishlist</span></div>`}
             </div>
      </div>`;
  });

  topRatedContainer.innerHTML = htmlContent;
};
// Render movies by genres
const renderByGenres = (movies, userData) => {
  // console.log("User Details inside renderByGenres:", userData);
  const wishlist = userData.wishlist || []; // Default to empty array
  const renderedMovies = new Set(); // Track rendered movies by name

  movies.forEach((movie) => {
    // if (parseFloat(movie.rating) >= 6.0) {
      movie.genre.forEach((genre) => {
        const genreContainer = document.getElementById(`${genre.toLowerCase()}-container`);
        if (genreContainer && !renderedMovies.has(movie.name)) {
          const buttonLabel = loggedInUserId ?  "More Info" : "More info";
          const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
          const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
          const movieHtml = `
            <div class="movie-item">
              <img src="${movie.image}" alt="${movie.name} poster">
              <h1 class="view">${movie.name}</h1>
              <h2><strong>Rating: </strong>${movie.rating}</h2>
              <p><span>Genre:</span> ${genre}</p>
            <div class="Childbuttons">
              ${buttonHTML}
                    ${wishlist.includes(movie.name) ? `<div class="child-hover-text"><i class="fa-sharp fa-solid fa-heart remove-btn " data-movie-id="${movie.name}" ></i><span class="child-tooltip-text">Remove movie from wishlist</span></div>` 
                 :` <div class="child-hover-text"><i class="fa-regular fa-heart watch-later-btn  " data-movie-id="${movie.name}" ></i> <span class="child-tooltip-text" >Add in your wishlist</span></div>`}
             </div>
            </div>`;

            genreContainer.insertAdjacentHTML("beforeend", movieHtml);

          renderedMovies.add(movie.name); // Mark as rendered
        }
      });
    // }
  });
};

// Fetch movies and render all sections
fetchMovies()
  .then(({ moviesData, userData }) => {
    // Initialize all sections
    initializeSlides(moviesData, userData);
    renderNewReleased(moviesData, userData);
    renderTopRated(moviesData, userData);
    renderByGenres(moviesData, userData);
  })
  .catch((err) => console.error("Error rendering movies:", err));
