// *************** Initialize Firebase ****************************
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, setDoc, doc, collection, getDocs, getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
  getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { loggedInUserId } from "./movie.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3VZw2WEmDvMXyFEbpc00umhEykmmY8N8",
  authDomain: "login-form-f5168.firebaseapp.com",
  projectId: "login-form-f5168",
  storageBucket: "login-form-f5168.appspot.com",
  messagingSenderId: "374763286727",
  appId: "1:374763286727:web:b9773388aadfbd40cd8ee2"
};

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// *************** Fetch Logged-in User Data ****************************
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid; // Get the user's UID
    console.log("Logged-in User ID:", userId);

    try {
      const docRef = doc(db, "users", userId); // Reference to the user's document
      const docSnap = await getDoc(docRef);   // Fetch the document
      const userDetails = document.getElementById("users");

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User Data:", userData.Username);
        userDetails.innerHTML = `
          <h3 class="userName">${userData.Username}</h3>`;
      } else {
        console.warn("No such document found for the user!");
        userDetails.innerHTML = `
          <h3 class="userName">Welcome, Guest</h3>`;
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  } else {
    console.log("No user is signed in.");
  }

  // Toggle Login and Logout UI
  if (loggedInUserId) {
    const hideLogin = document.getElementById('login');
    if (hideLogin) hideLogin.style.display = "none";
  } else {
    const hideLogout = document.getElementById('logout');
    const hideIcon = document.getElementById('icon');

    if (hideLogout) hideLogout.style.display = "none";
    if (hideIcon) hideIcon.style.display = "none";
  }

  // Logout functionality
  document.getElementById('logout')?.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        alert('User logged out successfully!');
        window.location.href = './index.html';
        localStorage.clear();
        console.log("Local storage has been cleared.");
      })
      .catch((error) => {
        console.error('Error logging out:', error.message);
      });
  });
});

// *************** Upload Movies to Firestore ****************************
const collectionRef = collection(db, "movies");

function uploadMoviesFromJSON() {
  fetch('../data/movies.json')
    .then((response) => response.json())
    .then((moviesData) => {
      moviesData.forEach(async (movie) => {
        try {
          await setDoc(doc(collectionRef, movie.id.toString()), movie);
          console.log(`Movie Uploaded: ${movie.title}`);
        } catch (error) {
          console.error("Error uploading movie:", error);
        }
      });
    })
    .catch((error) => console.error("Error loading JSON file:", error));
}

uploadMoviesFromJSON();

// *************** Fetch and Display Movies ****************************
function fetchAndDisplayMovies() {
  const videoContainer = document.getElementById("movies");
  let htmlContent = "";

  getDocs(collectionRef)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const movie = doc.data();

        htmlContent += `
          <div class="swiper-slide">
            <img src="${movie.poster}" alt="${movie.title} poster">
            <div class="movie-details">
              <h2 class="view"><span>Movie:</span> ${movie.title}</h2>
              <p class="hide"><span>Description:</span> ${movie.description}</p>
              ${
                loggedInUserId
                  ? `<a href="#" class="btn" data-videolink="${movie.videolink}" data-poster="${movie.poster}">Watch Now</a>`
                  : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
              }
            </div>
          </div>`;
      });

      videoContainer.innerHTML = htmlContent;
    })
    .catch((error) => {
      console.error("Error fetching movies:", error);
      videoContainer.innerHTML = "<p>Error loading movies. Please try again later.</p>";
    });
}

fetchAndDisplayMovies();
