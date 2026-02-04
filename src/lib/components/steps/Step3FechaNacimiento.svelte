<script lang="ts">
  import { surveyData } from '$lib/stores/survey';

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  let selectedYear = '';
  let selectedMonth = '';
  let selectedDay = '';

  // 기존 값이 있으면 분해 (자동입력 케이스)
  $: if ($surveyData.fechaNacimiento && !selectedYear) {
    const parts = $surveyData.fechaNacimiento.split('-');
    if (parts.length === 3) {
      selectedYear = parts[0];
      selectedMonth = parts[1];
      selectedDay = parts[2];
    }
  }

  // 선택한 월/년에 따른 일수 계산
  function getDaysInMonth(year: string, month: string): number {
    if (!year || !month) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  }

  $: daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  $: days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  // 3개 모두 선택되면 store 동기화
  $: if (selectedYear && selectedMonth && selectedDay) {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth);
    if (parseInt(selectedDay) > maxDay) {
      selectedDay = String(maxDay).padStart(2, '0');
    }
    $surveyData.fechaNacimiento = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  }

  // 나이 계산 (로컬 변수에서 직접)
  function calculateAge(y: string, m: string, d: string): number | null {
    if (!y || !m || !d) return null;
    const now = new Date();
    let age = now.getFullYear() - parseInt(y);
    const monthDiff = (now.getMonth() + 1) - parseInt(m);
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parseInt(d))) {
      age--;
    }
    return age >= 0 ? age : null;
  }

  $: age = calculateAge(selectedYear, selectedMonth, selectedDay);
</script>

<div class="step-container">
  <h2 class="step-title">Fecha de Nacimiento</h2>
  <p class="step-description">Seleccione su fecha de nacimiento</p>

  <div class="date-selects">
    <div class="select-wrapper">
      <label class="select-label" for="year">Ano</label>
      <select id="year" class="date-select" bind:value={selectedYear} >
        <option value="" disabled selected>Ano</option>
        {#each years as year}
          <option value={String(year)}>{year}</option>
        {/each}
      </select>
    </div>

    <div class="select-wrapper">
      <label class="select-label" for="month">Mes</label>
      <select id="month" class="date-select" bind:value={selectedMonth} >
        <option value="" disabled selected>Mes</option>
        {#each months as month}
          <option value={month.value}>{month.label}</option>
        {/each}
      </select>
    </div>

    <div class="select-wrapper">
      <label class="select-label" for="day">Dia</label>
      <select id="day" class="date-select" bind:value={selectedDay} >
        <option value="" disabled selected>Dia</option>
        {#each days as day}
          <option value={day}>{parseInt(day)}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if age !== null}
    <p class="age-display">Edad: {age} anos</p>
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

  .date-selects {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
  }

  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .select-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
  }

  .date-select {
    padding: 0.875rem 0.5rem;
    font-size: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    outline: none;
    background: white;
    color: #1e293b;
    cursor: pointer;
    transition: border-color 0.2s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }

  .date-select:focus {
    border-color: #2563eb;
  }

  .age-display {
    color: #2563eb;
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
    padding: 0.75rem;
    background: #eff6ff;
    border-radius: 0.5rem;
    text-align: center;
  }
</style>
