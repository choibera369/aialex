<script lang="ts">
  import { onDestroy } from 'svelte';
  import { transcribeAudio } from '$lib/supabase';

  export let onResult: (text: string) => void;

  // State
  let isListening = false;
  let isProcessing = false;
  let errorMessage = '';

  // SpeechRecognition (Chrome, Safari, Edge)
  let recognition: any = null;
  let hasSpeechAPI = false;

  // MediaRecorder fallback (Firefox, etc.)
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let mediaStream: MediaStream | null = null;

  // Detect mode on first click (avoids SSR issues)
  let modeDetected = false;

  function detectMode() {
    if (modeDetected) return;
    const w = window as any;
    hasSpeechAPI = !!(w.SpeechRecognition || w.webkitSpeechRecognition);
    modeDetected = true;
  }

  function toggleListening() {
    detectMode();

    if (isProcessing) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // ── SpeechRecognition mode ──

  function startSpeechRecognition() {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    recognition = new SR();

    recognition.lang = 'es-MX';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isListening = true;
      errorMessage = '';
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      isListening = false;
      recognition = null;
      switch (event.error) {
        case 'audio-capture':
          errorMessage = 'No se encontró micrófono.';
          break;
        case 'not-allowed':
          errorMessage = 'Permiso de micrófono denegado.';
          break;
        default:
          errorMessage = 'Error de reconocimiento de voz.';
      }
    };

    recognition.onend = () => {
      if (isListening && recognition) {
        try {
          recognition.start();
        } catch (e) {
          isListening = false;
          recognition = null;
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      errorMessage = 'Error al iniciar el reconocimiento de voz.';
    }
  }

  function stopSpeechRecognition() {
    isListening = false;
    if (recognition) {
      recognition.onend = null;
      recognition.stop();
      recognition = null;
    }
  }

  // ── MediaRecorder fallback mode ──

  async function startMediaRecorder() {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];

      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        releaseMediaStream();
        if (audioChunks.length === 0) return;

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = [];

        isProcessing = true;
        errorMessage = '';

        try {
          const text = await transcribeAudio(audioBlob);
          if (text) {
            onResult(text);
          }
        } catch (e: any) {
          errorMessage = e.message || 'Error de transcripción.';
        } finally {
          isProcessing = false;
        }
      };

      mediaRecorder.start(); // single chunk for clean audio
      isListening = true;
      errorMessage = '';
    } catch (e: any) {
      releaseMediaStream();
      if (e.name === 'NotAllowedError') {
        errorMessage = 'Permiso de micrófono denegado.';
      } else {
        errorMessage = 'No se encontró micrófono.';
      }
    }
  }

  function stopMediaRecorder() {
    isListening = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    mediaRecorder = null;
  }

  function releaseMediaStream() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
  }

  // ── Unified API ──

  function startListening() {
    if (hasSpeechAPI) {
      startSpeechRecognition();
    } else {
      startMediaRecorder();
    }
  }

  function stopListening() {
    if (hasSpeechAPI) {
      stopSpeechRecognition();
    } else {
      stopMediaRecorder();
    }
  }

  onDestroy(() => {
    stopSpeechRecognition();
    stopMediaRecorder();
    releaseMediaStream();
  });
</script>

<div class="voice-input">
  <button
    type="button"
    class="voice-button"
    class:listening={isListening}
    class:processing={isProcessing}
    on:click={toggleListening}
    disabled={isProcessing}
    title={isProcessing
      ? 'Procesando...'
      : isListening
        ? 'Detener grabación'
        : 'Entrada por voz'}
  >
    {#if isListening}
      <span class="pulse"></span>
    {/if}

    {#if isProcessing}
      <span class="spinner"></span>
    {:else}
      <svg
        class="mic-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    {/if}
  </button>

  {#if isListening}
    <span class="status-text listening-text">
      {hasSpeechAPI ? 'Escuchando...' : 'Grabando...'}
    </span>
  {:else if isProcessing}
    <span class="status-text processing-text">Procesando...</span>
  {/if}

  {#if errorMessage}
    <span class="error-text">{errorMessage}</span>
  {/if}
</div>

<style>
  .voice-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .voice-button {
    position: relative;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #e2e8f0;
    border-radius: 50%;
    background: white;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .voice-button:active {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .voice-button:disabled {
    cursor: wait;
  }

  .voice-button.listening {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }

  .voice-button.processing {
    border-color: #f59e0b;
    color: #f59e0b;
    background: #fffbeb;
  }

  .pulse {
    position: absolute;
    inset: -4px;
    border: 2px solid #ef4444;
    border-radius: 50%;
    animation: pulse 1.5s ease-out infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #fde68a;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .mic-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .status-text {
    font-size: 0.7rem;
    white-space: nowrap;
    animation: blink 1s ease-in-out infinite;
  }

  .listening-text {
    color: #ef4444;
  }

  .processing-text {
    color: #f59e0b;
    animation: none;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .error-text {
    font-size: 0.65rem;
    color: #ef4444;
    text-align: center;
    max-width: 5rem;
  }
</style>
