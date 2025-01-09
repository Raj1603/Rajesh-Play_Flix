
  // Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
console.log(`Logged-in user ID: ${loggedInUserId}`);

// Cache movies to prevent redundant fetches
let moviesCache = [];

// Fetch movies from Firebase
const fetchMovies = async () => {

  if (moviesCache.length === 0) {
    const snapshot = await getDocs(collection(db, "movies"));
    moviesCache = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // Include document ID if needed
  }
  return moviesCache;
  
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
const renderSlides = (slides) => {
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
            <i class="fa-regular fa-heart watch-later-btn" data-movie-id="${movie.name}"></i>
          </div>
        </div>
      </div>`;
    carouselMoviesContainer.insertAdjacentHTML("beforeend", slideHTML);
  });
};



// Split movies into initial and remaining slides
const initializeSlides = (movies) => {
  const movieArray = Array.isArray(movies) ? movies : Object.values(movies);

  // Render initial slides (first 3 movies)
  const initialSlides = movieArray.slice(0, 3);
  renderSlides(initialSlides);

  // Initialize Swiper after rendering the initial slides
  swiper.update();

  // Render remaining slides after a delay
  setTimeout(() => {
    const remainingSlides = movieArray.slice(3);
    renderSlides(remainingSlides);
    swiper.update(); // Update Swiper to recognize the new slides
  }, 1000);
};

// Wait for movies to load and then initialize slides


// Render new released movies
const renderNewReleased = (movies) => {
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
        <h1 class="view">${movie.name}</h1>
        <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>
      </div>`;
  });

  newReleasedContainer.innerHTML = htmlContent;
};

// Render top-rated movies
const renderTopRated = (movies) => {
  const topRatedContainer = document.getElementById("movies-list");
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
        <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>
      </div>`;
  });

  topRatedContainer.innerHTML = htmlContent;
};

// Render movies by genres
const renderByGenres = (movies) => {
  const renderedMovies = new Set(); // Track rendered movies by name

  movies.forEach((movie) => {
    if (parseFloat(movie.rating) >= 8.0) {
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
              <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>
            </div>`;

            genreContainer.insertAdjacentHTML("beforeend", movieHtml);

          renderedMovies.add(movie.name); // Mark as rendered
        }
      });
    }
  });
};

// Fetch movies and render all sections
fetchMovies()
  .then((movies) => {
    // Initialize all sections after fetching movies
    initializeSlides(movies);
    renderNewReleased(movies);
    renderTopRated(movies);
    renderByGenres(movies);
  })
  .catch((err) => console.error("Error rendering movies:", err));
