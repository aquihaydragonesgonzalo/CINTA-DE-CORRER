
class AudioService {
  private context: AudioContext | null = null;

  private init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Los navegadores móviles requieren llamar a resume() dentro de un evento de usuario
  async resume() {
    this.init();
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  beep(frequency: number = 880, duration: number = 200) {
    this.init();
    if (!this.context || this.context.state === 'suspended') return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.start();
    oscillator.stop(this.context.currentTime + duration / 1000);
  }

  playCountdownBeep() {
    this.beep(440, 150);
  }

  playSegmentEndBeep() {
    this.beep(1200, 500);
  }
}

export const audioService = new AudioService();
