<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fetchLatestAnalysis, subscribeToAnalyses } from '$lib/supabase';
  import type { PatientWithAnalysis } from '$lib/supabase';

  let data: PatientWithAnalysis | null = null;
  let loading = true;
  let error = '';
  let lastUpdated = '';
  let subscription: any = null;

  // Helper: use _kr field with Spanish fallback
  function kr(obj: any, field: string): string {
    if (!obj) return '-';
    return obj[field + '_kr'] || obj[field] || '-';
  }

  function krArr(obj: any, field: string): string[] {
    if (!obj) return [];
    return obj[field + '_kr'] || obj[field] || [];
  }

  function urgencyColor(nivel: string): string {
    if (nivel === 'alto') return '#ef4444';
    if (nivel === 'medio') return '#f59e0b';
    return '#22c55e';
  }

  function urgencyLabel(nivel: string): string {
    if (nivel === 'alto') return '높음';
    if (nivel === 'medio') return '보통';
    return '낮음';
  }

  function formatDate(iso: string): string {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return iso;
    }
  }

  function formatDateTime(iso: string): string {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  function calcAge(dob: string): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async function loadData() {
    loading = true;
    error = '';
    try {
      data = await fetchLatestAnalysis();
      if (!data) {
        error = '분석 데이터가 없습니다.';
      }
      lastUpdated = new Date().toLocaleTimeString('ko-KR');
    } catch (e: any) {
      error = e.message || '데이터 로드 실패';
    }
    loading = false;
  }

  onMount(async () => {
    await loadData();

    subscription = subscribeToAnalyses(async () => {
      await loadData();
    });
  });

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  // Reactive references to analysis data
  $: analysis = data?.analysis?.analysis_data || null;
  $: analisis = analysis?.analisis || null;
  $: prescripcion = analysis?.prescripcion || null;
  $: patient = data?.patient || null;
  $: scale = data?.measurements?.scale || null;
  $: bp = data?.measurements?.bp || null;
  $: urgencia = analysis?.nivel_urgencia || 'bajo';
</script>

<svelte:head>
  <title>한의사 진단 화면</title>
</svelte:head>

<div class="doctor-page">
  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <h1>한의사 AI 진단</h1>
      <span class="subtitle">Puebla 한의원</span>
    </div>
    <div class="header-right">
      {#if lastUpdated}
        <span class="updated">갱신: {lastUpdated}</span>
      {/if}
      <button class="refresh-btn" on:click={loadData} disabled={loading}>
        {loading ? '로딩...' : '새로고침'}
      </button>
    </div>
  </header>

  {#if loading && !data}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>데이터 로딩 중...</p>
    </div>
  {:else if error && !data}
    <div class="error-screen">
      <p>{error}</p>
      <button on:click={loadData}>다시 시도</button>
    </div>
  {:else if data && analysis}
    <!-- Urgency banner -->
    <div class="urgency-banner" style="background-color: {urgencyColor(urgencia)};">
      긴급도: {urgencyLabel(urgencia)}
      {#if urgencia === 'alto'}
        — 즉시 주의 필요
      {/if}
    </div>

    <div class="grid-container">
      <!-- Column 1: Patient Info + Body Composition -->
      <section class="card patient-card">
        <h2>환자 정보</h2>
        {#if patient}
          <div class="info-grid">
            <div class="info-item">
              <span class="label">이름</span>
              <span class="value">{patient.nombre || '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">전화번호</span>
              <span class="value">{patient.telefono || '-'}</span>
            </div>
            <div class="info-item">
              <span class="label">생년월일</span>
              <span class="value">{formatDate(patient.fecha_nacimiento)} ({calcAge(patient.fecha_nacimiento)}세)</span>
            </div>
            <div class="info-item">
              <span class="label">혈액형</span>
              <span class="value">{patient.tipo_sangre || '-'}{patient.factor_rh || ''}</span>
            </div>
            <div class="info-item">
              <span class="label">기존 질환</span>
              <span class="value">{patient.enfermedades_preexistentes || '없음'}</span>
            </div>
            <div class="info-item">
              <span class="label">알레르기</span>
              <span class="value">{patient.alergias || '없음'}</span>
            </div>
            <div class="info-item">
              <span class="label">복용 약물</span>
              <span class="value">{patient.medicamentos_actuales || '없음'}</span>
            </div>
            <div class="info-item">
              <span class="label">이식 장치</span>
              <span class="value">{patient.dispositivos_implantados || '없음'}</span>
            </div>
          </div>
        {/if}

        <h3>체성분 측정</h3>
        {#if scale}
          <div class="measurement-grid">
            {#if scale.weight}<div class="measure"><span class="m-label">체중</span><span class="m-value">{scale.weight} kg</span></div>{/if}
            {#if scale.body_fat}<div class="measure"><span class="m-label">체지방</span><span class="m-value">{scale.body_fat} %</span></div>{/if}
            {#if scale.muscle_mass}<div class="measure"><span class="m-label">근육량</span><span class="m-value">{scale.muscle_mass} kg</span></div>{/if}
            {#if scale.bmi}<div class="measure"><span class="m-label">BMI</span><span class="m-value">{scale.bmi}</span></div>{/if}
            {#if scale.body_water}<div class="measure"><span class="m-label">수분</span><span class="m-value">{scale.body_water} %</span></div>{/if}
            {#if scale.bone_mass}<div class="measure"><span class="m-label">골량</span><span class="m-value">{scale.bone_mass} kg</span></div>{/if}
            {#if scale.visceral_fat}<div class="measure"><span class="m-label">내장지방</span><span class="m-value">{scale.visceral_fat}</span></div>{/if}
            {#if scale.basal_metabolism}<div class="measure"><span class="m-label">기초대사</span><span class="m-value">{scale.basal_metabolism} kcal</span></div>{/if}
            {#if scale.protein}<div class="measure"><span class="m-label">단백질</span><span class="m-value">{scale.protein} %</span></div>{/if}
            {#if scale.body_age}<div class="measure"><span class="m-label">체내나이</span><span class="m-value">{scale.body_age} 세</span></div>{/if}
          </div>
        {:else}
          <p class="no-data">체성분 데이터 없음</p>
        {/if}

        <h3>혈압</h3>
        {#if bp}
          <div class="measurement-grid">
            {#if bp.systolic && bp.diastolic}
              <div class="measure"><span class="m-label">혈압</span><span class="m-value">{bp.systolic}/{bp.diastolic} mmHg</span></div>
            {/if}
            {#if bp.heart_rate}
              <div class="measure"><span class="m-label">심박수</span><span class="m-value">{bp.heart_rate} bpm</span></div>
            {/if}
          </div>
        {:else}
          <p class="no-data">혈압 데이터 없음</p>
        {/if}
      </section>

      <!-- Column 2: AI Analysis -->
      <section class="card analysis-card">
        <h2>AI 진단 분석</h2>
        <p class="analysis-time">분석 일시: {formatDateTime(data.analysis.created_at)}</p>

        <div class="analysis-section">
          <h3>종합 소견</h3>
          <p>{kr(analisis, 'resumen_general')}</p>
        </div>

        <div class="analysis-section">
          <h3>변증 (한의학 패턴)</h3>
          <p class="highlight">{kr(analisis, 'patron_mtc')}</p>
        </div>

        <div class="analysis-section">
          <h3>통증 분석</h3>
          <p>{kr(analisis, 'evaluacion_dolor')}</p>
          {#if patient}
            <div class="pain-meta">
              <span>시간대: {patient.horario_dolor || '-'}</span>
              <span>시작: {patient.inicio_dolor || '-'}</span>
              <span>강도: {patient.intensidad_dolor || '-'}/10</span>
            </div>
          {/if}
        </div>

        <div class="analysis-section">
          <h3>체성분 분석</h3>
          <p>{kr(analisis, 'evaluacion_corporal')}</p>
        </div>

        <div class="analysis-section">
          <h3>장기 분석</h3>
          <p>{kr(analisis, 'evaluacion_organos')}</p>
        </div>

        <div class="analysis-section">
          <h3>주요 소견</h3>
          <ul class="findings-list">
            {#each krArr(analisis, 'hallazgos') as finding}
              <li>{finding}</li>
            {/each}
          </ul>
        </div>
      </section>

      <!-- Column 3: Prescription -->
      <section class="card prescription-card">
        <h2>처방</h2>

        {#if prescripcion?.acupuntura}
          <div class="rx-section">
            <h3>침 처방</h3>

            {#if prescripcion.acupuntura.primary?.length}
              <h4>주혈 (Primary)</h4>
              {#each prescripcion.acupuntura.primary as pt}
                <div class="point-item primary">
                  <span class="point-code">{pt.code}</span>
                  <span class="point-name">{pt.name}</span>
                  <p class="point-desc">{pt.description_kr || pt.description}</p>
                </div>
              {/each}
            {/if}

            {#if prescripcion.acupuntura.secondary?.length}
              <h4>보조혈 (Secondary)</h4>
              {#each prescripcion.acupuntura.secondary as pt}
                <div class="point-item secondary">
                  <span class="point-code">{pt.code}</span>
                  <span class="point-name">{pt.name}</span>
                  <p class="point-desc">{pt.description_kr || pt.description}</p>
                </div>
              {/each}
            {/if}

            {#if prescripcion.acupuntura.tertiary?.length}
              <h4>보완혈 (Tertiary)</h4>
              {#each prescripcion.acupuntura.tertiary as pt}
                <div class="point-item tertiary">
                  <span class="point-code">{pt.code}</span>
                  <span class="point-name">{pt.name}</span>
                  <p class="point-desc">{pt.description_kr || pt.description}</p>
                </div>
              {/each}
            {/if}
          </div>
        {/if}

        {#if prescripcion?.moxibustion?.length}
          <div class="rx-section">
            <h3>뜸 처방</h3>
            {#each prescripcion.moxibustion as moxa}
              <div class="moxa-item">
                <span class="point-code">{moxa.point}</span>
                <span>{moxa.technique_kr || moxa.technique}</span>
                <span class="duration">{moxa.duration}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if prescripcion?.fitoterapia}
          <div class="rx-section">
            <h3>한약 처방</h3>
            <div class="herbal-card">
              <h4>{prescripcion.fitoterapia.nombre_kr || prescripcion.fitoterapia.nombre}</h4>
              <ul>
                {#each (prescripcion.fitoterapia.ingredientes_kr || prescripcion.fitoterapia.ingredientes || []) as ing}
                  <li>{ing}</li>
                {/each}
              </ul>
              <p class="herbal-desc">{prescripcion.fitoterapia.descripcion_kr || prescripcion.fitoterapia.descripcion}</p>
            </div>
          </div>
        {/if}

        <div class="rx-section precautions">
          <h3>주의사항</h3>
          <ul>
            {#each (analysis.precauciones_kr || analysis.precauciones || []) as prec}
              <li>{prec}</li>
            {/each}
          </ul>
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .doctor-page {
    min-height: 100vh;
    background: #0f172a;
    color: #e2e8f0;
    font-family: 'Noto Sans KR', 'Segoe UI', sans-serif;
    padding: 0;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
  }
  .header-left h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #f1f5f9;
  }
  .header-left .subtitle {
    font-size: 0.85rem;
    color: #94a3b8;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .updated {
    font-size: 0.8rem;
    color: #64748b;
  }
  .refresh-btn {
    padding: 6px 16px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .refresh-btn:hover { background: #2563eb; }
  .refresh-btn:disabled { background: #475569; cursor: not-allowed; }

  /* Urgency banner */
  .urgency-banner {
    text-align: center;
    padding: 8px;
    font-weight: bold;
    font-size: 1rem;
    color: #fff;
  }

  /* Grid */
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    padding: 16px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
  }

  /* Cards */
  .card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 16px;
    overflow-y: auto;
    max-height: calc(100vh - 130px);
  }
  .card h2 {
    margin: 0 0 12px 0;
    font-size: 1.15rem;
    color: #38bdf8;
    border-bottom: 1px solid #334155;
    padding-bottom: 8px;
  }
  .card h3 {
    margin: 14px 0 8px 0;
    font-size: 0.95rem;
    color: #7dd3fc;
  }

  /* Patient info */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    padding: 4px 0;
  }
  .info-item .label {
    font-size: 0.75rem;
    color: #64748b;
  }
  .info-item .value {
    font-size: 0.9rem;
    color: #e2e8f0;
  }

  /* Measurements */
  .measurement-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .measure {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    background: #0f172a;
    border-radius: 4px;
  }
  .m-label {
    font-size: 0.8rem;
    color: #94a3b8;
  }
  .m-value {
    font-size: 0.85rem;
    color: #f1f5f9;
    font-weight: 600;
  }
  .no-data {
    font-size: 0.85rem;
    color: #475569;
    font-style: italic;
  }

  /* Analysis */
  .analysis-time {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 10px;
  }
  .analysis-section {
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #1e293b;
  }
  .analysis-section:last-child {
    border-bottom: none;
  }
  .analysis-section p {
    margin: 4px 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .highlight {
    color: #fbbf24;
    font-weight: 600;
  }
  .pain-meta {
    display: flex;
    gap: 16px;
    margin-top: 6px;
    font-size: 0.8rem;
    color: #94a3b8;
  }
  .findings-list {
    padding-left: 18px;
    margin: 4px 0;
  }
  .findings-list li {
    font-size: 0.9rem;
    margin-bottom: 4px;
    color: #cbd5e1;
  }

  /* Prescription */
  .rx-section {
    margin-bottom: 16px;
  }
  .rx-section h4 {
    margin: 8px 0 4px 0;
    font-size: 0.85rem;
    color: #a5b4fc;
  }

  /* Points */
  .point-item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    padding: 6px 8px;
    margin-bottom: 4px;
    border-radius: 6px;
    background: #0f172a;
  }
  .point-item.primary { border-left: 3px solid #ef4444; }
  .point-item.secondary { border-left: 3px solid #f59e0b; }
  .point-item.tertiary { border-left: 3px solid #3b82f6; }
  .point-code {
    font-weight: bold;
    font-size: 0.95rem;
    color: #f1f5f9;
    min-width: 45px;
  }
  .point-name {
    font-size: 0.85rem;
    color: #94a3b8;
  }
  .point-desc {
    width: 100%;
    margin: 2px 0 0 0;
    font-size: 0.82rem;
    color: #cbd5e1;
  }

  /* Moxibustion */
  .moxa-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    margin-bottom: 4px;
    background: #0f172a;
    border-radius: 6px;
    font-size: 0.85rem;
  }
  .duration {
    color: #94a3b8;
    margin-left: auto;
  }

  /* Herbal */
  .herbal-card {
    background: #0f172a;
    border-radius: 6px;
    padding: 10px;
  }
  .herbal-card h4 {
    margin: 0 0 6px 0;
    color: #34d399;
    font-size: 0.95rem;
  }
  .herbal-card ul {
    padding-left: 18px;
    margin: 4px 0;
  }
  .herbal-card li {
    font-size: 0.85rem;
    color: #cbd5e1;
    margin-bottom: 2px;
  }
  .herbal-desc {
    font-size: 0.82rem;
    color: #94a3b8;
    margin-top: 6px;
  }

  /* Precautions */
  .precautions {
    background: #1c1917;
    border: 1px solid #78350f;
    border-radius: 6px;
    padding: 10px;
  }
  .precautions h3 { color: #fbbf24; }
  .precautions ul {
    padding-left: 18px;
    margin: 4px 0;
  }
  .precautions li {
    font-size: 0.85rem;
    color: #fde68a;
    margin-bottom: 4px;
  }

  /* Loading / Error */
  .loading-screen, .error-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #94a3b8;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #334155;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .error-screen button {
    margin-top: 12px;
    padding: 8px 20px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  /* Responsive: tablet portrait → 2 columns */
  @media (max-width: 1100px) {
    .grid-container {
      grid-template-columns: 1fr 1fr;
    }
    .prescription-card {
      grid-column: 1 / -1;
    }
  }

  /* Mobile → 1 column */
  @media (max-width: 700px) {
    .grid-container {
      grid-template-columns: 1fr;
    }
    .card {
      max-height: none;
    }
    .header {
      flex-direction: column;
      gap: 8px;
    }
  }
</style>
