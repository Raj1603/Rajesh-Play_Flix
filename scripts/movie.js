
//   // Import the functions you need from the SDKs you need
//   import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
//   import{getFirestore,setDoc, doc,collection,getDocs} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js" ;
//   // TODO: Add SDKs for Firebase products that you want to use
// //   export const loggedInUserId=localStorage.getItem("loggedInUserId");
// // console.log(loggedInUserId);


//   // Your web app's Firebase configuration
//   const firebaseConfig = {
//     apiKey: "AIzaSyCEximerMkuSZVNY_WlHioJelJCiV48okY",
//     authDomain: "movies-list-934e9.firebaseapp.com",
  

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);

  



// // *************** Upload Movies to Firestore ****************************
// const db0 = getFirestore(app);

// const collectionRef = collection(db0, "movies");

// // function uploadMoviesFromJSON() {
// //   fetch('../data/movies.json')
// //     .then((response) => response.json())
// //     .then((moviesData) => {
// //       moviesData.forEach(async (movie) => {
// //         try {
// //           await setDoc(doc(collectionRef, movie.id.toString()), movie);
// //           console.log(` CAROUSEL MOVIES : ${movie.title}`);
// //         } catch (error) {
// //           console.error("Error uploading movie:", error);
// //         }
// //       });
// //     })
// //     .catch((error) => console.error("Error loading JSON file:", error));
// // }

// // uploadMoviesFromJSON();

// // *************** Fetch and Display Movies ****************************
// function fetchAndDisplayMovies() {
//   const videoContainer = document.getElementById("movies");
//   let htmlContent = "";

//   getDocs(collectionRef)
//     .then((querySnapshot) => {
//       querySnapshot.forEach((doc) => {
//         const movie = doc.data();

//         htmlContent += `
//           <div class="swiper-slide">
//             <img src="${movie.poster}" alt="${movie.title} poster">
//             <div class="movie-details">
//               <h2 class="view"><span>Movie:</span> ${movie.title}</h2>
//               <p class="hide"><span>Description:</span> ${movie.description}</p>
//               ${
//                 loggedInUserId
//                   ? `<a href='/pages/movie-details.html?id=${movie.id}'" class="btn" data-videolink="${movie.videolink}" data-poster="${movie.poster}">Watch Now</a>`
//                   : `<a href="${movie.videolink}" target="_self">Watch Trailer</a>`
//               }
//             </div>
//           </div>`;
//       });

//       videoContainer.innerHTML = htmlContent;
//     })
//     .catch((error) => {
//       console.error("Error fetching movies:", error);
//       videoContainer.innerHTML = "<p>Error loading movies. Please try again later.</p>";
//     });
// }

// fetchAndDisplayMovies();

// //***********************************FAVORITE MOVIES******************** */


// const db1 = getFirestore(app);

// const collectionRef1 = collection(db1, "favoriteMovies");


// // // Function to fetch JSON file and upload movies to Firestore
// // function uploadMoviesFromJSON() {
// //     fetch('../data/favoriteMovies.json')
// //       .then(response => response.json())
// //       .then(moviesData => {
// //         // Use a for loop to upload each movie
// //         for (let i = 0; i < moviesData.length; i++) {
// //           setDoc(doc(collectionRef1, moviesData[i].id.toString()), moviesData[i])
// //             .then(() => console.log(`Uploaded favorite movies: ${moviesData[i].title}`))
// //             .catch(error => console.error("Error uploading movie:", error));
// //         }
// //       })
// //       .catch(error => console.error("Error loading JSON file:", error));
// //   }
  
// //   // Call the upload function
// //   uploadMoviesFromJSON();

//   // Function to fetch and display movies from Firestore

// function fetchAndDisplayfavoriteMovies() {
//   const videoContainer = document.getElementById("movies-list");
//   let htmlContent = "";

//   getDocs(collectionRef1)
//     .then((querySnapshot) => {
//       const docs = querySnapshot.docs;

//       for (let i = 0; i < docs.length; i++) {
//         const movie = docs[i].data();

//         // Build the HTML content
//         htmlContent += `
//                 <div class="favorite-item">
//                    <img src="${movie.poster}" alt="${movie.title} poster" ">
//                   <h1 class="view">${movie.title}</h1>
                    
//                  ${ loggedInUserId ? `<a href="#" class="btn" data-videolink="${movie.videolink}" data-poster="${movie.poster}">Watch Now</a>`:` <a href="${movie.videolink}" target="_self">Watch Trailer</a>`}
//                   </div>        
//         `;
//       }
    
//       // ref-- <p class="hide">${movie.description}</p>



//       // Set the container's innerHTML
//       videoContainer.innerHTML = htmlContent;
//     })
//     .catch((error) => {
//       console.error("Error fetching movies:", error);
//       videoContainer.innerHTML = "<p>Error loading movies. Please try again later.</p>";
//     });
// }

// // Call the function to fetch and display movies
// fetchAndDisplayfavoriteMovies();


// // *****************************NEW RELEASED MOVIES**************


// const db2 = getFirestore(app);


// //   // Firebase Firestore reference
//   // const collectionRef2 = collection(db2, "newMovies");

// //   // Function to fetch JSON file and upload movies to Firestore
// // function uploadNewMoviesFromJSON() {
// //   fetch('../data/newMovies.json')
// //     .then(response => response.json())
// //     .then(moviesData => {
// //       // Use a for loop to upload each movie
// //       for (let i = 0; i < moviesData.length; i++) {
// //         setDoc(doc(collectionRef2, moviesData[i].id.toString()), moviesData[i])
// //           .then(() => console.log(`Uploaded New released movies: ${moviesData[i].title}`))
// //           .catch(error => console.error("Error uploading movie:", error));
// //       }
// //     })
// //     .catch(error => console.error("Error loading JSON file:", error));
// // }

// // // Call the upload function
// // uploadNewMoviesFromJSON();



// // Call the function to fetch and display New Movies
// fetchAndDisplayNewMovies();

// // Function to fetch and display New Movies with video playback
// function fetchAndDisplayNewMovies() {
//   const videoContainer = document.getElementById("newReleasedmovies-list");
//   let htmlContent = "";

//   getDocs(collection(db2, "newMovies"))
//     .then((querySnapshot) => {
//       const docs = querySnapshot.docs;

//       for (let i = 0; i < docs.length; i++) {
//         const movie = docs[i].data();

//         // Build the HTML content for each movie
//         htmlContent += `
//           <div class="released-item">
         
//             <img src="${movie.poster}" alt="${movie.title} poster">
//             <h1 class="view">${movie.title}</h1>
          
//               ${ loggedInUserId ? `<a href="#" class="btn" data-videolink="${movie.videolink}" data-poster="${movie.poster}">Watch Now</a>`:` <a href="${movie.videolink}"  class="btn" target="_self">Watch Trailer</a>`}
           
           
//           </div>
//         `;
//       }
  
   

//       //  ref  --    <p class="hide">${movie.description}</p>
//       // Set the HTML content to the container
//       videoContainer.innerHTML = htmlContent;

//     })
//     .catch((error) => {
//       console.error("Error fetching movies:", error);
//       videoContainer.innerHTML = "<p>Error loading movies. Please try again later.</p>";
//     });
// }

// // // Function to dynamically create and display the video player
// // function playVideo(videoLink, posterImage = "") {
// //   const videoContainer = document.getElementById("video-container");

   
     
// //   // Validate the video link
// //   if (!videoLink) {
// //     console.error("Video link is missing or invalid.");
// //     videoContainer.innerHTML = `<p>Video source unavailable.</p>`;
// //     return;
// //   }
   

// //   // Generate the video player
// //   videoContainer.innerHTML = `
// //     <video
// //       id="my-video"
// //       class="video-js"
// //       controls
// //       preload="auto"
// //       width="640"
// //       height="360"
// //       ${posterImage ? `poster="${posterImage}"` : ""}
// //       data-setup="{}"
// //     >
// //       <source src="${videoLink}" type="video/mp4" />
// //       <p class="vjs-no-js">
// //         To view this video please enable JavaScript, and consider upgrading to a
// //         web browser that
// //         <a href="https://videojs.com/html5-video-support/" target="_blank">
// //           supports HTML5 video
// //         </a>.
// //       </p>
// //     </video>
// //   `;
// // }

// // // Attach event listeners to "Watch Now" buttons
// // addEventListenersToButtons();

// // // Function to add event listeners to "Watch Now" buttons
// // function addEventListenersToButtons() {
// //   const buttons = document.querySelectorAll(".btn");

// //   buttons.forEach((button) => {
// //     button.addEventListener("click", (event) => {
// //       event.preventDefault(); // Prevent anchor tag default action

// //       // Get video link and optional poster image from data attributes
// //       const videoLink = button.getAttribute("data-videolink");
// //       const posterImage = button.getAttribute("data-poster");

// //       // Play the video
// //       playVideo(videoLink, posterImage);
// //     });
// //   });
// // }






