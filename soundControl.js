const muter = document.getElementById('muter');
const sound = document.getElementById('sound');

const playPromise = sound.play();

if (playPromise !== undefined) {
    playPromise.then(() => {
        // Automatic playback started!
        // Show playing UI.
        sound.volume = 0.05;
        muter.innerText = 'MUTE 音を消す';
        muter.addEventListener('click', function() {
            if (sound.paused) {
                sound.play();
                muter.innerText = 'MUTE 音を消す';
            } else {
                sound.pause();
                muter.innerText = 'PLAY MUSIC 音楽を再生';
            }
        });
    })
    .catch(error => {
        console.log(error);
    });
}