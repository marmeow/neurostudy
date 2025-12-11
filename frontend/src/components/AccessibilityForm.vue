<!-- AccessibilityForm.vue - Formulari per personalitzar l'accessibilitat -->

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['complete', 'skip'])

const URL_API = 'http://localhost:3000/api'

// === ESTAT DEL FORMULARI ===
// Dades del formulari d'accessibilitat
const dadesAccessibilitat = ref(null)

// Està carregant?
const estaCarregant = ref(true)

// Respostes de l'usuari (qüestionId: true/false)
const respostes = ref({})

// Categoria actual que es mostra
const categoriaActual = ref(0)

// Carrega les preguntes d'accessibilitat de l'API
onMounted(async () => {
  try {
    const response = await fetch(`${URL_API}/accessibility`)
    const dades = await response.json()
    
    if (dades.success) {
      dadesAccessibilitat.value = dades.data
    }
  } catch (err) {
    console.error('Error carregant accessibilitat:', err)
  } finally {
    estaCarregant.value = false
  }
})

// === PROPIETATS CALCULADES ===

// Converteix les categories en un array
const categories = computed(() => {
  if (!dadesAccessibilitat.value) return []
  return Object.values(dadesAccessibilitat.value.categories)
})

// Dades de la categoria actual
const dadesCategoriaActual = computed(() => {
  return categories.value[categoriaActual.value]
})

// És l'última categoria?
const esUltimaCategoria = computed(() => {
  return categoriaActual.value >= categories.value.length - 1
})

// Percentatge de progrés
const percentatgeProgres = computed(() => {
  if (categories.value.length === 0) return 0
  return ((categoriaActual.value + 1) / categories.value.length) * 100
})

// === FUNCIONS ===

// Activa/desactiva una resposta
const canviarResposta = (idPregunta) => {
  respostes.value[idPregunta] = !respostes.value[idPregunta]
}

// Anar a la següent categoria
const categoriaSeguent = () => {
  if (esUltimaCategoria.value) {
    enviarRespostes()
  } else {
    categoriaActual.value++
  }
}

// Tornar a la categoria anterior
const categoriaAnterior = () => {
  if (categoriaActual.value > 0) {
    categoriaActual.value--
  }
}

// Envia les respostes a l'API
const enviarRespostes = async () => {
  try {
    // Formatem les respostes per l'API
    const respostesFormatades = Object.entries(respostes.value).map(([idPregunta, valor]) => ({
      questionId: idPregunta,
      value: valor
    }))

    const response = await fetch(`${URL_API}/accessibility/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: respostesFormatades })
    })

    const dades = await response.json()

    if (dades.success) {
      emit('complete', {
        answers: respostes.value,
        adaptations: dades.data.adaptations
      })
    }
  } catch (err) {
    console.error('Error processant accessibilitat:', err)
    // Continuem igualment amb les respostes crues
    emit('complete', { answers: respostes.value, adaptations: [] })
  }
}
</script>

<template>
  <div class="formulari-accessibilitat">
    
    <!-- Capçalera -->
    <div class="capsalera-formulari">
      <div class="icona-capsalera">♿</div>
      <h2>Personalitza la teva experiència</h2>
      <p>Marca les opcions que s'apliquin a tu perquè puguem adaptar la plataforma.</p>
    </div>

    <!-- Estat de càrrega -->
    <div v-if="estaCarregant" class="estat-carregant">
      <div class="spinner"></div>
      <p>Carregant...</p>
    </div>

    <!-- Contingut del formulari -->
    <template v-else-if="dadesAccessibilitat && dadesCategoriaActual">
      
      <!-- Barra de progrés -->
      <div class="seccio-progres">
        <div class="info-progres">
          <span>{{ dadesCategoriaActual.icon }} {{ dadesCategoriaActual.name }}</span>
          <span>{{ categoriaActual + 1 }} / {{ categories.length }}</span>
        </div>
        <div class="barra-progres">
          <div class="progres-omplert" :style="{ width: `${percentatgeProgres}%` }"></div>
        </div>
      </div>

      <!-- Preguntes de la categoria actual -->
      <div class="contenidor-preguntes card-glass">
        <div 
          v-for="pregunta in dadesCategoriaActual.questions"
          :key="pregunta.id"
          class="item-pregunta"
          :class="{ activa: respostes[pregunta.id] }"
          @click="canviarResposta(pregunta.id)"
        >
          <div class="checkbox-pregunta">
            <span v-if="respostes[pregunta.id]">✓</span>
          </div>
          <span class="text-pregunta">{{ pregunta.text }}</span>
        </div>
      </div>

      <!-- Navegació -->
      <div class="navegacio-formulari">
        <button 
          v-if="categoriaActual > 0"
          class="btn btn-secondary"
          @click="categoriaAnterior"
        >
          ← Anterior
        </button>
        <div v-else></div>

        <button 
          class="btn btn-primary"
          @click="categoriaSeguent"
        >
          {{ esUltimaCategoria ? 'Finalitzar' : 'Següent →' }}
        </button>
      </div>

      <!-- Opció per saltar -->
      <button class="boto-saltar" @click="emit('skip')">
        Saltar aquest pas →
      </button>
    </template>

  </div>
</template>

<style scoped>
.formulari-accessibilitat {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  animation: apareixer 0.5s ease-out;
}

@keyframes apareixer {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Capçalera */
.capsalera-formulari {
  text-align: center;
  margin-bottom: 64px;
}

.icona-capsalera {
  font-size: 3rem;
  margin-bottom: 16px;
}

.capsalera-formulari h2 {
  font-size: 1.75rem;
  margin-bottom: 8px;
}

.capsalera-formulari p {
  color: var(--gray-400);
}

/* Càrrega */
.estat-carregant {
  text-align: center;
  padding: 80px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

/* Progrés */
.seccio-progres {
  margin-bottom: 32px;
}

.info-progres {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--gray-400);
}

.barra-progres {
  height: 6px;
  background: var(--gray-700);
  border-radius: 50px;
  overflow: hidden;
}

.progres-omplert {
  height: 100%;
  background: var(--primary-500);
  border-radius: 50px;
  transition: width 0.3s;
}

/* Preguntes */
.contenidor-preguntes {
  padding: 16px;
  margin-bottom: 32px;
}

.item-pregunta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.item-pregunta:hover {
  background: rgba(255, 255, 255, 0.06);
}

.item-pregunta.activa {
  border-color: var(--primary-500);
  background: rgba(0, 136, 255, 0.1);
}

.checkbox-pregunta {
  width: 28px;
  height: 28px;
  border: 2px solid var(--gray-600);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.item-pregunta.activa .checkbox-pregunta {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.text-pregunta {
  color: var(--gray-300);
  font-size: 0.95rem;
}

/* Navegació */
.navegacio-formulari {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

/* Botó saltar */
.boto-saltar {
  display: block;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  color: var(--gray-500);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
}

.boto-saltar:hover {
  color: var(--gray-300);
}
</style>