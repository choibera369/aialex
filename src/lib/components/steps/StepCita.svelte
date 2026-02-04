<script lang="ts">
  import { onMount } from 'svelte';
  import { surveyData, errorMessages } from '$lib/stores/survey';
  import { fetchBookedSlots, type BookedSlot } from '$lib/supabase';

  let bookedSlots: BookedSlot[] = [];
  let loading = true;
  let currentWeekOffset = 0; // 0 = this week, 1 = next week

  const HOURS_WEEKDAY = [9, 10, 11, 12, 13, 14, 15, 16]; // 9:00-16:00 (last slot starts at 16:00, ends 17:00)
  const HOURS_SATURDAY = [9, 10, 11, 12, 13]; // 9:00-13:00 (last slot starts at 13:00, ends 14:00)
  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatHour(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  function formatDateDisplay(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  $: monday = addDays(getMonday(new Date()), currentWeekOffset * 7);
  $: weekDays = Array.from({ length: 6 }, (_, i) => addDays(monday, i)); // Mon-Sat
  $: weekRangeLabel = `${formatDateDisplay(monday)} - ${formatDateDisplay(addDays(monday, 5))}`;

  function isBooked(dateStr: string, hourStr: string): boolean {
    return bookedSlots.some(s => s.fecha_cita === dateStr && s.hora_cita.startsWith(hourStr));
  }

  function isPast(date: Date, hour: number): boolean {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime <= now;
  }

  function getHoursForDay(date: Date): number[] {
    const day = date.getDay();
    if (day === 6) return HOURS_SATURDAY; // Saturday
    if (day === 0) return []; // Sunday (shouldn't happen)
    return HOURS_WEEKDAY;
  }

  function isSlotAvailable(date: Date, hour: number): boolean {
    const dateStr = formatDate(date);
    const hourStr = formatHour(hour);
    const validHours = getHoursForDay(date);
    if (!validHours.includes(hour)) return false;
    if (isPast(date, hour)) return false;
    if (isBooked(dateStr, hourStr)) return false;
    return true;
  }

  function selectSlot(date: Date, hour: number) {
    if (!isSlotAvailable(date, hour)) return;
    $surveyData.fechaCita = formatDate(date);
    $surveyData.horaCita = formatHour(hour);
  }

  function isSelected(date: Date, hour: number): boolean {
    return $surveyData.fechaCita === formatDate(date) && $surveyData.horaCita === formatHour(hour);
  }

  function getSlotClass(date: Date, hour: number): string {
    const validHours = getHoursForDay(date);
    if (!validHours.includes(hour)) return 'slot disabled';
    if (isPast(date, hour)) return 'slot past';
    const dateStr = formatDate(date);
    const hourStr = formatHour(hour);
    if (isBooked(dateStr, hourStr)) return 'slot booked';
    if (isSelected(date, hour)) return 'slot selected';
    return 'slot available';
  }

  async function loadSlots() {
    loading = true;
    const start = formatDate(getMonday(new Date()));
    const end = formatDate(addDays(getMonday(new Date()), 13)); // 2 weeks
    bookedSlots = await fetchBookedSlots(start, end);
    loading = false;
  }

  function prevWeek() {
    if (currentWeekOffset > 0) {
      currentWeekOffset--;
    }
  }

  function nextWeek() {
    if (currentWeekOffset < 1) {
      currentWeekOffset++;
    }
  }

  // All hours for the grid (union of weekday + saturday hours)
  const allHours = HOURS_WEEKDAY;

  function getDayLabel(date: Date): string {
    const dayIndex = (date.getDay() + 6) % 7; // Mon=0, Tue=1, ..., Sat=5
    return `${DAY_NAMES[dayIndex]} ${date.getDate()}`;
  }

  function formatSelectedDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  }

  onMount(() => {
    loadSlots();
  });
</script>

<div class="step-container">
  <h2 class="step-title">Agendar Cita</h2>
  <p class="step-description">Seleccione la fecha y hora de su cita</p>

  {#if loading}
    <div class="loading">
      <span class="spinner"></span>
      Cargando horarios disponibles...
    </div>
  {:else}
    <!-- Week navigation -->
    <div class="week-nav">
      <button type="button" class="week-btn" on:click={prevWeek} disabled={currentWeekOffset === 0}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <span class="week-label">{weekRangeLabel}</span>
      <button type="button" class="week-btn" on:click={nextWeek} disabled={currentWeekOffset === 1}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <!-- Header row -->
      <div class="grid-header corner"></div>
      {#each weekDays as day}
        <div class="grid-header day-header">{getDayLabel(day)}</div>
      {/each}

      <!-- Time rows -->
      {#each allHours as hour}
        <div class="grid-header time-label">{formatHour(hour)}</div>
        {#each weekDays as day}
          <button
            type="button"
            class={getSlotClass(day, hour)}
            disabled={!isSlotAvailable(day, hour)}
            on:click={() => selectSlot(day, hour)}
          >
            {#if isSelected(day, hour)}
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            {/if}
          </button>
        {/each}
      {/each}
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot available"></span>
        <span>Disponible</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot selected"></span>
        <span>Seleccionado</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot booked"></span>
        <span>Reservado</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot past"></span>
        <span>No disponible</span>
      </div>
    </div>

    <!-- Selected slot display -->
    {#if $surveyData.fechaCita && $surveyData.horaCita}
      <div class="selection-box">
        <span class="selection-icon">&#128197;</span>
        <div class="selection-info">
          <span class="selection-label">Cita seleccionada:</span>
          <span class="selection-value">{formatSelectedDate($surveyData.fechaCita)} a las {$surveyData.horaCita}</span>
        </div>
      </div>
    {:else}
      <p class="hint-text">{errorMessages.cita}</p>
    {/if}
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

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem;
    color: #64748b;
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 3px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Week navigation */
  .week-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }

  .week-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    color: #1e293b;
    transition: all 0.2s;
  }

  .week-btn:hover:not(:disabled) {
    border-color: #2563eb;
    color: #2563eb;
  }

  .week-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .week-label {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
  }

  /* Calendar grid */
  .calendar-grid {
    display: grid;
    grid-template-columns: 3.5rem repeat(6, 1fr);
    gap: 2px;
    background: #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .grid-header {
    background: #f1f5f9;
    padding: 0.375rem 0.125rem;
    text-align: center;
    font-size: 0.7rem;
    font-weight: 600;
    color: #475569;
  }

  .corner {
    background: #f1f5f9;
  }

  .day-header {
    font-size: 0.65rem;
    line-height: 1.2;
  }

  .time-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #64748b;
  }

  /* Slot styles */
  .slot {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.25rem;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.75rem;
    padding: 0;
  }

  .slot.available {
    background: white;
  }

  .slot.available:hover {
    background: #dbeafe;
  }

  .slot.selected {
    background: #2563eb;
    color: white;
  }

  .slot.booked {
    background: #fecaca;
    cursor: not-allowed;
  }

  .slot.past {
    background: #f1f5f9;
    color: #cbd5e1;
    cursor: not-allowed;
  }

  .slot.disabled {
    background: #f8fafc;
    cursor: not-allowed;
  }

  /* Legend */
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    padding: 0.5rem 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .legend-dot {
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }

  .legend-dot.available {
    background: white;
  }

  .legend-dot.selected {
    background: #2563eb;
    border-color: #2563eb;
  }

  .legend-dot.booked {
    background: #fecaca;
    border-color: #fca5a5;
  }

  .legend-dot.past {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }

  /* Selection display */
  .selection-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #eff6ff;
    border: 2px solid #2563eb;
    border-radius: 0.75rem;
  }

  .selection-icon {
    font-size: 1.5rem;
  }

  .selection-info {
    display: flex;
    flex-direction: column;
  }

  .selection-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  .selection-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
  }

  .hint-text {
    color: #94a3b8;
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
  }
</style>
