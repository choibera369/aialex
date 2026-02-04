<script lang="ts">
  import { surveyData, validateFactorRh, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateFactorRh($surveyData.factorRh);
  $: showError = touched && !isValid;

  const options = [
    { value: '+', label: 'Positivo (+)' },
    { value: '-', label: 'Negativo (-)' },
    { value: 'No sé', label: 'No sé' }
  ];

  function selectOption(option: string) {
    $surveyData.factorRh = option;
    touched = true;
  }
</script>

<div class="step-container">
  <h2 class="step-title">Factor RH</h2>
  <p class="step-description">Seleccione su factor RH</p>

  <div class="options-container">
    {#each options as option}
      <button
        type="button"
        class="option-button"
        class:selected={$surveyData.factorRh === option.value}
        on:click={() => selectOption(option.value)}
      >
        <span class="option-symbol">{option.value}</span>
        <span class="option-label">{option.label}</span>
      </button>
    {/each}
  </div>

  {#if showError}
    <p class="error-message">{errorMessages.factorRh}</p>
  {/if}

  {#if $surveyData.tipoSangre && $surveyData.factorRh}
    <div class="blood-type-display">
      <span class="blood-type">{$surveyData.tipoSangre}{$surveyData.factorRh}</span>
    </div>
  {/if}
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

  .options-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .option-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    font-size: 1.125rem;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    background: white;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-button:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .option-button.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  .option-symbol {
    font-size: 1.5rem;
    font-weight: 700;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
  }

  .option-button.selected .option-symbol {
    background: rgba(255, 255, 255, 0.2);
  }

  .option-label {
    font-weight: 500;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }

  .blood-type-display {
    display: flex;
    justify-content: center;
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.75rem;
  }

  .blood-type {
    font-size: 2rem;
    font-weight: 700;
    color: #d97706;
  }
</style>
