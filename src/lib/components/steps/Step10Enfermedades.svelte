<script lang="ts">
  import { surveyData } from '$lib/stores/survey';
  import VoiceInput from '../VoiceInput.svelte';

  const commonConditions = [
    'Diabetes',
    'Hipertensión',
    'Artritis',
    'Asma',
    'Cardiopatía',
    'Tiroides'
  ];

  let selectedConditions: string[] = [];

  function toggleCondition(condition: string) {
    if (selectedConditions.includes(condition)) {
      selectedConditions = selectedConditions.filter((c) => c !== condition);
    } else {
      selectedConditions = [...selectedConditions, condition];
    }
    updateSurveyData();
  }

  function updateSurveyData() {
    const customText = $surveyData.enfermedadesPreexistentes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !commonConditions.includes(s))
      .join(', ');

    const allConditions = [...selectedConditions];
    if (customText) {
      allConditions.push(customText);
    }
    $surveyData.enfermedadesPreexistentes = allConditions.join(', ');
  }

  function handleVoiceResult(text: string) {
    if ($surveyData.enfermedadesPreexistentes) {
      $surveyData.enfermedadesPreexistentes += ', ' + text;
    } else {
      $surveyData.enfermedadesPreexistentes = text;
    }
  }
</script>

<div class="step-container">
  <h2 class="step-title">Enfermedades Preexistentes</h2>
  <p class="step-description">Seleccione o escriba sus condiciones médicas (opcional)</p>

  <div class="quick-select">
    <p class="quick-label">Selección rápida:</p>
    <div class="chips">
      {#each commonConditions as condition}
        <button
          type="button"
          class="chip"
          class:selected={selectedConditions.includes(condition)}
          on:click={() => toggleCondition(condition)}
        >
          {condition}
        </button>
      {/each}
    </div>
  </div>

  <div class="input-wrapper">
    <textarea
      bind:value={$surveyData.enfermedadesPreexistentes}
      placeholder="Escriba otras condiciones médicas..."
      class="text-area"
      rows="3"
    ></textarea>
    <VoiceInput onResult={handleVoiceResult} />
  </div>

  <p class="hint">Este campo es opcional. Puede dejarlo vacío si no aplica.</p>
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

  .quick-select {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-label {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 2rem;
    background: white;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
  }

  .chip:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .chip.selected {
    border-color: #2563eb;
    background: #2563eb;
    color: white;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .text-area {
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    resize: vertical;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .text-area:focus {
    border-color: #2563eb;
  }

  .hint {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
    font-style: italic;
  }
</style>
