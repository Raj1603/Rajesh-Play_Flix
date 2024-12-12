// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
export const loggedInUserId = localStorage.getItem("loggedInUserId");
console.log(`answer from movies.js ${loggedInUserId}`);

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEximerMkuSZVNY_WlHioJelJCiV48okY",
  authDomain: "movies-list-934e9.firebaseapp.com",
  projectId: "movies-list-934e9",
  storageBucket: "movies-list-934e9.firebasestorage.app",
  messagingSenderId: "68089362700",
  appId: "1:68089362700:web:f3758978116a32c31b3129",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// *************** Upload Movies to Firestore ****************************
const db = getFirestore(app);

// Read the JSON file

fetch("../data/movies.json")
  .then((response) => response.json())
  .then(async (data) => {
    const moviesCollection = collection(db, "movies");

    // Fetch existing movies from Firebase
    const existingMoviesSnapshot = await getDocs(moviesCollection);
    const existingMovieNames = existingMoviesSnapshot.docs.map(
      (doc) => doc.data().name
    );

    for (const movie of data.movies) {
      if (!existingMovieNames.includes(movie.name)) {
        // Upload only if the movie does not already exist
        await addDoc(moviesCollection, movie);
        console.log(`Uploaded: ${movie.name}`);
      } else {
        console.log(`Skipped (already exists): ${movie.name}`);
      }
    }
  })
  .catch((err) => console.error("Error uploading movies:", err));

// Fetch movies from Firebase
const fetchMovies = async () => {
  const moviesCollection = collection(db, "movies");
  const snapshot = await getDocs(moviesCollection);
  const movies = snapshot.docs.map((doc) => doc.data());
  return movies;
};

// Render New Released Movies
const renderAllMovies = (movies) => {
  const CarouselMoviesContainer = document.getElementById("movies");

  const CarouselMovies = movies;
  let htmlContent = "";
  CarouselMovies.forEach((movie) => {
    // Initialize HTML content
    htmlContent += `
          <div class="swiper-slide">
            <img src="${movie.image}" alt="${movie.name} poster">
            <div class="movie-details">
              <h2 class="view"><span>Movie:</span> ${movie.name}</h2>
              <p class="hide"><span>Description:</span> ${movie.description}</p>
              
              ${
                loggedInUserId
                  ? `<a href="./pages/movie-details.html?name=${encodeURIComponent(
                      movie.name
                    )}" class="btn" data-videolink="${
                      movie.videolink
                    }">Watch Now</a>`
                  : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
              }
            </div>
          </div>`;
  });
  // Set the HTML content to the container
  CarouselMoviesContainer.innerHTML = htmlContent;
};

// Fetch movies and render the "New Released" section
fetchMovies()
  .then(renderAllMovies)
  .catch((err) => console.error("Error rendering All movies:", err));

// Render New Released Movies
const renderNewReleased = (movies) => {
  const newReleasedContainer = document.getElementById(
    "newReleasedmovies-list"
  );
  const currentYear = new Date().getFullYear();

  const newMovies = movies.filter(
    (movie) => parseInt(movie.year) === currentYear
  );

  // Initialize HTML content
  let htmlContent = "";

  newMovies.forEach((movie) => {
    htmlContent += `
      <div class="released-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
                 ${
                   loggedInUserId
                     ? `<a href="./pages/movie-details.html?name=${encodeURIComponent(
                         movie.name
                       )}" class="btn" data-videolink="${
                         movie.videolink
                       }">Watch Now</a>`
                     : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
                 }
      </div>
    `;
  });

  // Set the HTML content to the container
  newReleasedContainer.innerHTML = htmlContent;
};

// Fetch movies and render the "New Released" section
fetchMovies()
  .then(renderNewReleased)
  .catch((err) => console.error("Error rendering new releases:", err));

const renderTopRated = (movies) => {
  const topRatedContainer = document.getElementById("movies-list");
  const topRatedMovies = movies.filter(
    (movie) => parseFloat(movie.rating) >= 5.0
  );

  // Initialize HTML content
  let htmlContent = "";

  topRatedMovies.forEach((movie) => {
    htmlContent += `
      <div class="favorite-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
        <h2>${movie.rating} </h2>
                 ${
                   loggedInUserId
                     ? `<a href="./pages/movie-details.html?name=${encodeURIComponent(
                         movie.name
                       )}" class="btn" data-videolink="${
                         movie.videolink
                       }">Watch Now</a>`
                     : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
                 }
      </div>
    `;
  });
  // Set the HTML content to the container
  topRatedContainer.innerHTML = htmlContent;
};

fetchMovies().then(renderTopRated);

const renderByGenres = (movies) => {
  // Loop through each movie and render it to the corresponding genre container
  movies.forEach((movie) => {
    if (parseFloat(movie.rating) >= 8.0) {
      // Only render movies with rating >= 5.0
      movie.genre.forEach((genre) => {
        // Find the container for the genre
        const genreContainer = document.getElementById(
          `${genre.toLowerCase()}-container`
        );

        // If the container exists, render the movie inside it
        if (genreContainer) {
          const movieHtml = `
            <div class="movie-item">
              <img src="${movie.image}" alt="${movie.name} poster">
              <h1 class="view">${movie.name}</h1>
              <h2>${movie.rating}</h2>
              <p><span>Genre:</span> ${genre}</p>
                       ${
                         loggedInUserId
                           ? `<a href="./pages/movie-details.html?name=${encodeURIComponent(
                               movie.name
                             )}" class="btn" data-videolink="${
                               movie.videolink
                             }">Watch Now</a>`
                           : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
                       }
            </div>
          `;

          // Append the movie HTML to the genre container
          genreContainer.innerHTML += movieHtml;
        }
      });
    }
  });
};

// Fetch movies and render them by genre
fetchMovies().then(renderByGenres);
