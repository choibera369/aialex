<script lang="ts">
  export let onResult: (text: string) => void;

  let isListening = false;
  let isSupported = false;
  let errorMessage = '';

  // Check for browser support
  if (typeof window !== 'undefined') {
    isSupported =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  function startListening() {
    if (!isSupported) {
      errorMessage = 'Su navegador no soporta reconocimiento de voz';
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-MX';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      errorMessage = '';
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      isListening = false;
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó voz. Intente de nuevo.';
          break;
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
      isListening = false;
    };

    try {
      recognition.start();
    } catch (e) {
      errorMessage = 'Error al iniciar el reconocimiento de voz.';
    }
  }
</script>

{#if isSupported}
  <div class="voice-input">
    <button
      type="button"
      class="voice-button"
      class:listening={isListening}
      on:click={startListening}
      disabled={isListening}
      title="Entrada por voz"
    >
      {#if isListening}
        <span class="pulse"></span>
      {/if}
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
    </button>

    {#if isListening}
      <span class="listening-text">Escuchando...</span>
    {/if}

    {#if errorMessage}
      <span class="error-text">{errorMessage}</span>
    {/if}
  </div>
{/if}

<style>
  .voice-input {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
  }

  .voice-button:hover:not(:disabled) {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .voice-button.listening {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }

  .voice-button:disabled {
    cursor: default;
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

  .mic-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .listening-text {
    font-size: 0.875rem;
    color: #ef4444;
    animation: blink 1s ease-in-out infinite;
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
    font-size: 0.75rem;
    color: #ef4444;
  }
</style>
