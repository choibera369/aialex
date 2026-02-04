import { writable, derived, get } from 'svelte/store';

export const TOTAL_STEPS = 18;

export const errorMessages = {
  nombre: 'El nombre debe tener entre 2 y 50 caracteres',
  apellido: 'El apellido debe tener entre 2 y 50 caracteres',
  telefono: 'El número de teléfono debe tener 10 dígitos',
  fechaNacimiento: 'Por favor, seleccione una fecha válida',
  sexo: 'Por favor, seleccione su sexo',
  altura: 'La altura debe estar entre 50 y 250 cm',
  tipoSangre: 'Por favor, seleccione un tipo de sangre',
  factorRh: 'Por favor, seleccione el factor RH',
  cita: 'Por favor, seleccione una fecha y hora para su cita',
  horarioDolor: 'Por favor, seleccione el horario del dolor',
  inicioDolor: 'Por favor, ingrese al menos 1 carácter',
  intensidadDolor: 'La intensidad debe estar entre 1 y 10'
};

export interface SurveyData {
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string;
  sexo: string;
  altura: string;
  tipoSangre: string;
  factorRh: string;
  fechaCita: string;
  horaCita: string;
  horarioDolor: string;
  inicioDolor: string;
  intensidadDolor: number;
  enfermedadesPreexistentes: string;
  alergias: string;
  historialFamiliar: string;
  medicamentosActuales: string;
  dispositivosImplantados: string;
}

const initialData: SurveyData = {
  nombre: '',
  apellido: '',
  telefono: '',
  fechaNacimiento: '',
  sexo: '',
  altura: '',
  tipoSangre: '',
  factorRh: '',
  fechaCita: '',
  horaCita: '',
  horarioDolor: '',
  inicioDolor: '',
  intensidadDolor: 5,
  enfermedadesPreexistentes: '',
  alergias: '',
  historialFamiliar: '',
  medicamentosActuales: '',
  dispositivosImplantados: ''
};

export const currentStep = writable(0);
export const surveyData = writable<SurveyData>({ ...initialData });
export const isSubmitting = writable(false);
export const submitError = writable<string | null>(null);
export const submitSuccess = writable(false);
export const isReturningPatient = writable(false);

// Validation functions
export function validateNombre(value: string): boolean {
  const cleaned = value.trim();
  const hasSpecialChars = /[^a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s]/.test(cleaned);
  return cleaned.length >= 2 && cleaned.length <= 50 && !hasSpecialChars;
}

export function validateApellido(value: string): boolean {
  const cleaned = value.trim();
  const hasSpecialChars = /[^a-zA-ZáéíóúñÁÉÍÓÚÑüÜ\s]/.test(cleaned);
  return cleaned.length >= 2 && cleaned.length <= 50 && !hasSpecialChars;
}

export function validateTelefono(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 10;
}

export function validateFechaNacimiento(value: string): boolean {
  if (!value) return false;
  const parts = value.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const nowDay = now.getDate();
  if (year > nowYear) return false;
  if (year === nowYear && month > nowMonth) return false;
  if (year === nowYear && month === nowMonth && day >= nowDay) return false;
  return true;
}

export function validateSexo(value: string): boolean {
  return ['masculino', 'femenino'].includes(value);
}

export function validateAltura(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 50 && num <= 250;
}

export function validateTipoSangre(value: string): boolean {
  return ['A', 'B', 'O', 'AB', 'No sé'].includes(value);
}

export function validateFactorRh(value: string): boolean {
  return ['+', '-', 'No sé'].includes(value);
}

export function validateCita(fechaCita: string, horaCita: string): boolean {
  return fechaCita.trim().length > 0 && horaCita.trim().length > 0;
}

export function validateHorarioDolor(value: string): boolean {
  return value.trim().length > 0;
}

export function validateInicioDolor(value: string): boolean {
  return value.trim().length >= 1;
}

export function validateIntensidadDolor(value: number): boolean {
  return value >= 1 && value <= 10;
}

// Step order:
// 0: Welcome screen
// 1: Telefono
// 2: Nombre + Apellido
// 3: Fecha de Nacimiento
// 4: Sexo
// 5: Altura
// 6: Tipo de Sangre
// 7: Factor RH
// 8: Horario del Dolor
// 9: Inicio del Dolor
// 10: Intensidad del Dolor
// 11: Enfermedades
// 12: Alergias
// 13: Historial Familiar
// 14: Medicamentos
// 15: Dispositivos
// 16: Cita (appointment calendar)
// 17: Enviar

// Validate specific step
export function validateStep(step: number, data: SurveyData): boolean {
  switch (step) {
    case 0:
      return true; // Welcome screen - always valid
    case 1:
      return validateTelefono(data.telefono);
    case 2:
      return validateNombre(data.nombre) && validateApellido(data.apellido);
    case 3:
      return validateFechaNacimiento(data.fechaNacimiento);
    case 4:
      return validateSexo(data.sexo);
    case 5:
      return validateAltura(data.altura);
    case 6:
      return validateTipoSangre(data.tipoSangre);
    case 7:
      return validateFactorRh(data.factorRh);
    case 8:
      return validateHorarioDolor(data.horarioDolor);
    case 9:
      return validateInicioDolor(data.inicioDolor);
    case 10:
      return validateIntensidadDolor(data.intensidadDolor);
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
      return true; // Optional fields
    case 16:
      return validateCita(data.fechaCita, data.horaCita);
    case 17:
      return validateAllRequired(data);
    default:
      return false;
  }
}

// Validate all required fields (for submit)
export function validateAllRequired(data: SurveyData): boolean {
  return (
    validateNombre(data.nombre) &&
    validateApellido(data.apellido) &&
    validateTelefono(data.telefono) &&
    validateFechaNacimiento(data.fechaNacimiento) &&
    validateSexo(data.sexo) &&
    validateAltura(data.altura) &&
    validateTipoSangre(data.tipoSangre) &&
    validateFactorRh(data.factorRh) &&
    validateCita(data.fechaCita, data.horaCita) &&
    validateHorarioDolor(data.horarioDolor) &&
    validateInicioDolor(data.inicioDolor) &&
    validateIntensidadDolor(data.intensidadDolor)
  );
}

// Derived store for current step validity
export const isCurrentStepValid = derived(
  [currentStep, surveyData],
  ([$currentStep, $surveyData]) => validateStep($currentStep, $surveyData)
);

// Navigation functions
export function nextStep() {
  const step = get(currentStep);
  const data = get(surveyData);
  if (validateStep(step, data) && step < TOTAL_STEPS - 1) {
    currentStep.set(step + 1);
  }
}

export function prevStep() {
  const step = get(currentStep);
  if (step > 0) {
    currentStep.set(step - 1);
  }
}

export function goToStep(step: number) {
  if (step >= 0 && step <= TOTAL_STEPS - 1) {
    currentStep.set(step);
  }
}

// Auto-fill from existing patient data
export function autoFillFromPatient(patient: Record<string, unknown>) {
  const fullName = (patient.nombre as string) || '';
  const parts = fullName.trim().split(/\s+/);
  const nombre = parts[0] || '';
  const apellido = parts.slice(1).join(' ') || '';

  surveyData.update((data) => ({
    ...data,
    nombre,
    apellido,
    sexo: (patient.sexo as string) || data.sexo,
    fechaNacimiento: (patient.fecha_nacimiento as string) || data.fechaNacimiento,
    altura: patient.altura != null ? String(patient.altura) : data.altura,
    tipoSangre: (patient.tipo_sangre as string) || (patient.tipo_sangre === null ? 'No sé' : data.tipoSangre),
    factorRh: (patient.factor_rh as string) || (patient.factor_rh === null ? 'No sé' : data.factorRh),
    horarioDolor: (patient.horario_dolor as string) || data.horarioDolor,
    inicioDolor: (patient.inicio_dolor as string) || data.inicioDolor,
    intensidadDolor: (patient.intensidad_dolor as number) || data.intensidadDolor,
    enfermedadesPreexistentes: (patient.enfermedades_preexistentes as string) || data.enfermedadesPreexistentes,
    alergias: (patient.alergias as string) || data.alergias,
    historialFamiliar: (patient.historial_familiar as string) || data.historialFamiliar,
    medicamentosActuales: (patient.medicamentos_actuales as string) || data.medicamentosActuales,
    dispositivosImplantados: (patient.dispositivos_implantados as string) || data.dispositivosImplantados
  }));

  isReturningPatient.set(true);
}

// Reset survey
export function resetSurvey() {
  currentStep.set(0);
  surveyData.set({ ...initialData });
  isSubmitting.set(false);
  submitError.set(null);
  submitSuccess.set(false);
  isReturningPatient.set(false);
}

// Convert to database format
export function toDbFormat(data: SurveyData) {
  return {
    nombre: `${data.nombre.trim()} ${data.apellido.trim()}`,
    telefono: data.telefono.replace(/\D/g, ''),
    fecha_nacimiento: data.fechaNacimiento,
    sexo: data.sexo,
    altura: parseFloat(data.altura) || null,
    tipo_sangre: data.tipoSangre === 'No sé' ? null : data.tipoSangre,
    factor_rh: data.factorRh === 'No sé' ? null : data.factorRh,
    horario_dolor: data.horarioDolor,
    inicio_dolor: data.inicioDolor.trim(),
    intensidad_dolor: data.intensidadDolor,
    enfermedades_preexistentes: data.enfermedadesPreexistentes.trim() || null,
    alergias: data.alergias.trim() || null,
    historial_familiar: data.historialFamiliar.trim() || null,
    medicamentos_actuales: data.medicamentosActuales.trim() || null,
    dispositivos_implantados: data.dispositivosImplantados.trim() || null
  };
}

// Convert to appointment format for appointments table
export function toAppointmentFormat(data: SurveyData): {
  patient_id?: string;
  telefono: string;
  fecha_cita: string;
  hora_cita: string;
  status: string;
} {
  return {
    telefono: data.telefono.replace(/\D/g, ''),
    fecha_cita: data.fechaCita,
    hora_cita: data.horaCita,
    status: 'scheduled'
  };
}
