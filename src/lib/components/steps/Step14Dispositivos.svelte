<script lang="ts">
  import { surveyData } from '$lib/stores/survey';
  const commonDevices = [
    { id: 'marcapasos', label: 'Marcapasos', icon: '❤️' },
    { id: 'stent', label: 'Stent', icon: '🩺' },
    { id: 'implante_coclear', label: 'Implante coclear', icon: '👂' },
    { id: 'protesis_cadera', label: 'Prótesis de cadera', icon: '🦴' },
    { id: 'protesis_rodilla', label: 'Prótesis de rodilla', icon: '🦵' },
    { id: 'tornillos_placas', label: 'Tornillos/Placas', icon: '🔩' },
    { id: 'diu', label: 'DIU', icon: '💊' },
    { id: 'bomba_insulina', label: 'Bomba de insulina', icon: '💉' }
  ];

  let selectedDevices: string[] = [];

  function toggleDevice(device: string) {
    if (selectedDevices.includes(device)) {
      selectedDevices = selectedDevices.filter((d) => d !== device);
    } else {
      selectedDevices = [...selectedDevices, device];
    }
    updateSurveyData();
  }

  function updateSurveyData() {
    const deviceLabels = selectedDevices.map((id) => commonDevices.find((d) => d.id === id)?.label || id);

    const customText = $surveyData.dispositivosImplantados
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !deviceLabels.includes(s))
      .join(', ');

    const allDevices = [...deviceLabels];
    if (customText) {
      allDevices.push(customText);
    }
    $surveyData.dispositivosImplantados = allDevices.join(', ');
  }


</script>

<div class="step-container">
  <h2 class="step-title">Dispositivos Implantados</h2>
  <p class="step-description">¿Tiene algún dispositivo médico implantado? (opcional)</p>

  <div class="warning-box">
    <span class="warning-icon">!</span>
    <p>Esta información es importante para la seguridad del tratamiento de acupuntura.</p>
  </div>

  <div class="devices-grid">
    {#each commonDevices as device}
      <button
        type="button"
        class="device-card"
        class:selected={selectedDevices.includes(device.id)}
        on:click={() => toggleDevice(device.id)}
      >
        <span class="device-icon">{device.icon}</span>
        <span class="device-label">{device.label}</span>
      </button>
    {/each}
  </div>

  <div class="input-wrapper">
    <textarea
      bind:value={$surveyData.dispositivosImplantados}
      placeholder="Escriba otros dispositivos implantados..."
      class="text-area"
      rows="2"
    ></textarea>
  </div>

  <p class="hint">Este campo es opcional. Puede dejarlo vacío si no tiene dispositivos implantados.</p>
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

  .warning-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.75rem;
    border-left: 4px solid #f59e0b;
  }

  .warning-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f59e0b;
    color: white;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .warning-box p {
    margin: 0;
    color: #92400e;
    font-size: 0.875rem;
  }

  .devices-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .device-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .device-card:hover {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .device-card.selected {
    border-color: #f59e0b;
    background: #f59e0b;
    color: white;
  }

  .device-icon {
    font-size: 1.25rem;
  }

  .device-label {
    font-size: 0.875rem;
    font-weight: 500;
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
