<script lang="ts">
  import { surveyData, validateIntensidadDolor, errorMessages } from '$lib/stores/survey';

  let touched = false;
  $: isValid = validateIntensidadDolor($surveyData.intensidadDolor);
  $: showError = touched && !isValid;

  function getIntensityLabel(value: number): string {
    if (value <= 2) return 'Leve';
    if (value <= 4) return 'Moderado';
    if (value <= 6) return 'Considerable';
    if (value <= 8) return 'Severo';
    return 'Muy severo';
  }

  function getIntensityColor(value: number): string {
    if (value <= 2) return '#22c55e';
    if (value <= 4) return '#84cc16';
    if (value <= 6) return '#eab308';
    if (value <= 8) return '#f97316';
    return '#ef4444';
  }

  $: intensityLabel = getIntensityLabel($surveyData.intensidadDolor);
  $: intensityColor = getIntensityColor($surveyData.intensidadDolor);
</script>

<div class="step-container">
  <h2 class="step-title">Intensidad del Dolor</h2>
  <p class="step-description">Indique la intensidad de su dolor del 1 al 10</p>

  <div class="slider-container">
    <div class="intensity-display" style="background: {intensityColor}20; border-color: {intensityColor}">
      <span class="intensity-number" style="color: {intensityColor}">{$surveyData.intensidadDolor}</span>
      <span class="intensity-label" style="color: {intensityColor}">{intensityLabel}</span>
    </div>

    <input
      type="range"
      min="1"
      max="10"
      bind:value={$surveyData.intensidadDolor}
      on:change={() => (touched = true)}
      class="slider"
      style="--color: {intensityColor}"
    />

    <div class="scale-labels">
      <span>1</span>
      <span>2</span>
      <span>3</span>
      <span>4</span>
      <span>5</span>
      <span>6</span>
      <span>7</span>
      <span>8</span>
      <span>9</span>
      <span>10</span>
    </div>

    <div class="scale-descriptions">
      <span>Sin dolor</span>
      <span>Dolor extremo</span>
    </div>
  </div>

  {#if showError}
    <p class="error-message">{errorMessages.intensidadDolor}</p>
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

  .slider-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
  }

  .intensity-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    border: 2px solid;
    border-radius: 1rem;
    transition: all 0.3s;
  }

  .intensity-number {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
  }

  .intensity-label {
    font-size: 1.25rem;
    font-weight: 500;
    margin-top: 0.25rem;
  }

  .slider {
    width: 100%;
    height: 2.5rem;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-runnable-track {
    height: 0.75rem;
    border-radius: 0.5rem;
    background: linear-gradient(
      to right,
      #22c55e 0%,
      #84cc16 25%,
      #eab308 50%,
      #f97316 75%,
      #ef4444 100%
    );
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: white;
    border: 4px solid var(--color);
    margin-top: -0.625rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-track {
    height: 0.75rem;
    border-radius: 0.5rem;
    background: linear-gradient(
      to right,
      #22c55e 0%,
      #84cc16 25%,
      #eab308 50%,
      #f97316 75%,
      #ef4444 100%
    );
  }

  .slider::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: white;
    border: 4px solid var(--color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    padding: 0 0.5rem;
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .scale-descriptions {
    display: flex;
    justify-content: space-between;
    color: #64748b;
    font-size: 0.875rem;
  }

  .error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin: 0;
  }
</style>
