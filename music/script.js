let chunks = [];
let mediaRecorder;
let audioBlob;
let loopAudioBuffer;
let audioContext;
let source;

const recordButton = document.getElementById('recordButton');
const playButton = document.getElementById('playButton');

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
            chunks = [];

            const reader = new FileReader();
            reader.onload = () => {
                if (audioContext) {
                    audioContext.close();
                }
                audioContext = new AudioContext();
                audioContext.decodeAudioData(reader.result, buffer => {
                    if (loopAudioBuffer) {
                        const newBuffer = audioContext.createBuffer(2, loopAudioBuffer.length + buffer.length, audioContext.sampleRate);
                        for (let i = 0; i < 2; i++) {
                            const channelData = newBuffer.getChannelData(i);
                            channelData.set(loopAudioBuffer.getChannelData(i), 0);
                            channelData.set(buffer.getChannelData(i), loopAudioBuffer.length);
                        }
                        loopAudioBuffer = newBuffer;
                    } else {
                        loopAudioBuffer = buffer;
                    }
                    playButton.disabled = false;
                });
            };
            reader.readAsArrayBuffer(audioBlob);
        };
    })
    .catch(error => console.error('Error accessing microphone:', error));

recordButton.addEventListener('mousedown', () => {
    mediaRecorder.start();
    recordButton.textContent = 'Recording...';
});

recordButton.addEventListener('mouseup', () => {
    mediaRecorder.stop();
    recordButton.textContent = 'Hold to Record';
});

playButton.addEventListener('click', () => {
    if (audioContext && loopAudioBuffer) {
        if (source) {
            source.stop();
        }
        source = audioContext.createBufferSource();
        source.buffer = loopAudioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
});
