<script lang="ts">
  import { nextStep } from '$lib/stores/survey';
</script>

<div class="welcome-container">
  <div class="welcome-content">
    <div class="doctor-photo">
      <img src="/doctor-photo-sm.jpg" alt="Dr. Alex Kim" />
    </div>
    <h1 class="welcome-title">Alex Kim Acupuntura</h1>
    <p class="welcome-message">
      Gracias por visitar Alex Kim Acupuntura
    </p>
    <p class="welcome-subtitle">
      Por favor, complete la siguiente encuesta para que podamos atenderle mejor.
    </p>
    <button type="button" class="comenzar-button" on:click={nextStep}>
      Comenzar
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</div>

<style>
  .welcome-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 5rem);
    min-height: calc(100dvh - 5rem);
    padding: 2rem 1rem;
  }

  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 320px;
  }

  .doctor-photo {
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1.5rem;
    border: 3px solid #2563eb;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  }

  .doctor-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .welcome-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }

  .welcome-message {
    font-size: 1.125rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
    line-height: 1.6;
  }

  .welcome-subtitle {
    font-size: 0.925rem;
    color: #94a3b8;
    margin: 0 0 2rem 0;
    line-height: 1.5;
  }

  .comenzar-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    border: none;
    border-radius: 1rem;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .comenzar-button:hover {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
  }

  .comenzar-button:active {
    transform: translateY(0);
  }

  .comenzar-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
