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
const navButtons = document.querySelectorAll('[data-gallery]');

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
        return await response.json();
    } catch (error) {
        console.error("Could not fetch galleries:", error);
        return [];
    }
}

// Function to load images for a specific sub-gallery
function loadSubGallery(galleryName) {
    if (galleries[galleryName]) {
        currentGallery = {
            name: galleryName,
            images: galleries[galleryName]
        };
        galleryElement.innerHTML = ''; // Clear current gallery
        currentGallery.images.forEach((url, index) => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Photo from ${galleryName} gallery, image ${index + 1}`;
            img.loading = "lazy";
            img.className = 'gallery-image w-full h-auto object-cover rounded-lg shadow-md';
            img.dataset.index = index;
            
            imgContainer.appendChild(img);
            galleryElement.appendChild(imgContainer);
        });
    }
}

// Function to preload the next and previous images
function preloadImages(index) {
    const imagesToPreload = [];
    if (index > 0) {
        imagesToPreload.push(currentGallery.images[index - 1]);
    }
    if (index < currentGallery.images.length - 1) {
        imagesToPreload.push(currentGallery.images[index + 1]);
    }

    imagesToPreload.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Function to show the modal with a specific image
function showModal(index) {
    currentImageIndex = index;
    modalImage.src = currentGallery.images[currentImageIndex];
    imageModal.classList.remove('hidden');
    preloadImages(currentImageIndex);
}

// Function to show the next image in the modal
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.images.length;
    modalImage.src = currentGallery.images[currentImageIndex];
    preloadImages(currentImageIndex);
}

// Function to show the previous image in the modal
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.images.length) % currentGallery.images.length;
    modalImage.src = currentGallery.images[currentImageIndex];
    preloadImages(currentImageIndex);
}

// Function to close the modal
function closeModal() {
    imageModal.classList.add('hidden');
}

// Event Listeners
galleryElement.addEventListener('click', (e) => {
    const clickedImage = e.target.closest('.gallery-image');
    if (clickedImage) {
        showModal(parseInt(clickedImage.dataset.index, 10));
    }
});

closeModalButton.addEventListener('click', closeModal);
prevButton.addEventListener('click', showPrevImage);
nextButton.addEventListener('click', showNextImage);
downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = modalImage.src;
    a.download = `photo-${currentImageIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!imageModal.classList.contains('hidden')) {
        if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// Touch event listeners for swiping on the modal image
let touchStartX = 0;
let touchEndX = 0;
modalImage.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
modalImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        showNextImage();
    } else if (touchEndX > touchStartX + swipeThreshold) {
        showPrevImage();
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = urlParams.get('gallery');
    
    // Check if galleries.json exists and load it
    try {
        const response = await fetch('galleries.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        galleries = await response.json();
    } catch (error) {
        console.error("Could not load galleries.json:", error);
    }
    
    if (galleries[galleryId]) {
        galleryTitle.textContent = galleryId;
        // Optionally update description if available
        // galleryDescription.textContent = galleries[galleryId].description;
        loadSubGallery(galleryId);
    } else {
        // Fallback for pages that don't use sub-galleries
        const pageGalleries = document.getElementById('page-galleries');
        if (pageGalleries && pageGalleries.dataset.gallery) {
            galleries = JSON.parse(pageGalleries.dataset.gallery);
            const initialGallery = Object.keys(galleries)[0];
            galleryTitle.textContent = initialGallery;
            loadSubGallery(initialGallery);
        } else {
            console.error('No gallery data found on the page or in galleries.json.');
        }
    }
    
    // Add click listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const galleryName = button.dataset.gallery;
            loadSubGallery(galleryName);
        });
    });
});