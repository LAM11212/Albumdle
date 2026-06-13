const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");
const guess = document.getElementById("guess");
const header1 = document.querySelector("h1");
const header2 = document.querySelectorAll("h2");
const buttonArray = [];
const nxtbtn = document.getElementById("next");
const playButton = document.getElementById("play-song");
const btn1 = document.getElementById("1");
const btn2 = document.getElementById("2");
const btn3 = document.getElementById("3");
const btn4 = document.getElementById("4");
const btn5 = document.getElementById("5");
const seenAlbums = new Set();
let storedString = "";
let guessCount = 1;
let fauxguessCount = 1; // used for btns 1-5
let pixelationScale = 3;
const pixelationReview = [3, 5, 7, 9, 11, 120];
let currentMusic;
let currentArtist;

const img = new Image();
img.crossOrigin = "anonymous";
let correctTitle;

async function generateAlbumForTheDay() {
    try {
        const response = await fetch('./albums.json');
        if(!response.ok) throw new Error("Network Response Error");
        const data = await response.json();
        if(seenAlbums.size >= data.albums.length) {
            seenAlbums.clear();
        }
        let randomAlbum;
        do {
            randomAlbum = pickRandomAlbumFromJson(data.albums);
        } while (seenAlbums.has(randomAlbum.title));

        seenAlbums.add(randomAlbum.title);

        img.src = randomAlbum.src;
        correctTitle = randomAlbum.title;
        let x = randomAlbum.song;
        console.log(x);
        currentMusic = new  Audio(randomAlbum.song);
        currentArtist = randomAlbum.artist;
        console.log(correctTitle);
        console.log(currentMusic);
    } catch (error) {
        console.error(error);
    }
}

function pickRandomAlbumFromJson(array) {
    const randIdx = Math.floor(Math.random() * array.length);
    return array[randIdx];
}

img.onload = () => {
    pixelate(img, pixelationScale);
};

function pixelate(img, factor) {
    const w = canvas.width;
    const h = canvas.height;

    const size = factor / 120;

    const scaledW = w * size;
    const scaledH = h * size;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, scaledW, scaledH);
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(canvas, 0, 0, scaledW, scaledH, 0, 0, w, h);
}

guess.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        event.preventDefault();
        storedString = guess.value;
        storedString = storedString.toLowerCase().trim(); // normalize user input
        if(guessCount > 4 && storedString !== correctTitle) {
            fauxguessCount = 10;
            pixelate(img, 120);
            createNextButton(); 
            guess.style.display = "none";
            header1.textContent = `that was ${correctTitle}, by ${currentArtist}, hit next to try another one.`;
            header1.style.cssText = "padding-bottom: 40px;"
            btn5.style.cssText = "background-color: red;";
            for(const head of header2) {
                head.remove();
            }
            return;
        }
        if(storedString === correctTitle) {
            pixelate(img, 120);
            fauxguessCount = 10;
            buttonArray[guessCount].style.cssText = "background-color: green;";
            createNextButton();
            guess.style.display = "none";
            header1.textContent = "Congrats! You got it, hit next to try another one.";
            header1.style.cssText = "padding-bottom: 40px;";
            for(const head of header2) {
                head.remove();
            }
        } else if(storedString !== correctTitle && guessCount <= 5){
            if(guessCount === 3) {
                createPlaybutton();
            }
            pixelationScale += 2;
            pixelate(img, pixelationScale);
            buttonArray[guessCount].style.cssText = "background-color: red;";
            guessCount++;
            fauxguessCount++;
        }
        guess.value = "";
    }
});

function populateButtonArray() {
    for(let i = 1; i <= 5; i++) {
        buttonArray[i] = document.getElementById(i.toString());
    }
}

nxtbtn.addEventListener('click', function() {
    resetGame();
});

playButton.addEventListener('click', function() {
    currentMusic.play();
});

function createNextButton() {
    nxtbtn.innerText = 'next';
    nxtbtn.type = 'button';
    nxtbtn.id = 'next';
    nxtbtn.style.cssText = "visibility: visible;";
    document.querySelector('.guess-section').appendChild(nxtbtn);
}

function createPlaybutton() {
    playButton.innerText = 'Play Hint';
    playButton.type = 'button';
    playButton.id = 'play-song';
    playButton.style.cssText = "visibility: visible";
    document.querySelector('.guess-section').appendChild(playButton);
}

function resetGame() {
    guessCount = 1;
    fauxguessCount = 1;
    pixelationScale = 3;
    guess.value = "";
    guess.style.display = "block";

    header1.textContent = "Guess the Album!";
    header1.style.cssText = "";
    currentMusic.pause();
    currentMusic.currentTime = 0;
    for(let i = 1; i <= 5; i++) {
        buttonArray[i].style.backgroundColor = "";
    }
    if(nxtbtn) {
        nxtbtn.remove();
    }
    if(playButton) {
        playButton.remove();
    }

    generateAlbumForTheDay();
}

btn1.addEventListener('click', function() {
    if(fauxguessCount >= 1)
        pixelate(img, pixelationReview[0]); 
});

btn2.addEventListener('click', function() {
    if(fauxguessCount >= 2) {
        pixelate(img, pixelationReview[1]);
    }
});

btn3.addEventListener('click', function() {
    if(fauxguessCount >= 3) {
        pixelate(img, pixelationReview[2]);
    }
});

btn4.addEventListener('click', function() {
    if(fauxguessCount >= 4) {
        pixelate(img, pixelationReview[3]);
    }
});

btn5.addEventListener('click', function() {
    if(fauxguessCount === 10) {
        pixelate(img, pixelationReview[5]); // used so that after answer is revealed, user can see the full picture when pressing 5.
    } else if(fauxguessCount >= 5) {
        pixelate(img, pixelationReview[4]); // used so that before answer is revealed user sees the 5th pixelated view.
    }
});

// plans from here on out: create a marathon mode where we keep track of how many the user got right in a single run
// also if there is a more consistent way to prevent the same posters from coming up again and again that would be a good idea.

populateButtonArray();
generateAlbumForTheDay();