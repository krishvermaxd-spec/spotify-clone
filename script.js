console.log("hello");



// 1. Store the offline songs in the same order as their cards in index.html.
const offlineSongs = [
    {
        title: "Here comes the sun",
        singer: "The Beatles",
        file: "songs/Here Comes The Sun (2019 Mix)   The Beatles.m4a"
    },
    {
        title: "Bittersweet symphony",
        singer: "The Verve",
        file: "songs/Bittersweet Symphony   Marc Scibilia.m4a"
    },
    {
        title: "California dreamin",
        singer: "The Mamas & The Papas",
        file: "songs/California Dreamin.m4a"
    },
    {
        title: "Everybody Wants to Rule the World",
        singer: "Tears for Fears",
        file: "songs/Everybody Wants To Rule The World.m4a"
    },
    {
        title: "Forever Young",
        singer: "Alphaville",
        file: "songs/Forever Young   Alphaville.m4a"
    },
    {
        title: "Pumped Up Kicks",
        singer: "Foster The People",
        file: "songs/Pumped Up Kicks   Foster The People.m4a"
    }
];


function updatePauseButtonIcon() {
    if (!currentAudio || currentAudio.paused) {
        pauseButton.src = "assets/play.png";
        pauseButton.alt = "play";
    } else {
        pauseButton.src = "assets/pause.png";
        pauseButton.alt = "pause";
    }
}

// 2. Select the elements you already have in your HTML.
const offlineButtons = document.querySelectorAll(".play-offline");
const offlineCovers = document.querySelectorAll(".offline-songs  .thumbnail");

const barCover = document.querySelector(".playbar-left img");
const barSong = document.querySelector(".playbar-song");
const barSinger = document.querySelector(".playbar-singer");

const pauseButton = document.querySelector(".pause");
const previousButton = document.querySelector(".previous");
const nextButton = document.querySelector(".next");

const seekbar = document.querySelector(".seekbar-slider");
const volumeSlider = document.querySelector(".volume-slider");


// 3. These variables remember the currently selected song and audio player.
let currentAudio = null;
let currentSongIndex = 0;


// 4. Convert seconds, such as 75, into a readable time: 1:15.
function formatTime(seconds) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}


// 5. Put the selected song’s details into the playbar.
function updatePlaybar(songIndex) {
    const song = offlineSongs[songIndex];

    barSong.textContent = song.title;
    barSinger.textContent = song.singer;

    // Copies the cover image from the matching offline card.
    barCover.src = offlineCovers[songIndex].src;
    barCover.alt = `${song.title} cover`;
}


// 6. Load and play one song.
function playSong(songIndex) {
    // Stop the old song before creating a new audio player.
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentSongIndex = songIndex;
    const song = offlineSongs[songIndex];

    currentAudio = new Audio(song.file);
    currentAudio.volume = volumeSlider.value / 100;

    updatePlaybar(songIndex);

    currentAudio.play()
    .then(() => {
        updatePauseButtonIcon();
    })
    .catch((error) => {
        console.error("Could not play this song:", error);
    });
    // The duration becomes available after the audio file loads.
    currentAudio.addEventListener("loadedmetadata", () => {
        seekbar.min = 0;
        seekbar.max = Math.floor(currentAudio.duration);
        seekbar.value = 0;
    });

    // Update the seekbar while music plays.
    currentAudio.addEventListener("timeupdate", () => {
        seekbar.value = Math.floor(currentAudio.currentTime);
    });

    // When the track ends, automatically play the next track.
    currentAudio.addEventListener("ended", () => {
      updatePauseButtonIcon();  
      playNextSong();
    });
}


// 7. Find the clicked offline button and play its matching song.
offlineButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        // Clicking the selected song toggles pause/play.
        if (currentAudio && currentSongIndex === index) {
            if (currentAudio.paused) {
                currentAudio.play();
            } else {
                currentAudio.pause();
            }

            return;
        }

        playSong(index);
    });
});


// 8. Make the central pause button pause or resume the active song.
pauseButton.addEventListener("click", () => {
    if (!currentAudio) {
        playSong(0);
        return;
    }

    if (currentAudio.paused) {
        currentAudio.play().then(() => {
            updatePauseButtonIcon();
        });
    } else {
        currentAudio.pause();
        updatePauseButtonIcon();
    }
});


// 9. Play the following song. After the last song, return to the first.
function playNextSong() {
    const nextIndex = (currentSongIndex + 1) % offlineSongs.length;
    playSong(nextIndex);
}

nextButton.addEventListener("click", playNextSong);


// 10. Play the previous song. Before the first song, go to the last.
previousButton.addEventListener("click", () => {
    const previousIndex =
        (currentSongIndex - 1 + offlineSongs.length) % offlineSongs.length;

    playSong(previousIndex);
});


// 11. Allow the user to drag the seekbar to another point in the song.
seekbar.addEventListener("input", () => {
    if (currentAudio) {
        currentAudio.currentTime = seekbar.value;
    }
});


// 12. Make the volume slider control audio volume.

volumeSlider.addEventListener("input", () => {
    if (currentAudio) {
        currentAudio.volume = volumeSlider.value / 100;
    }
});