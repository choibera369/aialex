<script lang="ts">
  import { surveyData } from '$lib/stores/survey';
  const commonConditions = [
    'Diabetes',
    'Hipertensión',
    'Cáncer',
    'Enf. cardíaca',
    'Artritis',
    'Alzheimer'
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
    const customText = $surveyData.historialFamiliar
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !commonConditions.includes(s))
      .join(', ');

    const allConditions = [...selectedConditions];
    if (customText) {
      allConditions.push(customText);
    }
    $surveyData.historialFamiliar = allConditions.join(', ');
  }


</script>

<div class="step-container">
  <h2 class="step-title">Historial Familiar</h2>
  <p class="step-description">¿Algún familiar tiene o tuvo estas condiciones? (opcional)</p>

  <div class="quick-select">
    <p class="quick-label">Condiciones hereditarias comunes:</p>
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
      bind:value={$surveyData.historialFamiliar}
      placeholder="Describa el historial médico de su familia..."
      class="text-area"
      rows="3"
    ></textarea>
  </div>

  <p class="hint">Incluya información sobre padres, abuelos, hermanos si es relevante.</p>
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
    border-color: #8b5cf6;
    background: #f5f3ff;
  }

  .chip.selected {
    border-color: #8b5cf6;
    background: #8b5cf6;
    color: white;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .text-area {
    flex: 1;
    min-width: 0;
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
