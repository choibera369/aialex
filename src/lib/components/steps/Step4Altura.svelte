<script lang="ts">
  import { surveyData, validateAltura, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateAltura($surveyData.altura);
  $: showError = touched && !isValid && $surveyData.altura !== '';

  function handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/[^\d.]/g, '');

    // Only allow one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    $surveyData.altura = value;
  }
</script>

<div class="step-container">
  <h2 class="step-title">Altura</h2>
  <p class="step-description">Ingrese su altura en centímetros</p>

  <div class="input-wrapper">
    <div class="input-with-unit">
      <input
        type="text"
        value={$surveyData.altura}
        on:input={handleInput}
        on:blur={() => (touched = true)}
        placeholder="170"
        class="text-input"
        class:error={showError}
        inputmode="decimal"
      />
      <span class="unit">cm</span>
    </div>
    {#if showError}
      <p class="error-message">{errorMessages.altura}</p>
    {/if}
  </div>

  <div class="range-hint">
    <span>50 cm</span>
    <span>250 cm</span>
  </div>
</div>

<style>
  .step-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .step-description {
    color: #64748b;
    margin: 0;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .text-input {
    flex: 1;
    padding: 1rem;
    font-size: 1.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    transition: border-color 0.2s;
    text-align: center;
  }

  .text-input:focus {
    border-color: #2563eb;
  }

  .text-input.error {
    border-color: #ef4444;
  }

  .unit {
    font-size: 1.25rem;
    color: #64748b;
    font-weight: 500;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }

  .range-hint {
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
