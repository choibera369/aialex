<script lang="ts">
  import { surveyData, validateInicioDolor, errorMessages } from '$lib/stores/survey';

  let touched = false;
  let useCustom = false;
  $: isValid = validateInicioDolor($surveyData.inicioDolor);
  $: showError = touched && !isValid;

  const presets = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'esta_semana', label: 'Esta semana' },
    { value: 'hace_2_semanas', label: 'Hace 2 semanas' },
    { value: 'hace_1_mes', label: 'Hace 1 mes' },
    { value: 'hace_3_meses', label: 'Hace 3 meses' },
    { value: 'hace_6_meses', label: 'Hace 6 meses' },
    { value: 'hace_1_ano', label: 'Hace 1 año' },
    { value: 'mas_de_1_ano', label: 'Más de 1 año' }
  ];

  function selectPreset(value: string) {
    $surveyData.inicioDolor = value;
    useCustom = false;
    touched = true;
  }

  function enableCustom() {
    useCustom = true;
    $surveyData.inicioDolor = '';
  }
</script>

<div class="step-container">
  <h2 class="step-title">Inicio del Dolor</h2>
  <p class="step-description">¿Cuándo comenzó su dolor?</p>

  {#if !useCustom}
    <div class="presets-grid">
      {#each presets as preset}
        <button
          type="button"
          class="preset-button"
          class:selected={$surveyData.inicioDolor === preset.value}
          on:click={() => selectPreset(preset.value)}
        >
          {preset.label}
        </button>
      {/each}
    </div>

    <button type="button" class="custom-button" on:click={enableCustom}>
      Escribir otra respuesta
    </button>
  {:else}
    <div class="input-wrapper">
      <input
        type="text"
        bind:value={$surveyData.inicioDolor}
        on:blur={() => (touched = true)}
        placeholder="Describa cuándo comenzó el dolor..."
        class="text-input"
        class:error={showError}
      />
      <button
        type="button"
        class="back-to-presets"
        on:click={() => {
          useCustom = false;
          $surveyData.inicioDolor = '';
        }}
      >
        Volver a las opciones
      </button>
    </div>
  {/if}

  {#if showError}
    <p class="error-message">{errorMessages.inicioDolor}</p>
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

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .preset-button {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    color: #1e293b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-button:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .preset-button.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  .custom-button {
    padding: 0.75rem;
    font-size: 0.875rem;
    border: 2px dashed #94a3b8;
    border-radius: 0.75rem;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-button:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .text-input {
    padding: 1rem;
    font-size: 1rem;
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

  .back-to-presets {
    padding: 0.5rem;
    font-size: 0.875rem;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    text-decoration: underline;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
