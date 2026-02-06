<script lang="ts">
  import {
    surveyData,
    validateAllRequired,
    isSubmitting,
    submitError,
    submitSuccess,
    isPresencial,
    toDbFormat,
    toAppointmentFormat,
    resetSurvey
  } from '$lib/stores/survey';
  import { submitPatientData, createAppointment } from '$lib/supabase';

  $: isValid = validateAllRequired($surveyData);
  $: formattedData = toDbFormat($surveyData);

  let appointmentConfirmed = '';

  async function handleSubmit() {
    if (!isValid || $isSubmitting) return;

    isSubmitting.set(true);
    submitError.set(null);

    try {
      const patient = await submitPatientData(formattedData);

      if (!$isPresencial) {
        const appointmentData = toAppointmentFormat($surveyData);
        if (patient?.id) {
          appointmentData.patient_id = patient.id;
        }
        await createAppointment(appointmentData);
        appointmentConfirmed = `${$surveyData.fechaCita} a las ${$surveyData.horaCita}`;
      }

      submitSuccess.set(true);
    } catch (error) {
      submitError.set(error instanceof Error ? error.message : 'Error al enviar los datos');
    } finally {
      isSubmitting.set(false);
    }
  }

  function handleNewSurvey() {
    resetSurvey();
  }
</script>

<div class="step-container">
  {#if $submitSuccess}
    <div class="success-container">
      <div class="success-icon">✓</div>
      <h2 class="success-title">¡Encuesta Enviada!</h2>
      <p class="success-message">
        Gracias por completar la encuesta. Sus datos han sido registrados exitosamente.
      </p>
      {#if appointmentConfirmed}
        <div class="appointment-confirm">
          <span class="appointment-icon">&#128197;</span>
          <p class="appointment-text">Su cita ha sido agendada para:<br/><strong>{appointmentConfirmed}</strong></p>
        </div>
      {/if}
      <button type="button" class="new-survey-button" on:click={handleNewSurvey}>
        Completar otra encuesta
      </button>
    </div>
  {:else}
    <h2 class="step-title">Resumen y Envío</h2>
    <p class="step-description">Revise sus datos antes de enviar</p>

    <div class="summary-card">
      <div class="summary-section">
        <h3>Datos Personales</h3>
        <div class="summary-row">
          <span class="label">Nombre:</span>
          <span class="value">{$surveyData.nombre || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Apellido:</span>
          <span class="value">{$surveyData.apellido || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Teléfono:</span>
          <span class="value">{$surveyData.telefono || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Sexo:</span>
          <span class="value">{$surveyData.sexo === 'masculino' ? 'Masculino' : $surveyData.sexo === 'femenino' ? 'Femenino' : '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Fecha de nacimiento:</span>
          <span class="value">{$surveyData.fechaNacimiento || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Altura:</span>
          <span class="value">{$surveyData.altura ? `${$surveyData.altura} cm` : '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Tipo de sangre:</span>
          <span class="value">{$surveyData.tipoSangre}{$surveyData.factorRh || '-'}</span>
        </div>
      </div>

      {#if !$isPresencial}
        <div class="summary-section">
          <h3>Cita Programada</h3>
          <div class="summary-row">
            <span class="label">Fecha:</span>
            <span class="value">{$surveyData.fechaCita || '-'}</span>
          </div>
          <div class="summary-row">
            <span class="label">Hora:</span>
            <span class="value">{$surveyData.horaCita || '-'}</span>
          </div>
        </div>
      {/if}

      <div class="summary-section">
        <h3>Información del Dolor</h3>
        <div class="summary-row">
          <span class="label">Horario:</span>
          <span class="value">{$surveyData.horarioDolor || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Inicio:</span>
          <span class="value">{$surveyData.inicioDolor || '-'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Intensidad:</span>
          <span class="value intensity">{$surveyData.intensidadDolor}/10</span>
        </div>
      </div>

      <div class="summary-section">
        <h3>Historial Médico</h3>
        <div class="summary-row">
          <span class="label">Enfermedades:</span>
          <span class="value">{$surveyData.enfermedadesPreexistentes || 'Ninguna'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Alergias:</span>
          <span class="value">{$surveyData.alergias || 'Ninguna'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Historial familiar:</span>
          <span class="value">{$surveyData.historialFamiliar || 'Ninguno'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Medicamentos:</span>
          <span class="value">{$surveyData.medicamentosActuales || 'Ninguno'}</span>
        </div>
        <div class="summary-row">
          <span class="label">Dispositivos:</span>
          <span class="value">{$surveyData.dispositivosImplantados || 'Ninguno'}</span>
        </div>
      </div>
    </div>

    {#if $submitError}
      <div class="error-box">
        <span class="error-icon">!</span>
        <p>{$submitError}</p>
      </div>
    {/if}

    {#if !isValid}
      <div class="warning-box">
        <span class="warning-icon">!</span>
        <p>Complete todos los campos obligatorios para enviar la encuesta.</p>
      </div>
    {/if}

    <button
      type="button"
      class="submit-button"
      class:disabled={!isValid || $isSubmitting}
      disabled={!isValid || $isSubmitting}
      on:click={handleSubmit}
    >
      {#if $isSubmitting}
        <span class="spinner"></span>
        Enviando...
      {:else}
        Enviar Encuesta
      {/if}
    </button>
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

  .summary-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #f8fafc;
    border-radius: 1rem;
    padding: 1rem;
  }

  .summary-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary-section h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2563eb;
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .label {
    color: #64748b;
  }

  .value {
    color: #1e293b;
    font-weight: 500;
    text-align: right;
    max-width: 60%;
    word-break: break-word;
  }

  .value.intensity {
    color: #f59e0b;
    font-weight: 700;
  }

  .warning-box,
  .error-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.75rem;
  }

  .warning-box {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
  }

  .error-box {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
  }

  .warning-icon,
  .error-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .warning-icon {
    background: #f59e0b;
    color: white;
  }

  .error-icon {
    background: #ef4444;
    color: white;
  }

  .warning-box p,
  .error-box p {
    margin: 0;
    font-size: 0.875rem;
  }

  .warning-box p {
    color: #92400e;
  }

  .error-box p {
    color: #991b1b;
  }

  .submit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 600;
    border: none;
    border-radius: 1rem;
    background: #22c55e;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 1rem;
  }

  .submit-button:hover:not(.disabled) {
    background: #16a34a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .submit-button.disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .success-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1rem;
  }

  .success-icon {
    width: 5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #22c55e;
    color: white;
    border-radius: 50%;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .success-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  .success-message {
    color: #64748b;
    margin: 0 0 2rem 0;
  }

  .new-survey-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border: 2px solid #2563eb;
    border-radius: 0.75rem;
    background: white;
    color: #2563eb;
    cursor: pointer;
    transition: all 0.2s;
  }

  .new-survey-button:hover {
    background: #2563eb;
    color: white;
  }

  .appointment-confirm {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #eff6ff;
    border: 2px solid #2563eb;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .appointment-icon {
    font-size: 1.5rem;
  }

  .appointment-text {
    margin: 0;
    font-size: 0.95rem;
    color: #1e293b;
    text-align: left;
  }
</style>
