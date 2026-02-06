<script lang="ts">
  import { surveyData } from '$lib/stores/survey';
  const commonAllergies = [
    'Penicilina',
    'Aspirina',
    'Ibuprofeno',
    'Sulfas',
    'Látex',
    'Mariscos'
  ];

  let selectedAllergies: string[] = [];

  function toggleAllergy(allergy: string) {
    if (selectedAllergies.includes(allergy)) {
      selectedAllergies = selectedAllergies.filter((a) => a !== allergy);
    } else {
      selectedAllergies = [...selectedAllergies, allergy];
    }
    updateSurveyData();
  }

  function updateSurveyData() {
    const customText = $surveyData.alergias
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !commonAllergies.includes(s))
      .join(', ');

    const allAllergies = [...selectedAllergies];
    if (customText) {
      allAllergies.push(customText);
    }
    $surveyData.alergias = allAllergies.join(', ');
  }


</script>

<div class="step-container">
  <h2 class="step-title">Alergias</h2>
  <p class="step-description">Indique sus alergias conocidas (opcional)</p>

  <div class="quick-select">
    <p class="quick-label">Alergias comunes:</p>
    <div class="chips">
      {#each commonAllergies as allergy}
        <button
          type="button"
          class="chip"
          class:selected={selectedAllergies.includes(allergy)}
          on:click={() => toggleAllergy(allergy)}
        >
          {allergy}
        </button>
      {/each}
    </div>
  </div>

  <div class="input-wrapper">
    <textarea
      bind:value={$surveyData.alergias}
      placeholder="Escriba otras alergias..."
      class="text-area"
      rows="3"
    ></textarea>
  </div>

  <p class="hint">Este campo es opcional. Puede dejarlo vacío si no tiene alergias conocidas.</p>
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
    border-color: #ef4444;
    background: #fef2f2;
  }

  .chip.selected {
    border-color: #ef4444;
    background: #ef4444;
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
