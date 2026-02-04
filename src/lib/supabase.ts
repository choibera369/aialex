import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using placeholder values for development.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type PatientData = {
  nombre: string;
  telefono: string;
  fecha_nacimiento: string;
  sexo: string;
  altura: number | null;
  tipo_sangre: string | null;
  factor_rh: string | null;
  horario_dolor: string;
  inicio_dolor: string;
  intensidad_dolor: number;
  enfermedades_preexistentes: string | null;
  alergias: string | null;
  historial_familiar: string | null;
  medicamentos_actuales: string | null;
  dispositivos_implantados: string | null;
};

export async function lookupPatientByPhone(telefono: string): Promise<PatientData | null> {
  const cleaned = telefono.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('telefono', cleaned)
    .maybeSingle();

  if (error) {
    console.error('Error looking up patient:', error.message);
    return null;
  }

  return data;
}

export async function submitPatientData(data: PatientData) {
  const { data: result, error } = await supabase
    .from('patients')
    .upsert([data], { onConflict: 'telefono' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

// --- Appointments ---

export type BookedSlot = {
  fecha_cita: string;
  hora_cita: string;
};

export async function fetchBookedSlots(startDate: string, endDate: string): Promise<BookedSlot[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('fecha_cita, hora_cita')
    .eq('status', 'scheduled')
    .gte('fecha_cita', startDate)
    .lte('fecha_cita', endDate);

  if (error) {
    console.error('Error fetching booked slots:', error.message);
    return [];
  }

  return data || [];
}

export type AppointmentData = {
  patient_id?: string;
  telefono: string;
  fecha_cita: string;
  hora_cita: string;
  status: string;
};

export async function createAppointment(data: AppointmentData) {
  const { data: result, error } = await supabase
    .from('appointments')
    .insert([data])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este horario ya está reservado. Por favor, seleccione otro horario.');
    }
    throw new Error(error.message);
  }

  return result;
}
