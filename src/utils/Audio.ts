import { AudioListener, AudioLoader, PositionalAudio, Vector3 } from "three";
import { DRUM_ID, STICK_ID } from "./drumIds";

export class AudioHandler {
    protected soundBuffers: { [key: string]: AudioBuffer } = {};
    protected sounds: PositionalAudio[] = [];
    protected currentlyPlayingSound: number = 0
    protected audioLoader: AudioLoader;
    constructor(audioListener: AudioListener) {
        this.sounds = [
            new PositionalAudio(audioListener),
            new PositionalAudio(audioListener),
            new PositionalAudio(audioListener),
            new PositionalAudio(audioListener),
            new PositionalAudio(audioListener),
            new PositionalAudio(audioListener),
        ];

        this.audioLoader = new AudioLoader();

        this.loadSound(DRUM_ID.SNARE, '/assets/sfx/snare.mp3')
        this.loadSound(DRUM_ID.HAT, '/assets/sfx/hat.mp3')
        this.loadSound(DRUM_ID.HI_TOM, '/assets/sfx/hi_tom.mp3')
        this.loadSound(DRUM_ID.LOW_TOM, '/assets/sfx/low_tom.mp3')
        this.loadSound(DRUM_ID.FLOOR_TOM, '/assets/sfx/floor_tom.mp3')
        this.loadSound(DRUM_ID.RIDE, '/assets/sfx/ride.mp3')
        this.loadSound(DRUM_ID.CRASH, '/assets/sfx/crash.mp3')
    }

    protected loadSound(id: DRUM_ID, assetPath: string) {
        this.audioLoader.load(assetPath, (buffer: AudioBuffer) => {
            this.soundBuffers[id] = buffer
        })
    }

    public playSound(soundId: DRUM_ID | STICK_ID, position?: Vector3) {
        let sound = this.sounds[this.currentlyPlayingSound]
        if (sound.isPlaying) {
            sound.stop()
        }

        if (position) {
            sound.position.copy(position)
        }
        
        const soundBuffer = this.soundBuffers[soundId]
        if (!soundBuffer) {
            console.log("NO SOUND FOUND WITH ID ", soundId)
            return;
        }
        sound.buffer = this.soundBuffers[soundId]
        sound.setVolume(0.8) // TODO: update as needed
        sound.play()

        this.currentlyPlayingSound += 1;
        this.currentlyPlayingSound %= this.sounds.length;
    }
}
