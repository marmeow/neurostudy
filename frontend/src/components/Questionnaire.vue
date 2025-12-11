<!-- Questionnaire.vue - Qüestionari per determinar el perfil d'aprenentatge -->

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['complete', 'back'])

const URL_API = 'http://localhost:3000/api'

// === ESTAT DEL QÜESTIONARI ===
// Guarda totes les dades del qüestionari
const questionari = ref(null)

// Controla si està carregant
const estaCarregant = ref(true)

// Missatge d'error si no es pot carregar
const errorCarrega = ref(null)

// Índex de la secció actual
const seccioActual = ref(0)

// Índex de la pregunta dins la secció actual
const preguntaActual = ref(0)

// Array amb totes les respostes de l'usuari
const respostes = ref([])

// Opció que l'usuari ha seleccionat
const opcioSeleccionada = ref(null)

// Carreguem el qüestionari quan es munta el component
onMounted(async () => {
  try {
    const response = await fetch(`${URL_API}/questionnaire`)
    const dades = await response.json()
    
    if (dades.success) {
      questionari.value = dades.data
    } else {
      errorCarrega.value = 'Error al carregar el qüestionari'
    }
  } catch (err) {
    console.error('Error:', err)
    errorCarrega.value = 'Error de connexió amb el servidor'
  } finally {
    estaCarregant.value = false
  }
})

// === PROPIETATS CALCULADES ===

// Totes les preguntes de totes les seccions en un sol array
const totesLesPreguntes = computed(() => {
  if (!questionari.value) return []
  return questionari.value.sections.flatMap(s => s.questions)
})

// Nombre total de preguntes
const totalPreguntes = computed(() => totesLesPreguntes.value.length)

// Índex global de la pregunta actual (no només dins la secció)
const indexGlobal = computed(() => {
  if (!questionari.value) return 0
  
  let index = 0
  // Sumem totes les preguntes de les seccions anteriors
  for (let i = 0; i < seccioActual.value; i++) {
    index += questionari.value.sections[i].questions.length
  }
  // Afegim la pregunta actual
  return index + preguntaActual.value
})

// Percentatge de progrés (0-100)
const percentatgeProgres = computed(() => {
  if (totalPreguntes.value === 0) return 0
  return ((indexGlobal.value + 1) / totalPreguntes.value) * 100
})

// Dades de la secció actual
const dadesSecció = computed(() => {
  if (!questionari.value) return null
  return questionari.value.sections[seccioActual.value]
})

// Dades de la pregunta actual
const dadesPregunta = computed(() => {
  return dadesSecció.value?.questions[preguntaActual.value]
})

// És la primera pregunta?
const esPrimeraPregunta = computed(() => {
  return seccioActual.value === 0 && preguntaActual.value === 0
})

// És l'última pregunta?
const esUltimaPregunta = computed(() => {
  return indexGlobal.value === totalPreguntes.value - 1
})

// === FUNCIONS ===

// Quan l'usuari selecciona una opció
const seleccionarOpcio = (opcio) => {
  opcioSeleccionada.value = opcio
}

// Anar a la següent pregunta
const preguntaSeguent = () => {
  // Si no hi ha opció seleccionada, no fem res
  if (!opcioSeleccionada.value) return

  // Guardem la resposta
  respostes.value.push({
    questionId: dadesPregunta.value.id,
    optionId: opcioSeleccionada.value.id,
    profiles: opcioSeleccionada.value.profiles
  })

  // Netegem la selecció
  opcioSeleccionada.value = null

  if (esUltimaPregunta.value) {
    // Si és l'última pregunta, enviem totes les respostes
    emit('complete', respostes.value)
  } else {
    // Si no és l'última, avancem
    if (preguntaActual.value < dadesSecció.value.questions.length - 1) {
      // Següent pregunta de la mateixa secció
      preguntaActual.value++
    } else {
      // Primera pregunta de la següent secció
      seccioActual.value++
      preguntaActual.value = 0
    }
  }
}

// Tornar a la pregunta anterior
const preguntaAnterior = () => {
  if (esPrimeraPregunta.value) {
    // Si és la primera pregunta, tornem a la pantalla anterior
    emit('back')
    return
  }

  // Eliminem l'última resposta guardada
  respostes.value.pop()
  opcioSeleccionada.value = null

  if (preguntaActual.value > 0) {
    // Pregunta anterior de la mateixa secció
    preguntaActual.value--
  } else {
    // Última pregunta de la secció anterior
    seccioActual.value--
    preguntaActual.value = questionari.value.sections[seccioActual.value].questions.length - 1
  }
}

// Converteix un número a lletra (0=A, 1=B, etc.)
const numeroALletra = (index) => {
  return String.fromCharCode(65 + index) // 65 és el codi ASCII de 'A'
}
</script>

<template>
  <div class="questionari">
    
    <!-- Estat de càrrega -->
    <div v-if="estaCarregant" class="estat-carregant">
      <div class="spinner"></div>
      <p>Carregant qüestionari...</p>
    </div>

    <!-- Estat d'error -->
    <div v-else-if="errorCarrega" class="estat-error card">
      <span class="icona-error">⚠️</span>
      <h3>Error</h3>
      <p>{{ errorCarrega }}</p>
      <button class="btn btn-primary mt-lg" @click="emit('back')">
        Tornar
      </button>
    </div>

    <!-- Qüestionari -->
    <template v-else-if="questionari && dadesPregunta">
      
      <!-- Barra superior amb progrés -->
      <div class="capsalera-questionari">
        <button class="boto-enrere" @click="preguntaAnterior">
          <span>←</span>
          <span>{{ esPrimeraPregunta ? 'Tornar' : 'Anterior' }}</span>
        </button>
        
        <div class="info-progres">
          <span class="text-progres">
            Pregunta {{ indexGlobal + 1 }} de {{ totalPreguntes }}
          </span>
          <div class="barra-progres">
            <div 
              class="progres-omplert" 
              :style="{ width: `${percentatgeProgres}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Indicador de secció -->
      <div class="indicador-seccio">
        <span class="etiqueta-seccio">{{ dadesSecció.title }}</span>
      </div>

      <!-- Targeta de la pregunta -->
      <div class="targeta-pregunta card-glass">
        <h2 class="text-pregunta">{{ dadesPregunta.text }}</h2>

        <!-- Opcions de resposta -->
        <div class="llista-opcions">
          <button
            v-for="(opcio, index) in dadesPregunta.options"
            :key="opcio.id"
            class="boto-opcio"
            :class="{ seleccionada: opcioSeleccionada?.id === opcio.id }"
            @click="seleccionarOpcio(opcio)"
          >
            <span class="lletra-opcio">{{ numeroALletra(index) }}</span>
            <span class="text-opcio">{{ opcio.text }}</span>
            <span 
              class="check-opcio" 
              v-if="opcioSeleccionada?.id === opcio.id"
            >✓</span>
          </button>
        </div>
      </div>

      <!-- Botó d'acció -->
      <div class="accions-pregunta">
        <button 
          class="btn btn-primary btn-lg"
          :disabled="!opcioSeleccionada"
          @click="preguntaSeguent"
        >
          {{ esUltimaPregunta ? 'Veure el meu perfil' : 'Següent' }}
          <span class="fletxa-boto">→</span>
        </button>
      </div>

      <!-- Consell -->
      <p class="consell-teclat">
        💡 Consell: Tria l'opció que millor et representi
      </p>
    </template>

  </div>
</template>

<style scoped>
.questionari {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
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

/* Estat de càrrega */
.estat-carregant {
  text-align: center;
  padding: 80px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto 24px;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.estat-carregant p {
  color: var(--gray-400);
}

/* Error */
.estat-error {
  text-align: center;
  padding: 64px;
}

.icona-error {
  font-size: 3rem;
  display: block;
  margin-bottom: 24px;
}

/* Capçalera del qüestionari */
.capsalera-questionari {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.boto-enrere {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--gray-600);
  border-radius: 12px;
  color: var(--gray-400);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.boto-enrere:hover {
  border-color: var(--gray-400);
  color: white;
}

.info-progres {
  flex: 1;
}

.text-progres {
  font-size: 0.875rem;
  color: var(--gray-400);
  display: block;
  margin-bottom: 8px;
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

/* Indicador de secció */
.indicador-seccio {
  text-align: center;
  margin-bottom: 24px;
}

.etiqueta-seccio {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  font-size: 0.75rem;
  color: var(--accent-purple);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Targeta de pregunta */
.targeta-pregunta {
  padding: 64px;
  margin-bottom: 32px;
}

.text-pregunta {
  font-size: 1.5rem;
  line-height: 1.4;
  margin-bottom: 64px;
  text-align: center;
}

/* Opcions */
.llista-opcions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.boto-opcio {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--gray-300);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.boto-opcio:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.boto-opcio.seleccionada {
  background: rgba(0, 136, 255, 0.1);
  border-color: var(--primary-500);
  color: white;
}

.lletra-opcio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.boto-opcio.seleccionada .lletra-opcio {
  background: var(--primary-500);
  color: white;
}

.text-opcio {
  flex: 1;
}

.check-opcio {
  font-size: 1.25rem;
  color: var(--primary-400);
  animation: apareixerCheck 0.2s ease-out;
}

@keyframes apareixerCheck {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Accions */
.accions-pregunta {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.accions-pregunta .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.accions-pregunta .btn:disabled:hover {
  transform: none;
  box-shadow: var(--shadow-md);
}

.fletxa-boto {
  transition: transform 0.2s;
}

.accions-pregunta .btn:not(:disabled):hover .fletxa-boto {
  transform: translateX(4px);
}

/* Consell */
.consell-teclat {
  text-align: center;
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Responsive */
@media (max-width: 768px) {
  .capsalera-questionari {
    flex-direction: column;
    align-items: stretch;
  }

  .boto-enrere {
    align-self: flex-start;
  }

  .targeta-pregunta {
    padding: 24px;
  }

  .text-pregunta {
    font-size: 1.25rem;
  }

  .boto-opcio {
    padding: 16px;
    font-size: 0.9rem;
  }
}
</style>