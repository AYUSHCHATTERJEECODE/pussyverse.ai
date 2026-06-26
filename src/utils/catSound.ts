// Synthesize high-quality feline vocalizations using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type MeowType = "short" | "chirp" | "high" | "soft" | "angry" | "purr";

export function playCatMeow(type?: MeowType) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create oscillator nodes
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Default configuration for a feline meow
    let duration = 0.35;
    let startFreq = 400;
    let peakFreq = 850;
    let endFreq = 650;
    let volume = 0.12;

    const meowTypes: MeowType[] = ["short", "chirp", "high", "soft", "angry", "purr"];
    const meowType = type || meowTypes[Math.floor(Math.random() * 4)];

    if (meowType === "short") {
      duration = 0.25;
      startFreq = 450;
      peakFreq = 700;
      endFreq = 600;
    } else if (meowType === "chirp") {
      duration = 0.15;
      startFreq = 600;
      peakFreq = 950;
      endFreq = 900;
    } else if (meowType === "high") {
      duration = 0.4;
      startFreq = 500;
      peakFreq = 1100;
      endFreq = 850;
    } else if (meowType === "soft") {
      duration = 0.3;
      startFreq = 350;
      peakFreq = 550;
      endFreq = 480;
      volume = 0.08;
    } else if (meowType === "angry") {
      duration = 0.5;
      startFreq = 220;
      peakFreq = 380;
      endFreq = 180;
      volume = 0.15;
    } else if (meowType === "purr") {
      // Purring is low-frequency pulsing
      duration = 0.6;
      osc.type = "sawtooth";
      osc2.type = "sine";
      startFreq = 75;
      peakFreq = 85;
      endFreq = 70;
      volume = 0.08;
    }

    if (meowType !== "purr") {
      osc.type = "triangle";
      osc2.type = "sine";
    }

    // Meow frequency sweep: rising rapidly then falling slightly
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.35);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    osc2.frequency.setValueAtTime(startFreq * 1.4, now);
    osc2.frequency.exponentialRampToValueAtTime(peakFreq * 1.4, now + duration * 0.35);
    osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.4, now + duration);

    // Soft click filtering and envelope setup
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + duration * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration);
    osc2.stop(now + duration);
  } catch (err) {
    console.warn("Feline Audio Context not enabled/initialized by user interaction yet.", err);
  }
}
