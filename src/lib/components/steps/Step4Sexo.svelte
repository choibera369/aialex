<script lang="ts">
  import { surveyData, validateSexo, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateSexo($surveyData.sexo);
  $: showError = touched && !isValid;

  const options = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
  ];

  function selectOption(option: string) {
    $surveyData.sexo = option;
    touched = true;
  }
</script>

<div class="step-container">
  <h2 class="step-title">Sexo</h2>
  <p class="step-description">Seleccione su sexo</p>

  <div class="options-container">
    {#each options as option}
      <button
        type="button"
        class="option-button"
        class:selected={$surveyData.sexo === option.value}
        on:click={() => selectOption(option.value)}
      >
        {option.label}
      </button>
    {/each}
  </div>

  {#if showError}
    <p class="error-message">{errorMessages.sexo}</p>
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .option-button {
    padding: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
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

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
