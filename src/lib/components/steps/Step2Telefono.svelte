<script lang="ts">
  import { surveyData, validateTelefono, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateTelefono($surveyData.telefono);
  $: showError = touched && !isValid;
  $: cleanedLength = $surveyData.telefono.replace(/\D/g, '').length;

  function formatPhone(e: Event) {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    // Format: (XXX) XXX-XXXX
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }

    $surveyData.telefono = value;
  }
</script>

<div class="step-container">
  <h2 class="step-title">Teléfono</h2>
  <p class="step-description">Ingrese su número de teléfono (10 dígitos)</p>

  <div class="input-wrapper">
    <input
      type="tel"
      value={$surveyData.telefono}
      on:input={formatPhone}
      on:blur={() => (touched = true)}
      placeholder="(555) 123-4567"
      class="text-input"
      class:error={showError}
      inputmode="numeric"
    />
    {#if showError}
      <p class="error-message">{errorMessages.telefono}</p>
    {/if}
  </div>

  <p class="hint">{cleanedLength}/10 dígitos</p>
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

  .text-input {
    padding: 1rem;
    font-size: 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    transition: border-color 0.2s;
    letter-spacing: 0.05em;
  }

  .text-input:focus {
    border-color: #2563eb;
  }

  .text-input.error {
    border-color: #ef4444;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }

  .hint {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
    text-align: right;
  }
</style>
