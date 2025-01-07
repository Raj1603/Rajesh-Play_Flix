// Import Firebase services
import { db } from "./admin.js";
import {  collection, getDocs,getDoc,doc, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { loggedInUserId } from "./movies.js";

const userId=loggedInUserId;
// 


(async () => {
    async function displayMovieDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieTitle = urlParams.get('name');
        if (!movieTitle) {
            document.getElementById('movie-details-container').innerHTML = '<p>Movie not found.</p>';
            return;
        }

        try {
            // Check if the user is logged in
            if (!loggedInUserId) {
                document.getElementById('movie-details-container').innerHTML = `
                    <p><strong>You must be logged in to view movie details.</strong></p></br> 
                    <div class="video-btns" style="padding: 20px;">
                    <a href="./login.html">Login here</a> </div>`;
                return;
            }

            // Query the Firestore `movies` collection for a matching movie
            const moviesRef = collection(db, "movies");
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("User not found.");
            }

            const movieQuery = query(moviesRef, where("name", "==", movieTitle));
            const snapshot = await getDocs(movieQuery);

            if (!snapshot.empty) {
                const userData = userSnap.data();
                const subscriptionPlan = userData.subscriptionPlan;
                const movieDoc = snapshot.docs[0];
                const movie = movieDoc.data();
                const details = movie.details || {};

                document.getElementById('movie-details-container').innerHTML = `
                    <div class="movie-details-card" style="background-image: url(${movie.image});">
                        <div class="movie-details-info">
                            <h2>${movie.name}</h2>
                            <p><strong>Genre:</strong> ${movie.genre || 'N/A'}</p>
                            <p><strong>Director:</strong> ${details.director || 'N/A'}</p>
                            <p><strong>Release Year:</strong> ${movie.year || 'N/A'}</p>
                            <p><strong>Play Time:</strong> ${movie.duration || 'N/A'}</p>
                            <p><strong>Rating:</strong> ${movie.rating || 'N/A'}</p>
                            <p><strong>Description:</strong> ${movie.description || 'N/A'}</p>
                            <p><strong>Cast:</strong> ${details.cast ? details.cast.join(', ') : 'N/A'}</p>
                            <p><strong>Language:</strong> ${movie.language || 'N/A'}</p>
                            ${
                                subscriptionPlan
                                    ? `<div class="video-btns"><button class="watch-now-btn" id="watch-now">Watch Now</button> 
                                        <button class="watch-now-btn" id="watch-trailer">Watch Trailer</button></div>`
                                    : `<div class="video-btns"><button class="watch-now-btn" id="watch-trailer">Watch Trailer</button>  
                                        <a href="./user-detailAndMovies.html">Buy a Subscription</a></div>`
                            }
                        </div>
                    </div>`;

                // Add event listeners
                const watchNowButton = document.getElementById("watch-now");
                const watchTrailerButton = document.getElementById("watch-trailer");

                if (watchNowButton) {
                    watchNowButton.addEventListener("click", () => {
                        showTrailerModal(movie.video_link);
                    });
                }

                if (watchTrailerButton) {
                    watchTrailerButton.addEventListener("click", () => {
                        showTrailerModal(movie.trailer_link);
                    });
                }
            } else {
                document.getElementById('movie-details-container').innerHTML = '<p>Movie details not available.</p>';
            }
        } catch (error) {
            console.error('Error fetching movie data:', error);
            document.getElementById('movie-details-container').innerHTML = '<p>Failed to load movie details.</p>';
        }
    }

    // Function to show trailer modal
    function showTrailerModal(trailer_Link) {
        const modal = document.createElement("div");
        modal.id = "trailer-modal";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.background = "#000";
        modal.style.color = "#fff";
        modal.style.padding = "20px";
        modal.style.zIndex = "1000";
        modal.style.width = "80%";
        modal.style.height = "70%";
        modal.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
        modal.style.borderRadius = "10px";
        modal.innerHTML = `
            <iframe 
                src="${trailer_Link}" 
                style="width:100%; height:100%; border:none;" 
                allowfullscreen>
            </iframe>
            <button id="close-modal" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: red;
                color: #fff;
                border: none;
                padding: 10px;
                cursor: pointer;
            ">Close</button>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        document.getElementById("close-modal").addEventListener("click", () => {
            document.body.removeChild(modal);
        });
    }

    // Attach function to window.onload
    window.onload = displayMovieDetails;
})();
