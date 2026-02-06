<script lang="ts">
  import { onMount } from 'svelte';
  import SurveyForm from '$lib/components/SurveyForm.svelte';
  import { isPresencial } from '$lib/stores/survey';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('presencial')) {
      isPresencial.set(true);
    }
  });
</script>

<svelte:head>
  <title>Encuesta - Puebla AI-Acupuncture</title>
  <meta name="description" content="Sistema de encuesta para pacientes de acupuntura" />
</svelte:head>

<SurveyForm />
