<script lang="ts">
  import { onMount } from 'svelte';
  import {
    currentStep,
    TOTAL_STEPS,
    nextStep,
    prevStep,
    isCurrentStepValid,
    submitSuccess,
    surveyData,
    validateStep,
    autoFillFromPatient,
    isReturningPatient,
    isPresencial
  } from '$lib/stores/survey';
  import { lookupPatientByPhone } from '$lib/supabase';

  let keyboardOffset = 0;
  let keyboardOpen = false;

  onMount(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      keyboardOffset = window.innerHeight - vv.height;
      keyboardOpen = keyboardOffset > 100;

      // When keyboard opens, scroll focused input into view
      if (keyboardOpen) {
        requestAnimationFrame(() => {
          const el = document.activeElement;
          if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      }
    };

    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  });

  import WelcomeScreen from './steps/WelcomeScreen.svelte';
  import Step1Nombre from './steps/Step1Nombre.svelte';
  import Step2Telefono from './steps/Step2Telefono.svelte';
  import Step3FechaNacimiento from './steps/Step3FechaNacimiento.svelte';
  import Step4Sexo from './steps/Step4Sexo.svelte';
  import Step5Altura from './steps/Step4Altura.svelte';
  import Step6TipoSangre from './steps/Step5TipoSangre.svelte';
  import Step7FactorRh from './steps/Step6FactorRh.svelte';
  import Step8IntensidadDolor from './steps/Step9IntensidadDolor.svelte';
  import Step9Enfermedades from './steps/Step10Enfermedades.svelte';
  import Step10Alergias from './steps/Step11Alergias.svelte';
  import Step11HistorialFamiliar from './steps/Step12HistorialFamiliar.svelte';
  import Step12Medicamentos from './steps/Step13Medicamentos.svelte';
  import Step13Cita from './steps/StepCita.svelte';
  import Step14Enviar from './steps/Step15Enviar.svelte';

  const stepTitles = [
    'Bienvenida',
    'Teléfono',
    'Nombre',
    'Fecha de Nacimiento',
    'Sexo',
    'Altura',
    'Tipo de Sangre',
    'Factor RH',
    'Intensidad del Dolor',
    'Enfermedades',
    'Alergias',
    'Historial Familiar',
    'Medicamentos',
    'Cita',
    'Enviar'
  ];

  let isLookingUp = false;
  let toastMessage = '';
  let showToast = false;

  function displayToast(message: string) {
    toastMessage = message;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  async function handlePhoneNext() {
    const data = $surveyData;
    if (!validateStep(1, data)) return;

    isLookingUp = true;
    try {
      const patient = await lookupPatientByPhone(data.telefono);
      if (patient) {
        autoFillFromPatient(patient);
        displayToast('Bienvenido/a de nuevo');
      }
    } catch (e) {
      console.error('Phone lookup failed:', e);
    } finally {
      isLookingUp = false;
      currentStep.set($isReturningPatient ? 8 : 2);
    }
  }

  $: totalVisible = $isPresencial ? TOTAL_STEPS - 2 : TOTAL_STEPS - 1;
  $: displayStep = $isPresencial && $currentStep > 13 ? $currentStep - 1 : $currentStep;
  $: progressPercent = (displayStep / totalVisible) * 100;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    if ($currentStep === 0 || $currentStep >= TOTAL_STEPS - 1) return;
    if (!$isCurrentStepValid) return;
    e.preventDefault();
    if ($currentStep === 1) {
      handlePhoneNext();
    } else {
      nextStep();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="survey-form">
  {#if !$submitSuccess && $currentStep > 0}
    <!-- Progress Header -->
    <header class="progress-header">
      <div class="progress-info">
        <span class="step-counter">{displayStep} / {totalVisible}</span>
        <span class="step-title">{stepTitles[$currentStep]}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
    </header>
  {/if}

  <!-- Step Content -->
  <main class="step-content" style={keyboardOpen ? `padding-bottom: ${keyboardOffset + 80}px` : ''}>
    {#if $currentStep === 0}
      <WelcomeScreen />
    {:else if $currentStep === 1}
      <Step2Telefono />
    {:else if $currentStep === 2}
      <Step1Nombre />
    {:else if $currentStep === 3}
      <Step3FechaNacimiento />
    {:else if $currentStep === 4}
      <Step4Sexo />
    {:else if $currentStep === 5}
      <Step5Altura />
    {:else if $currentStep === 6}
      <Step6TipoSangre />
    {:else if $currentStep === 7}
      <Step7FactorRh />
    {:else if $currentStep === 8}
      <Step8IntensidadDolor />
    {:else if $currentStep === 9}
      <Step9Enfermedades />
    {:else if $currentStep === 10}
      <Step10Alergias />
    {:else if $currentStep === 11}
      <Step11HistorialFamiliar />
    {:else if $currentStep === 12}
      <Step12Medicamentos />
    {:else if $currentStep === 13}
      <Step13Cita />
    {:else if $currentStep === 14}
      <Step14Enviar />
    {/if}
  </main>

  {#if !$submitSuccess && $currentStep > 0}
    <!-- Navigation Footer -->
    <footer class="nav-footer" style="bottom: {keyboardOffset}px">
      <button
        type="button"
        class="nav-button prev"
        on:click={prevStep}
        disabled={$currentStep === 0}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Anterior
      </button>

      {#if $currentStep < TOTAL_STEPS - 1}
        {#if $currentStep === 1}
          <!-- Phone step: custom handler with lookup -->
          <button
            type="button"
            class="nav-button next"
            on:click={handlePhoneNext}
            disabled={!$isCurrentStepValid || isLookingUp}
          >
            {#if isLookingUp}
              <span class="spinner-small"></span>
              Buscando...
            {:else}
              Siguiente
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            {/if}
          </button>
        {:else}
          <button
            type="button"
            class="nav-button next"
            on:click={nextStep}
            disabled={!$isCurrentStepValid}
          >
            Siguiente
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        {/if}
      {/if}
    </footer>
  {/if}

  <!-- Toast notification -->
  {#if showToast}
    <div class="toast" class:show={showToast}>
      <span class="toast-icon">&#10003;</span>
      {toastMessage}
    </div>
  {/if}
</div>

<style>
  .survey-form {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    background: white;
    position: relative;
  }

  .progress-header {
    position: sticky;
    top: 0;
    background: white;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    z-index: 10;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .step-counter {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2563eb;
    background: #eff6ff;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
  }

  .step-title {
    font-size: 0.875rem;
    color: #64748b;
  }

  .progress-bar {
    height: 0.5rem;
    background: #e2e8f0;
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #3b82f6);
    border-radius: 0.25rem;
    transition: width 0.3s ease;
  }

  .step-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 5rem;
  }

  .nav-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-top: 1px solid #e2e8f0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .nav-button.prev {
    background: white;
    color: #64748b;
  }

  .nav-button.prev:hover:not(:disabled) {
    border-color: #94a3b8;
    color: #1e293b;
  }

  .nav-button.prev:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-button.next {
    flex: 1;
    justify-content: center;
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }

  .nav-button.next:hover:not(:disabled) {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .nav-button.next:disabled {
    background: #94a3b8;
    border-color: #94a3b8;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .toast {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%) translateY(-100%);
    background: #22c55e;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-size: 0.925rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
    z-index: 100;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }

  .toast-icon {
    font-weight: 700;
  }

  @media (min-width: 640px) {
    .survey-form {
      max-width: 480px;
      margin: 0 auto;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
    }
  }
</style>
