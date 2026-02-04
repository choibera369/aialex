<script lang="ts">
  import { surveyData, validateHorarioDolor, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateHorarioDolor($surveyData.horarioDolor);
  $: showError = touched && !isValid;

  const options = [
    { value: 'manana', label: 'Mañana', icon: '🌅', time: '6:00 - 12:00' },
    { value: 'tarde', label: 'Tarde', icon: '☀️', time: '12:00 - 18:00' },
    { value: 'noche', label: 'Noche', icon: '🌙', time: '18:00 - 24:00' },
    { value: 'madrugada', label: 'Madrugada', icon: '🌃', time: '0:00 - 6:00' },
    { value: 'todo_el_dia', label: 'Todo el día', icon: '🔄', time: 'Constante' },
    { value: 'variable', label: 'Variable', icon: '❓', time: 'Sin patrón' }
  ];

  function selectOption(value: string) {
    $surveyData.horarioDolor = value;
    touched = true;
  }
</script>

<div class="step-container">
  <h2 class="step-title">Horario del Dolor</h2>
  <p class="step-description">¿En qué momento del día siente más dolor?</p>

  <div class="options-grid">
    {#each options as option}
      <button
        type="button"
        class="option-card"
        class:selected={$surveyData.horarioDolor === option.value}
        on:click={() => selectOption(option.value)}
      >
        <span class="option-icon">{option.icon}</span>
        <span class="option-label">{option.label}</span>
        <span class="option-time">{option.time}</span>
      </button>
    {/each}
  </div>

  {#if showError}
    <p class="error-message">{errorMessages.horarioDolor}</p>
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

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .option-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 0.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option-card:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .option-card.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  .option-icon {
    font-size: 1.5rem;
  }

  .option-label {
    font-size: 1rem;
    font-weight: 600;
  }

  .option-time {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
