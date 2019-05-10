const muter = document.getElementById('muter');
const sound = document.getElementById('sound');

const playPromise = sound.play();

if (playPromise !== undefined) {
    playPromise.then(() => {
        // Automatic playback started!
        // Show playing UI.
        sound.volume = 0.05;
        muter.innerText = 'MUTE';
        muter.addEventListener('click', function() {
            if (sound.paused) {
                sound.play();
                muter.innerText = 'MUTE';
            } else {
                sound.pause();
                muter.innerText = 'PLAY MUSIC';
            }
        });
    })
    .catch(error => {
        console.log(error);
    });
}