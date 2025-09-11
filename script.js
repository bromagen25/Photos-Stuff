// Functionality for all photo gallery pages
const galleryElement = document.getElementById('gallery');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModalButton = document.getElementById('close-modal-button');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const downloadButton = document.getElementById('download-button');
const shareButton = document.getElementById('share-button');
const galleryTitle = document.getElementById('gallery-title');
const galleryDescription = document.getElementById('gallery-description');
const pageTitle = document.getElementById('page-title');

let currentGallery = {};
let currentImageIndex = 0;
let galleries = {};

// Fetch galleries data from the JSON file
async function fetchGalleries() {
    try {
        const response = await fetch('galleries.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        galleries = await response.json();
    } catch (error) {
        console.error("Could not fetch galleries:", error);
        galleries = {}; // Return an empty object on error
    }
}

// Function to load images for a specific gallery
function loadGallery(galleryId) {
    if (galleries[galleryId]) {
        currentGallery = {
            name: galleryId,
            images: galleries[galleryId].images,
            description: galleries[galleryId].description || ''
        };
        renderGallery();
        galleryTitle.textContent = currentGallery.name;
        galleryDescription.textContent = currentGallery.description;
        pageTitle.textContent = currentGallery.name;
    } else {
        console.error('No gallery data found for:', galleryId);
        // Redirect to the index page
        window.location.href = 'index.html';
    }
}

function renderGallery() {
    galleryElement.innerHTML = '';
    currentGallery.images.forEach((url, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative group overflow-hidden rounded-xl shadow-lg';
        imgContainer.innerHTML = `
            <img src="${url}" alt="${currentGallery.name} - Image ${index + 1}" class="gallery-image w-full h-auto object-cover rounded-xl transform duration-300 group-hover:scale-110">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                <i class="fas fa-search-plus text-white text-3xl"></i>
            </div>
        `;
        imgContainer.addEventListener('click', () => {
            openModal(url, index);
        });
        galleryElement.appendChild(imgContainer);
    });
}

function openModal(imageSrc, index) {
    modalImage.src = imageSrc;
    currentImageIndex = index;
    imageModal.classList.remove('hidden');
    imageModal.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden');
}

function closeModal() {
    imageModal.classList.add('hidden');
    imageModal.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.images.length;
    modalImage.src = currentGallery.images[currentImageIndex];
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.images.length) % currentGallery.images.length;
    modalImage.src = currentGallery.images[currentImageIndex];
}

// Event Listeners
if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
if (nextButton) nextButton.addEventListener('click', showNextImage);
if (prevButton) prevButton.addEventListener('click', showPrevImage);

if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        const imageURL = currentGallery.images[currentImageIndex];
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `photo-${currentImageIndex + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Initialize the gallery on page load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchGalleries();

    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = urlParams.get('gallery');

    if (galleryId) {
        // This is a gallery page, load the images from the JSON file
        loadGallery(galleryId);
    } else {
        // This is the index page, load and render all gallery cards
        const galleryCardsContainer = document.getElementById('gallery-cards-container');
        if (galleryCardsContainer) {
            galleryCardsContainer.innerHTML = ''; // Clear any existing content
            Object.keys(galleries).forEach(galleryName => {
                const cardData = galleries[galleryName];
                const card = document.createElement('a');
                card.href = `${galleryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html?gallery=${encodeURIComponent(galleryName)}`;
                card.className = "gallery-card bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl";
                card.innerHTML = `
                    <div class="text-center">
                        <h2 class="text-2xl font-bold mb-2 text-gray-900">${galleryName}</h2>
                        <img src="${cardData.icon}" alt="Gallery Icon" class="w-24 h-24 rounded-full object-cover border-4 border-red-500 mb-4 mx-auto">
                        <p class="text-gray-600">${cardData.description}</p>
                    </div>
                `;
                galleryCardsContainer.appendChild(card);
            });
        }
    }
});