<script lang="ts">
  import { surveyData } from '$lib/stores/survey';

</script>

<div class="step-container">
  <h2 class="step-title">Medicamentos Actuales</h2>
  <p class="step-description">Liste los medicamentos que toma actualmente (opcional)</p>

  <div class="info-box">
    <span class="info-icon">i</span>
    <p>Incluya el nombre del medicamento, la dosis y la frecuencia si es posible.</p>
  </div>

  <div class="input-wrapper">
    <textarea
      bind:value={$surveyData.medicamentosActuales}
      placeholder="Ej: Metformina 500mg, 2 veces al día&#10;Losartán 50mg, 1 vez al día"
      class="text-area"
      rows="4"
    ></textarea>
  </div>

  <div class="examples">
    <p class="examples-title">Ejemplos de cómo escribir:</p>
    <ul class="examples-list">
      <li>Omeprazol 20mg - mañanas</li>
      <li>Paracetamol - según necesidad</li>
      <li>Vitamina D - diario</li>
    </ul>
  </div>

  <p class="hint">Este campo es opcional. Puede dejarlo vacío si no toma medicamentos.</p>
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

  .info-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #eff6ff;
    border-radius: 0.75rem;
    border-left: 4px solid #2563eb;
  }

  .info-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2563eb;
    color: white;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .info-box p {
    margin: 0;
    color: #1e40af;
    font-size: 0.875rem;
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
    line-height: 1.5;
  }

  .text-area:focus {
    border-color: #2563eb;
  }

  .examples {
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
  }

  .examples-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    margin: 0 0 0.5rem 0;
  }

  .examples-list {
    margin: 0;
    padding-left: 1.25rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .examples-list li {
    margin-bottom: 0.25rem;
  }

  .hint {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
    font-style: italic;
  }
</style>
