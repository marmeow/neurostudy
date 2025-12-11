<!-- ProfileResult.vue - Mostra el resultat del perfil d'aprenentatge -->

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['restart'])

// Colors per a cada perfil
const colorsPerPerfil = {
  'visualis': { principal: '#8b5cf6', fons: 'rgba(139, 92, 246, 0.15)' },
  'narra': { principal: '#22c55e', fons: 'rgba(34, 197, 94, 0.15)' },
  'logika': { principal: '#3b82f6', fons: 'rgba(59, 130, 246, 0.15)' },
  'prax': { principal: '#f97316', fons: 'rgba(249, 115, 22, 0.15)' },
  'kreo': { principal: '#ec4899', fons: 'rgba(236, 72, 153, 0.15)' }
}

// === PROPIETATS CALCULADES ===
const perfilPrincipal = computed(() => props.result.primaryProfileDetails)
const perfilSecundari = computed(() => props.result.secondaryProfileDetails)
const analisi = computed(() => props.result.analysis)
const confianca = computed(() => props.result.confidence)
const esHibrid = computed(() => props.result.isHybrid)
const fortaleses = computed(() => props.result.strengths || perfilPrincipal.value?.characteristics?.slice(0, 3) || [])
const recomanacions = computed(() => props.result.recommendations || perfilPrincipal.value?.contentRecommendations?.slice(0, 3) || [])
const consellsEstudi = computed(() => props.result.studyTips || perfilPrincipal.value?.learningStrategies?.slice(0, 3) || [])

const colorPrincipal = computed(() => {
  return colorsPerPerfil[perfilPrincipal.value?.id]?.principal || '#0088ff'
})

const fonsPrincipal = computed(() => {
  return colorsPerPerfil[perfilPrincipal.value?.id]?.fons || 'rgba(0, 136, 255, 0.15)'
})

// Pestanya activa per mostrar detalls
const pestanyaActiva = ref('resum')
const pestanyes = [
  { id: 'resum', etiqueta: 'Resum', icona: '📋' },
  { id: 'fortaleses', etiqueta: 'Fortaleses', icona: '💪' },
  { id: 'recomanacions', etiqueta: 'Recomanacions', icona: '🎯' },
  { id: 'consells', etiqueta: 'Consells', icona: '💡' }
]
</script>

<template>
  <div class="resultat-perfil">
    
    <!-- Capçalera d'èxit -->
    <div class="capsalera-resultat">
      <div class="icona-exit">🎉</div>
      <h1>El teu Perfil d'Aprenentatge!</h1>
      <p class="subtitol-resultat">
        Basat en les teves respostes, hem identificat el teu estil d'aprenentatge únic
      </p>
    </div>

    <!-- Distintiu si és perfil híbrid -->
    <div v-if="esHibrid" class="distintiu-hibrid">
      <span>🔀</span>
      <span>Perfil Híbrid: Tens característiques de múltiples perfils</span>
    </div>

    <!-- Targeta del perfil principal -->
    <div 
      class="targeta-perfil-principal card-glass"
      :style="{ '--color-perfil': colorPrincipal, '--fons-perfil': fonsPrincipal }"
    >
      <div class="distintiu-perfil">
        <span class="emoji-perfil">{{ perfilPrincipal?.emoji }}</span>
      </div>
      
      <h2 class="nom-perfil">{{ perfilPrincipal?.name }}</h2>
      <p class="descripcio-curta">{{ perfilPrincipal?.shortDescription }}</p>
      <p class="descripcio-llarga">{{ perfilPrincipal?.description }}</p>
      
      <!-- Mesurador de confiança -->
      <div class="mesurador-confianca">
        <div class="etiqueta-confianca">
          <span>Nivell de confiança</span>
          <span class="valor-confianca">{{ Math.round(confianca) }}%</span>
        </div>
        <div class="barra-confianca">
          <div 
            class="confianca-omplerta" 
            :style="{ width: `${confianca}%`, background: colorPrincipal }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Perfil secundari -->
    <div class="perfil-secundari" v-if="perfilSecundari">
      <p class="etiqueta-secundari">El teu perfil secundari:</p>
      <div 
        class="distintiu-secundari" 
        :style="{ borderColor: colorsPerPerfil[perfilSecundari.id]?.principal }"
      >
        <span>{{ perfilSecundari.emoji }}</span>
        <span>{{ perfilSecundari.name }} ({{ perfilSecundari.shortDescription }})</span>
      </div>
    </div>

    <!-- Anàlisi de la IA -->
    <div class="targeta-analisi card" v-if="analisi">
      <div class="capsalera-analisi">
        <span class="distintiu-ia">🤖 Anàlisi</span>
      </div>
      <p class="text-analisi">{{ analisi }}</p>
    </div>

    <!-- Navegació de pestanyes -->
    <div class="navegacio-pestanyes">
      <button
        v-for="pestanya in pestanyes"
        :key="pestanya.id"
        class="boto-pestanya"
        :class="{ activa: pestanyaActiva === pestanya.id }"
        @click="pestanyaActiva = pestanya.id"
      >
        <span class="icona-pestanya">{{ pestanya.icona }}</span>
        <span class="etiqueta-pestanya">{{ pestanya.etiqueta }}</span>
      </button>
    </div>

    <!-- Contingut de les pestanyes -->
    <div class="contingut-pestanya card">
      
      <!-- Resum -->
      <div v-if="pestanyaActiva === 'resum'" class="panel-pestanya">
        <h3>Característiques del teu perfil</h3>
        <ul class="llista-caracteristiques">
          <li v-for="(caracteristica, index) in perfilPrincipal?.characteristics" :key="index">
            <span class="icona-check" :style="{ color: colorPrincipal }">✓</span>
            {{ caracteristica }}
          </li>
        </ul>

        <h3 class="mt-xl">Contingut recomanat</h3>
        <div class="etiquetes-contingut">
          <span 
            v-for="(contingut, index) in perfilPrincipal?.contentRecommendations" 
            :key="index"
            class="etiqueta-contingut"
          >
            {{ contingut }}
          </span>
        </div>
      </div>

      <!-- Fortaleses -->
      <div v-if="pestanyaActiva === 'fortaleses'" class="panel-pestanya">
        <h3>Les teves fortaleses d'aprenentatge</h3>
        <div class="graella-fortaleses" v-if="fortaleses.length">
          <div v-for="(fortalesa, index) in fortaleses" :key="index" class="targeta-fortalesa">
            <span class="numero-fortalesa" :style="{ background: colorPrincipal }">{{ index + 1 }}</span>
            <p>{{ fortalesa }}</p>
          </div>
        </div>
        <p v-else class="missatge-buit">
          Les fortaleses específiques es generaran amb l'API d'IA.
        </p>
      </div>

      <!-- Recomanacions -->
      <div v-if="pestanyaActiva === 'recomanacions'" class="panel-pestanya">
        <h3>Recomanacions personalitzades</h3>
        <div class="llista-recomanacions" v-if="recomanacions.length">
          <div v-for="(rec, index) in recomanacions" :key="index" class="item-recomanacio">
            <span class="icona-rec">🎯</span>
            <p>{{ rec }}</p>
          </div>
        </div>
        <p v-else class="missatge-buit">
          Les recomanacions personalitzades es generaran amb l'API d'IA.
        </p>
      </div>

      <!-- Consells -->
      <div v-if="pestanyaActiva === 'consells'" class="panel-pestanya">
        <h3>Consells d'estudi</h3>
        <div class="llista-consells" v-if="consellsEstudi.length">
          <div v-for="(consell, index) in consellsEstudi" :key="index" class="item-consell">
            <span class="icona-consell">💡</span>
            <p>{{ consell }}</p>
          </div>
        </div>
        <div v-else class="consells-per-defecte">
          <div class="item-consell">
            <span class="icona-consell">💡</span>
            <p v-if="perfilPrincipal?.id === 'visualis'">
              Usa mapes mentals i diagrames per organitzar la informació
            </p>
            <p v-else-if="perfilPrincipal?.id === 'narra'">
              Connecta els conceptes nous amb experiències i històries reals
            </p>
            <p v-else-if="perfilPrincipal?.id === 'logika'">
              Crea llistes i taules comparatives per estructurar la informació
            </p>
            <p v-else-if="perfilPrincipal?.id === 'prax'">
              Divideix l'estudi en sessions curtes amb pràctica activa
            </p>
            <p v-else>
              Explora connexions entre temes diferents per inspirar-te
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Accions -->
    <div class="accions-resultat">
      <button class="btn btn-primary btn-lg" @click="emit('restart')">
        <span>Fer una altra avaluació</span>
      </button>
    </div>

    <!-- Secció per compartir -->
    <div class="seccio-compartir">
      <p>Comparteix el teu resultat</p>
      <div class="distintius-compartir">
        <span 
          class="distintiu-compartir" 
          :style="{ borderColor: colorPrincipal, color: colorPrincipal }"
        >
          {{ perfilPrincipal?.emoji }} {{ perfilPrincipal?.name }}
        </span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.resultat-perfil {
  width: 100%;
  max-width: 800px;
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

/* Capçalera */
.capsalera-resultat {
  text-align: center;
  margin-bottom: 32px;
}

.icona-exit {
  font-size: 4rem;
  margin-bottom: 24px;
  animation: flotar 2s ease-in-out infinite;
}

@keyframes flotar {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.capsalera-resultat h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.subtitol-resultat {
  font-size: 1.125rem;
  color: var(--gray-400);
}

/* Distintiu híbrid */
.distintiu-hibrid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  margin-bottom: 32px;
  font-size: 0.875rem;
  color: var(--accent-purple);
}

/* Targeta del perfil principal */
.targeta-perfil-principal {
  text-align: center;
  padding: 64px;
  margin-bottom: 32px;
  border: 2px solid var(--color-perfil);
  background: var(--fons-perfil) !important;
}

.distintiu-perfil {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fons-perfil);
  border: 3px solid var(--color-perfil);
  border-radius: 50%;
  animation: palpitar 2s ease-in-out infinite;
}

@keyframes palpitar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.emoji-perfil {
  font-size: 3rem;
}

.nom-perfil {
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--color-perfil);
}

.descripcio-curta {
  font-size: 1rem;
  color: var(--gray-400);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.descripcio-llarga {
  font-size: 1.125rem;
  color: var(--gray-300);
  max-width: 500px;
  margin: 0 auto 32px;
}

/* Mesurador de confiança */
.mesurador-confianca {
  max-width: 300px;
  margin: 0 auto;
}

.etiqueta-confianca {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--gray-400);
  margin-bottom: 8px;
}

.valor-confianca {
  font-weight: 600;
  color: var(--color-perfil);
}

.barra-confianca {
  height: 8px;
  background: var(--gray-700);
  border-radius: 50px;
  overflow: hidden;
}

.confianca-omplerta {
  height: 100%;
  border-radius: 50px;
  transition: width 1s ease-out;
}

/* Perfil secundari */
.perfil-secundari {
  text-align: center;
  margin-bottom: 32px;
}

.etiqueta-secundari {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 8px;
}

.distintiu-secundari {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 50px;
  font-size: 0.9rem;
  color: var(--gray-300);
}

/* Targeta d'anàlisi */
.targeta-analisi {
  margin-bottom: 32px;
}

.capsalera-analisi {
  margin-bottom: 16px;
}

.distintiu-ia {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.text-analisi {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--gray-300);
}

/* Pestanyes */
.navegacio-pestanyes {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.boto-pestanya {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid var(--gray-700);
  border-radius: 50px;
  color: var(--gray-400);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.boto-pestanya:hover {
  border-color: var(--gray-500);
  color: white;
}

.boto-pestanya.activa {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.icona-pestanya {
  font-size: 1rem;
}

/* Contingut pestanyes */
.contingut-pestanya {
  margin-bottom: 32px;
}

.panel-pestanya h3 {
  font-size: 1.125rem;
  margin-bottom: 24px;
  color: white;
}

/* Llista de característiques */
.llista-caracteristiques {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.llista-caracteristiques li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  color: var(--gray-300);
}

.icona-check {
  font-weight: bold;
  flex-shrink: 0;
}

/* Etiquetes de contingut */
.etiquetes-contingut {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.etiqueta-contingut {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 0.875rem;
  color: var(--gray-300);
}

/* Graella de fortaleses */
.graella-fortaleses {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.targeta-fortalesa {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.numero-fortalesa {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.targeta-fortalesa p {
  color: var(--gray-300);
  font-size: 0.9rem;
}

/* Llistes */
.llista-recomanacions,
.llista-consells,
.consells-per-defecte {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-recomanacio,
.item-consell {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.icona-rec,
.icona-consell {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.item-recomanacio p,
.item-consell p {
  color: var(--gray-300);
  font-size: 0.9rem;
  line-height: 1.6;
}

.missatge-buit {
  color: var(--gray-500);
  font-style: italic;
  text-align: center;
  padding: 32px;
}

/* Accions */
.accions-resultat {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

/* Compartir */
.seccio-compartir {
  text-align: center;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.seccio-compartir p {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 16px;
}

.distintius-compartir {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.distintiu-compartir {
  padding: 12px 24px;
  border: 2px solid;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .capsalera-resultat h1 {
    font-size: 1.75rem;
  }

  .distintiu-perfil {
    width: 80px;
    height: 80px;
  }

  .emoji-perfil {
    font-size: 2.5rem;
  }

  .nom-perfil {
    font-size: 1.5rem;
  }

  .navegacio-pestanyes {
    justify-content: flex-start;
  }

  .etiqueta-pestanya {
    display: none;
  }

  .boto-pestanya {
    padding: 12px 16px;
  }
}
</style>