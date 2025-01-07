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
    const moviesCollection = collection(db, "movies");
    const snapshot = await getDocs(moviesCollection);
    moviesCache = snapshot.docs.map((doc) => doc.data());
  }
  return moviesCache;
};

// Upload movies from JSON file to Firebase
(async () => {
  try {
    const response = await fetch("../data/movies.json");
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
const renderAllMovies = (movies) => {
  const carouselMoviesContainer = document.getElementById("movies");
  carouselMoviesContainer.innerHTML = ""; // Clear container

  let htmlContent = "";
  movies.forEach((movie) => {
    const buttonLabel = loggedInUserId ? "Watch Now" : "Watch Trailer";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="swiper-slide">
        <img src="${movie.image}" alt="${movie.name} poster">
        <div class="movie-details">
          <h2 class="view"><span>Movie:</span> ${movie.name}</h2>
          <p class="hide"><span>Description:</span> ${movie.description}</p>
          ${buttonHTML}
          <button class="watch-later-btn" data-movie-id="${movie.name}"><i class="fa-regular fa-heart " ></i></button>

        </div>
      </div>`;
  });

  carouselMoviesContainer.innerHTML = htmlContent;
};

// Render new released movies
const renderNewReleased = (movies) => {
  const newReleasedContainer = document.getElementById("newReleasedmovies-list");
  newReleasedContainer.innerHTML = ""; // Clear container

  const currentYear = new Date().getFullYear();
  const newMovies = movies.filter((movie) => parseInt(movie.year) === currentYear);

  let htmlContent = "";
  newMovies.forEach((movie) => {
    const buttonLabel = loggedInUserId ? "Watch Now" : "Watch Trailer";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="released-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
        ${buttonHTML}
          <button  data-movie-id="${movie.name}"><i class="fa-regular fa-heart watch-later-btn " ></i></button>
      </div>`;
  });

  newReleasedContainer.innerHTML = htmlContent;
};

// Render top-rated movies
const renderTopRated = (movies) => {
  const topRatedContainer = document.getElementById("movies-list");
  topRatedContainer.innerHTML = ""; // Clear container

  const topRatedMovies = movies.filter((movie) => parseFloat(movie.rating) >= 5.0);

  let htmlContent = "";
  topRatedMovies.forEach((movie) => {
    const buttonLabel = loggedInUserId ? "Watch Now" : "Watch Trailer";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="favorite-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
        <h2>${movie.rating}</h2>
        ${buttonHTML}
          <button class="watch-later-btn" data-movie-id="${movie.name}"><i class="fa-regular fa-heart " ></i></button>
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
          const buttonLabel = loggedInUserId ? "Watch Now" : "Watch Trailer";
          const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
          const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
          const movieHtml = `
            <div class="movie-item">
              <img src="${movie.image}" alt="${movie.name} poster">
              <h1 class="view">${movie.name}</h1>
              <h2>${movie.rating}</h2>
              <p><span>Genre:</span> ${genre}</p>
              ${buttonHTML}
          <button class="watch-later-btn" data-movie-id="${movie.name}"><i class="fa-regular fa-heart " ></i></button>
            </div>`;

          genreContainer.innerHTML += movieHtml;
          renderedMovies.add(movie.name); // Mark as rendered
        }
      });
    }
  });
};

// Fetch movies and render all sections
fetchMovies()
  .then((movies) => {
    renderAllMovies(movies);
    renderNewReleased(movies);
    renderTopRated(movies);
    renderByGenres(movies);
  })
  .catch((err) => console.error("Error rendering movies:", err));



  // -----------------------duplicates issues in wishlist --------------------

  import { auth } from "./admin.js";
  import { db } from "./admin.js";
  import {
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
    getDocs,
    collection
  } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
  
  
  
  import { loggedInUserId } from "./movies.js";
  
  // ************************** Wishlist Functions **************************
  
  // Function to fetch and display the user's wishlist
  async function fetchWishlist(userId) {
    const userRef = doc(db, "users", userId);
  
    try {
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.warn("User document not found.");
        alert("User not found. Please contact support.");
        return;
      }
  
      const userData = userSnap.data();
      const wishlist = userData.wishlist || []; // Default to empty array
  
      const wishlistMoviesList = document.getElementById("wishlist-movies");
      wishlistMoviesList.innerHTML = ""; // Clear previous list
  
      // Fetch all movies from "movies" collection
      const moviesSnap = await getDocs(collection(db, "movies"));
      const movies = [];
      moviesSnap.forEach((doc) => {
        const movie = doc.data();
        if (wishlist.includes(movie.name)) {
          movies.push(movie);
        }
      });
  
      // Render movies in the wishlist
      if (movies.length > 0) {
        movies.forEach((movie) => {
          const movieCard = document.createElement("div");
          // movieCard.className = "movie-card";
         movieCard.innerHTML="" // clear existing elements
          movieCard.innerHTML =  `
          <img src="${movie.image}" alt="${movie.name}" >
          <p><strong>Genre:</strong> ${movie.genre || "N/A"}</p>
          ${
              loggedInUserId
                ? `<a href="./movie-details.html?name=${encodeURIComponent(
                    movie.name
                  )}" class="btn" >Watch Now</a>`
                : `<a href="./movie-details.html?name=${encodeURIComponent(
                    movie.name
                  )}"  >Watch Trailer</a>`
            }
          <button class="remove-btn">Remove</button>
      `;
  
          // Add remove functionality             
          movieCard
            .querySelector(".remove-btn")
            .addEventListener("click", () =>
              removeMovieFromWishlist(userId, movie.name)
            );
  
          wishlistMoviesList.appendChild(movieCard);
        });
      } else {
        wishlistMoviesList.innerHTML = "<p>No matching movies found in your wishlist.</p>";
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      // alert("Failed to load the wishlist. Please try again.");
    }
  }
  
  // Function to remove a movie from the wishlist
  async function removeMovieFromWishlist(userId, movieName) {
    const userRef = doc(db, "users", userId);
  
    try {
      await updateDoc(userRef, {
        wishlist: arrayRemove(movieName),
      });
  
      console.log(`Movie "${movieName}" removed from wishlist.`);
      fetchWishlist(userId); // Refresh wishlist after removal
    } catch (error) {
      console.error("Error removing movie:", error);
      alert("Failed to remove movie. Please try again.");
    }
  }
  
  // ************************** Event Listeners **************************
  
  // Use event delegation for dynamically generated "Watch Later" buttons
  document.body.addEventListener("click", async (event) => {
  
    if (event.target.classList.contains("watch-later-btn")) {
      event.target.textContent = "added in Wishlist"
      const movieName = event.target.getAttribute("data-movie-id");
      const userId = localStorage.getItem("loggedInUserId");
  
      if (!userId) {
        alert("Please log in to add movies to your wishlist.");
        return;
      }
  
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const subscriptionPlan = userData.subscriptionPlan || "free";
  
        // Check subscription plan
        if (subscriptionPlan === "free") {
          alert("Upgrade to a premium plan to add movies to your wishlist.");
          return;
        }
  
        // Check if the movie already exists in the wishlist
        if (userData.wishlist && userData.wishlist.includes(movieName)) {
         
          alert(`This movie is already in your wishlist. ${userData.wishlist.movieName}`);
          return;
        }
  
        // Add movie to wishlist
        try {
          await updateDoc(userRef, {
            wishlist: arrayUnion(movieName),
          });
          console.log(`Movie ${movieName} added to wishlist.`);
          alert("Movie added to your wishlist!");
          fetchWishlist(userId); // Refresh wishlist
        } catch (error) {
          console.error("Error adding movie to wishlist:", error);
        }
      }
    }
  });
  
  // Handle auth state change
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userId = user.uid;
      console.log("Logged-in User ID:", userId);
      const userPlanElement = document.getElementById('user-plan');
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const subscriptionPlan = userData.subscriptionPlan || "free";
  
        document.getElementById("user-name").innerText = `Name: ${userData.Username || "No name"}`;
        document.getElementById("user-email").innerText = `Email: ${user.email}`;
        userPlanElement.innerText = `Plan: ${subscriptionPlan}`;
  
        fetchWishlist(userId); // Fetch wishlist for eligible users
        // Show subscription info
        if (subscriptionPlan == "free") {
  
        // Check if the user is eligible for the "Premium" plan
        document.getElementById('wishlist-section').style.display = 'none';
        document.getElementById("details").style.display = 'block';
          document.querySelector('.pricing-section').style.display = 'block';
        } else {
          document.getElementById("details").style.display = 'block';
          document.getElementById('wishlist-section').style.display = 'block';
          document.querySelector('.pricing-section').style.display = 'none';
          // document.querySelector('.pricing-section').style.display = 'block';
          // document.getElementById('subscription-upgrade').style.display = 'block';
          
          fetchWishlist(userId); // Fetch wishlist for eligible users
        }
  // here place to start feature request to update the subscription
      } else {
        console.warn("User document not found.");
      }
    } else {
      alert("User not logged in. Redirecting...");
    }
  });
  // ---------------------------------------------------------------- 
  // Wait until the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners to all subscription buttons
    document.querySelectorAll('.Subscription-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        // Find the closest card and extract details
        const card = e.target.closest('.card');
        const planName = card.querySelector('h2').textContent;
        const price = card.querySelector('.price').textContent;
  
        // Update the subscription details in the upgrade div
        document.getElementById("userPlan").textContent = `Price: ${price} / Duration: ${planName}`;
  
  
  
        // Dim the body and show the subscription-upgrade div
        const detailsDisplay=document.getElementById("details");
        detailsDisplay.style.display="none";
        detailsDisplay.classList.add(".details-display");
        const upgradeDiv = document.getElementById('subscription-upgrade');
        upgradeDiv.style.display="block";
  
    
      });
    });
  
    // Add event listener for the close button
    document.getElementById("closeSubscription").addEventListener('click', () => {
      // Remove the dimmed class from the body
      const detailsDisplay=document.getElementById("details");
      detailsDisplay.style.display="block";
  
  
      // Hide the subscription-upgrade div
      const upgradeDiv = document.getElementById('subscription-upgrade');
      upgradeDiv.style.display="none";
  
  
        document.getElementById("paymentForm").reset(); // Ensure the form ID matches
    });
  });
  
  
  // ************************** Subscription Plan Upgrade (via Dropdown) **************************
  document.getElementById("paymentSubmit").addEventListener("click", async (e) => {
    e.preventDefault();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const expirationDate = document.getElementById("expirationDate").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const nameOnCard = document.getElementById("nameOnCard").value.trim();
    // const agree = document.getElementById("agree").checked;
    const userId = localStorage.getItem("loggedInUserId");
    const subscriptionPlan = document.getElementById("userPlan").textContent;
    console.log(subscriptionPlan);
    
  
    // Clear previous errors
    document.getElementById("cardNumberError").style.display = "none";
    document.getElementById("expirationDateError").style.display = "none";
    document.getElementById("cvvError").style.display = "none";
    document.getElementById("nameOnCardError").style.display = "none";
  
    if (!ValidatePaymentForm(cardNumber, expirationDate, cvv, nameOnCard)) {
      return;
    }
  
    // if (!agree) {
    //   alert("You must agree to the terms and conditions.");
    //   return;
    // }
  
    if (!userId) {
      alert("Please log in to change your subscription plan.");
      return;
    }
  
    if (!subscriptionPlan) {
      alert("Please select a subscription plan.");
      return;
    }
  
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) {
      console.warn("User document not found.");
      return;
    }
  
    const userData = userSnap.data();
    if (userData.cardNumber === cardNumber) {
      alert("This card number is already in use.");
      return;
    }
  
    try {
      await updateDoc(userRef, {
        cardNumber: cardNumber,
        expirationDate: expirationDate,
        cvv: cvv,
        nameOnCard: nameOnCard,
        subscriptionPlan: subscriptionPlan.toString()
      });
  
      alert("Payment information saved successfully!");
      document.getElementById("paymentForm").reset(); // Ensure the form ID matches
      fetchWishlist(userId); // Fetch wishlist for eligible users
    } catch (error) {
      console.error("Error upgrading plan:", error.message);
      alert("Failed to upgrade plan. Please try again.");
    }
  });
  
  function ValidatePaymentForm(cardNumber, expirationDate, cvv, nameOnCard) {
    const cardNumberPattern = /^(\d{16}|\d{4}-\d{4}-\d{4}-\d{4})$/;
    const expirationPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3,4}$/;
    const nameOnCardPattern = /^[A-Za-z\s]+$/;
  
    let valid = true;
  
    // Clear previous errors
    document.getElementById("cardNumberError").style.display = "none";
    document.getElementById("expirationDateError").style.display = "none";
    document.getElementById("cvvError").style.display = "none";
    document.getElementById("nameOnCardError").style.display = "none";
  
    if (!cardNumber || !cardNumberPattern.test(cardNumber)) {
      document.getElementById("cardNumberError").textContent = cardNumber
        ? "Invalid card number."
        : "Card Number is required.";
      document.getElementById("cardNumberError").style.display = "block";
      valid = false;
    }
  
    if (!expirationDate || !expirationPattern.test(expirationDate)) {
      document.getElementById("expirationDateError").textContent = expirationDate
      
        ? "Invalid expiration date." 
        : "Expiration Date is required.";
      document.getElementById("expirationDateError").style.display = "block";
      valid = false;
    }
  
    if (!cvv || !cvvPattern.test(cvv)) {
      document.getElementById("cvvError").textContent = cvv
        ? "Invalid CVV."
        : "CVV is required.";
      document.getElementById("cvvError").style.display = "block";
      valid = false;
    }
  
    if (!nameOnCard || !nameOnCardPattern.test(nameOnCard)) {
      document.getElementById("nameOnCardError").textContent = nameOnCard
        ? "Invalid name on card."
        : "Name on Card is required.";
      document.getElementById("nameOnCardError").style.display = "block";
      valid = false;
    }
  
    return valid;
  }
  

  // ------------CHANGES TO INDEX PAGE IN DIFFERENT IN WISHLIST------------

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
    const moviesCollection = collection(db, "movies");
    const snapshot = await getDocs(moviesCollection);
    moviesCache = snapshot.docs.map((doc) => doc.data());
  }
  return moviesCache;
};

// Upload movies from JSON file to Firebase
(async () => {
  try {
    const response = await fetch("../data/movies.json");
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
const renderAllMovies = (movies) => {
  const carouselMoviesContainer = document.getElementById("movies");
  carouselMoviesContainer.innerHTML = ""; // Clear container

  let htmlContent = "";
  movies.forEach((movie) => {
    const buttonLabel = loggedInUserId ? "More Info" : "More info";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="swiper-slide">
        <img src="${movie.image}" alt="${movie.name} poster">
        <div class="movie-details">
          <h2 class="view"><span>Movie:</span> ${movie.name}</h2>
          <p class="hide"><span>Description:</span> ${movie.description}</p>
         <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>

        </div>
      </div>`;
  });

  carouselMoviesContainer.innerHTML = htmlContent;
};

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

  const topRatedMovies = movies.filter((movie) => parseFloat(movie.rating) >= 5.0);

  let htmlContent = "";
  topRatedMovies.forEach((movie) => {
    const buttonLabel = loggedInUserId ?  "More Info" : "More info";
    const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
    const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
    htmlContent += `
      <div class="favorite-item">
        <img src="${movie.image}" alt="${movie.name} poster">
        <h1 class="view">${movie.name}</h1>
        <h2>${movie.rating}</h2>
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
              <h2>${movie.rating}</h2>
              <p><span>Genre:</span> ${genre}</p>
              <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>
            </div>`;

          genreContainer.innerHTML += movieHtml;
          renderedMovies.add(movie.name); // Mark as rendered
        }
      });
    }
  });
};

// Fetch movies and render all sections
fetchMovies()
  .then((movies) => {
    renderAllMovies(movies);
    renderNewReleased(movies);
    renderTopRated(movies);
    renderByGenres(movies);
  })
  .catch((err) => console.error("Error rendering movies:", err));


  // -----------carousel issues------------------------

  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PLAY FLIX</title>
    <link rel="stylesheet" href="./styles/discovery.css" />

    <!-- FONT AWESOME JAVASCRIPT -->

    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
    />
    <!-- Link Swiper's CSS -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"

    />


    
    <!-- admin js -->
    <script   type="module"  src="./scripts/admin.js" defer ></script>

    <!-- MOVIESLIST JAVASCRIPT -->
    <script type="module" src="./scripts/movies.js" defer></script>

    <!-- search bar JAVASCRIPT -->
    <script type="module"   src="./scripts/searchAndfilter.js" defer></script>

    <!-- Add wishlist-->
  <script type="module" src="./scripts/userAndtheirMovies.js" defer></script>
   
  </head>

  <body>
    
    <header>
      <a href="#" class="logo">
        <i class="fa-solid fa-clapperboard"></i> PLAY FLIX</a>
      
      <!-- <div class="hamburger">
          <i class="fa-solid fa-bars"></i></div> -->

      <ul class="Navbar">
        <li><a href="#" class="home-active">HOME</a></li>

        <li><a href="#genre">GENRES</a></li>
        <li><a href="#favorite">TOP RATED</a></li>
        <li><a href="#newRelease">NEW RELEASED</a></li>
      </ul>
      <div class="search-bar">
        <input
          id="search-input"
          type="text"
          placeholder="Search for movies..."
        />
        <button id="search-button">🔍</button>
        <!-- Default icon as a search icon -->
      </div>
      <div class="profile">
        <a id="logout">LOGOUT</a>
        <a href="./pages/login.html" target="_self" id="login">Login</a>
        
        <a  id="icon" href="./pages/user-detailAndMovies.html"> <i  class="fa-regular fa-user"></i></a>
        <div id="users"></div>
      </div>
    </header>
    <div id="display" style="display: none">
      <h1>Movie Search Results</h1>
      <div id="result-container">
        <div class="Card" id="results"></div>
      </div>
      <!-- <div id="video-container" ></div> -->
    </div>
    <!-- Swiper Carousel -->
    <section class="swiper">
      <div id="movies" class="swiper-wrapper"></div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-pagination"></div>
    </section>

    <section id="catogery">
      <h1>CATEGORIES</h1>
      <div id="genre"  class="genre">
        <h3>GENRES</h3>
        <div class="genre-list">
          <div class="genre-item">
            <div class="image-container">
              <img src="./assets/images/horror.jpg" alt="Action" />
              <div class="image-description">
                <a href="." class="btn explore-button" >Explore more>></a>
              </div>
            </div>
            <h2>Action</h2>
          </div>
          <!-- Section for dynamically added items -->
          <div class="expanded-items hidden" id="action-container">
            <!-- <div class="movie-item"></div> -->
          </div>

          <div class="genre-item">
            <div class="image-container">
              <img src="./assets/images/drama.jpg" alt="Comedy" />
              <div class="image-description">
                <a href="." class="btn explore-button">Explore more>></a>
              </div>
            </div>
            <h2>Comedy</h2>
          </div>
          <!-- Section for dynamically added items -->
          <div class="expanded-items hidden" id="comedy-container"></div>

          <div class="genre-item">
            <div class="image-container">
              <img src="./assets/images/thriller.jpg" alt="Drama" />
              <div class="image-description">
                <a href="." class="btn explore-button">Explore more>></a>
              </div>
            </div>
            <h2>Drama</h2>
          </div>
          <!-- Section for dynamically added items -->
          <div class="expanded-items hidden" id="drama-container"></div>

            <!-- <div class="genre-item">
              <div class="image-container">
                <img src="../assets/images/thriller.jpg" alt="Horror" />
                <div class="image-description">

                  <a href="#"  class="btn explore-button">Explore more>></a>
                </div>
              </div>
                <h2>Horror</h2>
            </div>
                  
        <div class="expanded-items hidden"  id="horror-container">
          
       
      </div> -->
            <!-- <div class="genre-item">
              <div class="image-container">
                <img src="../assets/images/action.jpg" alt="Science Fiction" />
                <div class="image-description">

                  <a href="#" class="btn explore-button">Explore more>></a>
                </div>
              </div>
                <h2>Science Fiction</h2>
            </div>
                  
        <div class="expanded-items hidden" id="scifi-container"></div> -->
         
          
      
            <!-- <div class="genre-item">
              <div class="image-container">
                <img src="../assets/images/thriller.jpg" alt="Thriller" />
                <div class="image-description">

                  <a href="#"  class="btn explore-button">Explore more>></a>
                </div>

              </div>
                <h2>Thriller</h2>
            </div>
                  
        <div class="expanded-items hidden" id="thriller-container">
          
         
      </div>
            <div class="genre-item">
                
                <div class="image-container">
                  <img src=" ../assets/images/horror.jpg" alt="Thriller" />
                  <div class="image-description">

                    <a href="#"  class="btn explore-button">Explore more>></a>
                  </div>
  
                </div>
                <h2>Fantasy</h4>

            </div>
                  
        <div class="expanded-items hidden"  id="fantasy-container"> -->
         
          
      </div>
        </div>
      </div>
    </section>
      <div id="favorite">
        <h3>TOP RATED MOVIES</h3>
        <div id="movies-list" class="favorite-list"></div>
        <!-- id for fetching    class  for style-->
      </div>
      <div></div>

      <div id="newRelease">
        <h3>NEW RELEASED</h3>
        <div id="newReleasedmovies-list" class="newReleased-list"></div>
      </div>
  
   
    <footer>
      <p>&#169; PLAY FLIX ALL RIGHTS ARE RESERVED.</p>

      <!-- <p>PRIVACY</p>
      <p>TERMS</p>
      <p>HELPS</p>
      <p>DEVICES</p> -->

      <div>
        <!-- Youtube -->
        <a
          href="https://www.youtube.com/account"
          target="_blank"
          class="youtube-icon"
        >
          <i class="fab fa-youtube"></i>
        </a>
        <!-- Twitter -->
        <a href="https://x.com/" target="_blank" class="twitter">
          <i class="fab fa-twitter"></i>
        </a>

        <!-- Facebook -->
        <a
          href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F"
          target="_blank"
          class="facebook"
        >
          <i class="fab fa-facebook"></i>
        </a>

        <!-- Instagram -->
        <a href="https://www.instagram.com" target="_blank" class="instagram">
          <i class="fab fa-instagram"></i>
        </a>
      </div>
    </footer>

    <script src="https://vjs.zencdn.net/7.20.3/video.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js" ></script>
    <script src="https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js" ></script>
    <script>
      const swiper = new Swiper(".swiper", {
        loop: false,
        autoplay: {
          delay: 1000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
      });
    </script>
    <script>
/// JavaScript code


document.addEventListener("DOMContentLoaded", function () {
  // Get all explore buttons
  const exploreButtons = document.querySelectorAll(".explore-button");
  const genreItems = document.querySelectorAll(".genre-item");

  exploreButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent default link behavior

      // Get the genre container (parent div) and its related expanded-items container
      const genreItem = button.closest(".genre-item");
      const genreId = genreItem.querySelector("img").alt.toLowerCase() + "-container";
      const expandedItems = document.getElementById(genreId);

      // Hide all other expanded items and reset their buttons
      genreItems.forEach((item) => {
        const otherGenreId = item.querySelector("img").alt.toLowerCase() + "-container";
        const otherExpandedItems = document.getElementById(otherGenreId);
        const otherButton = item.querySelector(".explore-button");

        if (otherExpandedItems && otherGenreId !== genreId) {
          otherExpandedItems.classList.add("hidden");
          otherButton.textContent = "Explore more>>";
          item.style.display = "flex"; // Show other items
        }
      });

      // Toggle visibility and button text for the clicked genre item
      if (expandedItems) {
        if (expandedItems.classList.contains("hidden")) {
          expandedItems.classList.remove("hidden");
          button.textContent = "Show less";
          genreItems.forEach((item) => {
            if (item !== genreItem) {
              item.style.display = "none"; // Hide other items
            }
          });
        } else {
          expandedItems.classList.add("hidden");
          button.textContent = "Explore more>>";
          genreItems.forEach((item) => {
            item.style.display = "flex"; // Show all items
          });
        }
      }
    });
  });
});


    </script>
   
     
    
  </body>
</html>


// ------carosuel js file --------------------------------

/ Render all movies
  const renderAllMovies = (movies) => {
    const carouselMoviesContainer = document.getElementById("movies");
    carouselMoviesContainer.innerHTML = ""; // Clear container
  
    let htmlContent = "";
    movies.forEach((movie) => {
      const buttonLabel = loggedInUserId ? "More Info" : "More info";
      const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
      const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;
      htmlContent += `
        <div class="swiper-slide">
          <img src="${movie.image}" alt="${movie.name} poster">
          <div class="movie-details">
            <h2 class="view"><span>Movie:</span> ${movie.name}</h2>
            <p class="hide"><span>Description:</span> ${movie.description}</p>
           <div class="buttons">
                ${buttonHTML}
               <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
               </div>
  
          </div>
        </div>`;
    });
  
    carouselMoviesContainer.innerHTML = htmlContent;
  };