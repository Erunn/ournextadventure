// Function to show one of your 3 uploaded cat photos
function showSuri(imageClass) {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = `cat-image ${imageClass}`;
    perch.appendChild(cat);
    setTimeout(() => { perch.style.opacity = "1"; }, 500);
}

// THE NEW 4-WAY RANDOMIZER (25% each)
function chooseEncounter() {
    const roll = Math.random();
    
    if (roll < 0.25) {
        showSuri('suri-1');
    } else if (roll < 0.50) {
        showSuri('suri-2');
    } else if (roll < 0.75) {
        showSuri('suri-3');
    } else {
        // The remaining 25% chance for Walking Paws
        createPawTrack();
        setInterval(createPawTrack, 30000);
    }
}

// Ensure this is called when the page loads
window.addEventListener('load', chooseEncounter);
