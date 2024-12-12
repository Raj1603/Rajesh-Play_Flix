 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
 import{getFirestore,setDoc, doc,collection,getDocs} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js" ;
 // TODO: Add SDKs for Firebase products that you want to use
 import {loggedInUserId}from "./movies.js";



 // Your web app's Firebase configuration
 const firebaseConfig = {
   apiKey: "AIzaSyCEximerMkuSZVNY_WlHioJelJCiV48okY",
   authDomain: "movies-list-934e9.firebaseapp.com",
   projectId: "movies-list-934e9",
   storageBucket: "movies-list-934e9.firebasestorage.app",
   messagingSenderId: "68089362700",
   appId: "1:68089362700:web:f3758978116a32c31b3129"
 };
const app = initializeApp(firebaseConfig);
const db3 = getFirestore(app);
// const db4 = getFirestore(app);
// const db5 = getFirestore(app);



// //************************************ACTIONS MOVIES******************** */

// const genresActionCollectionRef = collection(db3, "genresAction");


// // Function to fetch JSON file and upload movies to Firestore
// function uploadgenresActionMoviesFromJSON() {
//     fetch('../data/genres/action.json')
//       .then(response => response.json())
//       .then(moviesData => {
//         // Use a for loop to upload each movie
//         for (let i = 0; i < moviesData.length; i++) {
//           setDoc(doc(genresActionCollectionRef, moviesData[i].id.toString()), moviesData[i])
//             .then(() => console.log(`Uploaded genresAction movies: ${moviesData[i].title}`))
//             .catch(error => console.error("Error uploading genresAction movie:", error));
//         }
//       })
//       .catch(error => console.error("Error loading JSON file:", error));
//   }
  
//   // Call the upload function
//   uploadgenresActionMoviesFromJSON();

  
// //************************************DRAMA MOVIES******************** */

// const genresDramaCollectionRef = collection(db4, "genresDrama");


// // Function to fetch JSON file and upload movies to Firestore
// function uploadgenresDramaMoviesFromJSON() {
//     fetch('../data/genres/drama.json')
//       .then(response => response.json())
//       .then(moviesData => {
//         // Use a for loop to upload each movie
//         for (let i = 0; i < moviesData.length; i++) {
//           setDoc(doc(genresDramaCollectionRef, moviesData[i].id.toString()), moviesData[i])
//             .then(() => console.log(`Uploaded genresDrama movies: ${moviesData[i].title}`))
//             .catch(error => console.error("Error uploading genresDrama movie:", error));
//         }
//       })
//       .catch(error => console.error("Error loading JSON file:", error));
//   }
  
//   // Call the upload function
//   uploadgenresDramaMoviesFromJSON();

//   //************************************COMEDY MOVIES******************** */

// const genresComedyCollectionRef = collection(db5, "genresComedy");


// // Function to fetch JSON file and upload movies to Firestore
// function uploadgenresComedyMoviesFromJSON() {
//     fetch('../data/genres/comedy.json')
//       .then(response => response.json())
//       .then(moviesData => {
//         // Use a for loop to upload each movie
//         for (let i = 0; i < moviesData.length; i++) {
//           setDoc(doc(genresComedyCollectionRef, moviesData[i].id.toString()), moviesData[i])
//             .then(() => console.log(`Uploaded genresComedy movies: ${moviesData[i].title}`))
//             .catch(error => console.error("Error uploading genresComedy movie:", error));
//         }
//       })
//       .catch(error => console.error("Error loading JSON file:", error));
//   }
  
//   // Call the upload function
//   uploadgenresComedyMoviesFromJSON();


// JavaScript for toggling visibility and fetching data dynamically
document.addEventListener("DOMContentLoaded", () => {
    const exploreButtons = document.querySelectorAll(".explore-button");
  
    // Map genre names to their Firebase collections
    const genreCollectionMap = {
      Action: "genresAction",
      Comedy: "genresComedy",
      Drama: "genresDrama",
    };
  
    exploreButtons.forEach((button, index) => {
      button.addEventListener("click", async () => {
        // Get the genre from the associated <h2>
        const genreName = button.closest(".genre-item").querySelector("h2").textContent.trim();
        const expandedItems = document.querySelectorAll(".expanded-items")[index];
  
        // Toggle visibility
        const isHidden = expandedItems.classList.toggle("hidden");
  
        // Update button text
        button.textContent = isHidden ? "Explore more >>" : "Show less <<";
  
        // If showing, fetch movies and display them
        if (!isHidden) {
          try {
            const collectionName = genreCollectionMap[genreName];
            if (!collectionName) {
              console.warn(`No Firebase collection mapped for genre: ${genreName}`);
              return;
            }
  
            // Clear previous content
            expandedItems.innerHTML = "<p>Loading movies...</p>";
  
            // Fetch movies from Firebase
            const querySnapshot = await getDocs(collection(db3, collectionName));
            let htmlContent = "";
  
            querySnapshot.forEach((doc) => {
              const movie = doc.data();
  
              // Validate data
              if (!movie.poster || !movie.title || !movie.videolink) {
                console.warn(`Incomplete movie data for genre ${genreName}:`, movie);
                return;
              }
  
              // Build movie item HTML
              htmlContent += `
                <div class="movie-item">
                  <img src="${movie.poster}" alt="${movie.title} poster">
                  <h3>${movie.title}</h3>
                ${ loggedInUserId ? `<a href="#" class="btn" data-videolink="${movie.videolink}" data-poster="${movie.poster}">Watch Now</a>`:` <a href="${movie.videolink}" target="_self">Watch Trailer</a>`}
                </div>`;
            });
  
            // Update content
            expandedItems.innerHTML = htmlContent || "<p>No movies available.</p>";
          } catch (error) {
            console.error(`Error fetching movies for genre ${genreName}:`, error);
            expandedItems.innerHTML = "<p>Error loading movies. Please try again later.</p>";
          }
        }
      });
    });
  });
  