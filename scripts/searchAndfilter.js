// Import Firebase services
import { db } from "./admin.js";
import { collection, getDocs} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { loggedInUserId } from "./movies.js";

// **Dynamic Search Movies Function**
async function searchMovies(searchQuery) {
    const collectionsToSearch = ["movies"];
    const results = [];

    for (const collectionName of collectionsToSearch) {
        const snapshot = await getDocs(collection(db, collectionName));
        snapshot.forEach((doc) => {
            const movie = doc.data();
            if (movie.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                results.push({ ...movie, collectionName });
            }
        });
    }
    return results;
}

// **Dynamic Render Function**
function renderMovies(results,searchQuery) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (results.length === 0) {
        resultsDiv.innerHTML = `<p>No movies found matching your <strong>${searchQuery}</strong>.</p>`;
        setTimeout(() => {
            window.location.reload();
          }, 100); // 1000 milliseconds = 1 second
          
        return;
    }

    results.forEach((movie) => {
        const movieCard = document.createElement("div");
        const buttonLabel = loggedInUserId ? "More Info" : "More info";
        const buttonLink = `./pages/movie-details.html?name=${encodeURIComponent(movie.name)}`;
        const buttonHTML = `<a href="${buttonLink}" class="btn">${buttonLabel}</a>`;

        movieCard.innerHTML = `

            <img src="${movie.image}" alt="${movie.name}" >
            <p><strong>Title:</strong> ${movie.name || "N/A"}</p>
            <p><strong>Genre:</strong> ${movie.genre || "N/A"}</p>
            
             <div class="buttons">
              ${buttonHTML}
             <i class="fa-regular fa-heart watch-later-btn " data-movie-id="${movie.name}" ></i>
             </div>

        </div>
        
            
        `;

        resultsDiv.appendChild(movieCard);

        // <p><strong>Description:</strong> ${movie.description}</p>
        // <p><strong>Rating:</strong> ${movie.rating || "Not Rated"}</p>
    });
}

// **Main Search Function**
async function displaySearchResults() {
    const searchQuery = document.getElementById("search-input").value.trim();
    if (!searchQuery) {
        alert("Please enter a  movie title");
        setTimeout(() => {
            window.location.reload();
          }, 0); // 1000 milliseconds = 1 second
          
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Loading...</p>";

    try {
        const results = await searchMovies(searchQuery);
        renderMovies(results,searchQuery);
    } catch (error) {
        console.error("Error searching movies:", error);
        resultsDiv.innerHTML = "<p>Error fetching results. Please try again later.</p>";
    }
}

// **Toggle Search and Clear Functionality**
document.getElementById("search-button").addEventListener("click", () => {
    const searchButton = document.getElementById("search-button");
    const discovery = document.getElementById("display");

    if (searchButton.classList.contains("searching")) {
        // Clear results
        document.getElementById("search-input").value = "";
        document.getElementById("results").innerHTML = "";
        discovery.style.display = "none";
        searchButton.classList.remove("searching");
        searchButton.innerHTML = "🔍"; // Switch back to search icon
    } 
    else {
        // Perform search
        discovery.style.display = "block";
        discovery.style.backgroundColor = "black"; // Optional background styling
        searchButton.classList.add("searching");
        searchButton.innerHTML = "❌"; // Switch to cancel icon
        displaySearchResults();
    }

});

// **Trigger Search on Page Load (Optional)**
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");

    if (query) {
        document.getElementById("search-input").value = query;
        displaySearchResults();
    }
});
