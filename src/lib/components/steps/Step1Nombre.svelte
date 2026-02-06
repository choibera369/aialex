<script lang="ts">
  import { surveyData, validateNombre, validateApellido, errorMessages } from '$lib/stores/survey';

  let touchedNombre = false;
  let touchedApellido = false;
  $: isNombreValid = validateNombre($surveyData.nombre);
  $: isApellidoValid = validateApellido($surveyData.apellido);
  $: showNombreError = touchedNombre && !isNombreValid;
  $: showApellidoError = touchedApellido && !isApellidoValid;
</script>

<div class="step-container">
  <h2 class="step-title">Nombre</h2>

  <div class="input-row">
    <div class="input-wrapper">
      <label class="input-label" for="nombre">Nombre(s)</label>
      <input
        id="nombre"
        type="text"
        bind:value={$surveyData.nombre}
        on:blur={() => (touchedNombre = true)}
        placeholder="María"
        class="text-input"
        class:error={showNombreError}
        maxlength="50"
      />
      {#if showNombreError}
        <p class="error-message">{errorMessages.nombre}</p>
      {/if}
    </div>

    <div class="input-wrapper">
      <label class="input-label" for="apellido">Apellido(s)</label>
      <input
        id="apellido"
        type="text"
        bind:value={$surveyData.apellido}
        on:blur={() => (touchedApellido = true)}
        placeholder="García"
        class="text-input"
        class:error={showApellidoError}
        maxlength="50"
      />
      {#if showApellidoError}
        <p class="error-message">{errorMessages.apellido}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .step-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .input-row {
    display: flex;
    gap: 0.75rem;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .input-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
  }

  .text-input {
    width: 100%;
    padding: 0.875rem 0.75rem;
    font-size: 1.125rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .text-input:focus {
    border-color: #2563eb;
  }

  .text-input.error {
    border-color: #ef4444;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.8rem;
    margin: 0;
  }
</style>
