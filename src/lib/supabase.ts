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

// --- AI Analyses (Doctor page) ---

export type AiAnalysis = {
  id: string;
  patient_id: string;
  analysis_data: Record<string, any>;
  nivel_urgencia: string;
  created_at: string;
};

export type PatientWithAnalysis = {
  patient: PatientData & { id: string; created_at: string };
  analysis: AiAnalysis;
  measurements: {
    scale: Record<string, any> | null;
    bp: Record<string, any> | null;
  };
};

export async function fetchLatestAnalysis(): Promise<PatientWithAnalysis | null> {
  // Get latest analysis
  const { data: analysis, error: aErr } = await supabase
    .from('ai_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (aErr || !analysis) {
    console.error('Error fetching analysis:', aErr?.message);
    return null;
  }

  // Get patient
  const { data: patient, error: pErr } = await supabase
    .from('patients')
    .select('*')
    .eq('id', analysis.patient_id)
    .maybeSingle();

  if (pErr || !patient) {
    console.error('Error fetching patient:', pErr?.message);
    return null;
  }

  // Get latest scale measurement
  const { data: scale } = await supabase
    .from('measurements')
    .select('*')
    .eq('patient_id', analysis.patient_id)
    .eq('device_type', 'scale')
    .order('measured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get latest BP measurement
  const { data: bp } = await supabase
    .from('measurements')
    .select('*')
    .eq('patient_id', analysis.patient_id)
    .eq('device_type', 'blood_pressure')
    .order('measured_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    patient,
    analysis,
    measurements: { scale: scale || null, bp: bp || null }
  };
}

export function subscribeToAnalyses(callback: (payload: any) => void) {
  return supabase
    .channel('ai_analyses_realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ai_analyses' },
      callback
    )
    .subscribe();
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
