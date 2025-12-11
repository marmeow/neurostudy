<!-- Chat.vue - Xat intel·ligent adaptat al perfil de l'usuari -->

<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  profileId: {
    type: String,
    required: true
  },
  profileDetails: {
    type: Object,
    default: null
  },
  accessibilitySettings: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const URL_API = 'http://localhost:3000/api'

// === ESTAT DEL XAT ===
// Llista de missatges
const missatges = ref([])

// Missatge que està escrivint l'usuari
const missatgeEntrada = ref('')

// Està enviant un missatge?
const estaCarregant = ref(false)

// Missatge d'error
const error = ref(null)

// Referència al contenidor de missatges per fer scroll
const contenidorXat = ref(null)

// Color del perfil
const colorPerfil = computed(() => {
  const colors = {
    'visualis': '#8b5cf6',
    'narra': '#22c55e',
    'logika': '#3b82f6',
    'prax': '#f97316',
    'kreo': '#ec4899'
  }
  return colors[props.profileId] || '#0088ff'
})

// === FUNCIONS ===

// Carrega el missatge de benvinguda
const carregarMissatgeBenvinguda = async () => {
  try {
    const response = await fetch(`${URL_API}/chat/welcome/${props.profileId}`)
    const dades = await response.json()
    
    if (dades.success && dades.data?.message) {
      missatges.value.push(dades.data.message)
    }
  } catch (err) {
    console.error('Error carregant benvinguda:', err)
    missatges.value.push({
      role: 'assistant',
      content: `Hola! 👋 Sóc el teu assistent adaptat al teu perfil ${props.profileDetails?.name || ''}. Com et puc ajudar?`
    })
  }
}

// Envia un missatge
const enviarMissatge = async () => {
  // Si no hi ha text o està carregant, no fem res
  if (!missatgeEntrada.value.trim() || estaCarregant.value) return
  
  // Creem el missatge de l'usuari
  const missatgeUsuari = {
    role: 'user',
    content: missatgeEntrada.value.trim()
  }
  
  // Afegim el missatge a la llista
  missatges.value.push(missatgeUsuari)
  
  // Netegem l'entrada
  missatgeEntrada.value = ''
  
  // Marquem que està carregant
  estaCarregant.value = true
  error.value = null
  
  // Fem scroll avall
  await ferScrollAvall()
  
  try {
    // Enviem el missatge a l'API
    const response = await fetch(`${URL_API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: missatges.value.filter(m => m.role !== 'system'),
        profileId: props.profileId,
        accessibilitySettings: props.accessibilitySettings
      })
    })
    
    const dades = await response.json()
    
    if (dades.success && dades.data?.message) {
      missatges.value.push(dades.data.message)
    } else if (dades.fallback) {
      missatges.value.push(dades.fallback)
    } else {
      error.value = dades.error || 'Error al enviar el missatge'
    }
  } catch (err) {
    console.error('Error xat:', err)
    error.value = 'Error de connexió'
  } finally {
    estaCarregant.value = false
    await ferScrollAvall()
  }
}

// Fa scroll automàtic fins avall
const ferScrollAvall = async () => {
  await nextTick()
  if (contenidorXat.value) {
    contenidorXat.value.scrollTop = contenidorXat.value.scrollHeight
  }
}

// Gestiona la tecla Enter
const gesionarTecla = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    enviarMissatge()
  }
}

// Formata el text del missatge (markdown senzill)
const formatarMissatge = (contingut) => {
  if (!contingut) return ''
  
  // Negreta **text**
  let formatat = contingut.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Cursiva *text*
  formatat = formatat.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Salts de línia
  formatat = formatat.replace(/\n/g, '<br>')
  
  return formatat
}

// Inicialitza el xat
carregarMissatgeBenvinguda()
</script>

<template>
  <div class="contenidor-xat" :style="{ '--color-perfil': colorPerfil }">
    
    <!-- Capçalera del xat -->
    <div class="capsalera-xat">
      <div class="info-perfil-xat">
        <span class="emoji-perfil">{{ profileDetails?.emoji || '🧠' }}</span>
        <div class="dades-perfil">
          <h3>NeuroStudy AI</h3>
          <span class="distintiu-perfil">Adaptat a {{ profileDetails?.name || 'el teu perfil' }}</span>
        </div>
      </div>
      <button class="boto-tancar" @click="emit('close')" aria-label="Tancar xat">
        ✕
      </button>
    </div>

    <!-- Contenidor de missatges -->
    <div class="contenidor-missatges" ref="contenidorXat">
      <div 
        v-for="(missatge, index) in missatges" 
        :key="index"
        class="missatge"
        :class="missatge.role"
      >
        <div class="avatar-missatge">
          <span v-if="missatge.role === 'assistant'">🧠</span>
          <span v-else>👤</span>
        </div>
        <div class="contingut-missatge" v-html="formatarMissatge(missatge.content)"></div>
      </div>

      <!-- Indicador de "està escrivint..." -->
      <div v-if="estaCarregant" class="missatge assistant carregant">
        <div class="avatar-missatge">🧠</div>
        <div class="contingut-missatge">
          <div class="indicador-escrivint">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Missatge d'error -->
      <div v-if="error" class="missatge-error">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Àrea d'entrada de text -->
    <div class="contenidor-entrada">
      <textarea
        v-model="missatgeEntrada"
        @keydown="gesionarTecla"
        placeholder="Escriu el teu missatge..."
        rows="1"
        :disabled="estaCarregant"
      ></textarea>
      <button 
        class="boto-enviar" 
        @click="enviarMissatge"
        :disabled="!missatgeEntrada.trim() || estaCarregant"
      >
        <span>➤</span>
      </button>
    </div>

    <!-- Suggeriments ràpids -->
    <div class="suggeriments-rapids" v-if="missatges.length <= 1">
      <span class="etiqueta-suggeriments">Prova amb:</span>
      <button @click="missatgeEntrada = 'Explica\'m què és JavaScript'">
        📚 JavaScript
      </button>
      <button @click="missatgeEntrada = 'Com funciona la intel·ligència artificial?'">
        🤖 IA
      </button>
      <button @click="missatgeEntrada = 'Dona\'m consells per estudiar millor'">
        💡 Consells
      </button>
    </div>

  </div>
</template>

<style scoped>
.contenidor-xat {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

/* Capçalera */
.capsalera-xat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-perfil-xat {
  display: flex;
  align-items: center;
  gap: 16px;
}

.emoji-perfil {
  font-size: 2rem;
}

.dades-perfil h3 {
  font-size: 1rem;
  margin: 0;
  color: white;
}

.distintiu-perfil {
  font-size: 0.75rem;
  color: var(--color-perfil);
}

.boto-tancar {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--gray-400);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.boto-tancar:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Missatges */
.contenidor-missatges {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.missatge {
  display: flex;
  gap: 16px;
  max-width: 85%;
  animation: apareixerMissatge 0.3s ease-out;
}

@keyframes apareixerMissatge {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.missatge.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar-missatge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.missatge.assistant .avatar-missatge {
  background: var(--color-perfil);
}

.contingut-missatge {
  padding: 16px 24px;
  border-radius: 12px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.missatge.assistant .contingut-missatge {
  background: rgba(255, 255, 255, 0.08);
  color: var(--gray-200);
  border-bottom-left-radius: 6px;
}

.missatge.user .contingut-missatge {
  background: var(--color-perfil);
  color: white;
  border-bottom-right-radius: 6px;
}

/* Indicador d'escriure */
.indicador-escrivint {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.indicador-escrivint span {
  width: 8px;
  height: 8px;
  background: var(--gray-400);
  border-radius: 50%;
  animation: botar 1.4s infinite ease-in-out both;
}

.indicador-escrivint span:nth-child(1) { animation-delay: -0.32s; }
.indicador-escrivint span:nth-child(2) { animation-delay: -0.16s; }

@keyframes botar {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Error */
.missatge-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 0.875rem;
}

/* Entrada de text */
.contenidor-entrada {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contenidor-entrada textarea {
  flex: 1;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.contenidor-entrada textarea:focus {
  border-color: var(--color-perfil);
}

.contenidor-entrada textarea::placeholder {
  color: var(--gray-500);
}

.boto-enviar {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--color-perfil);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.boto-enviar:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.boto-enviar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Suggeriments ràpids */
.suggeriments-rapids {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 24px 16px;
  align-items: center;
}

.etiqueta-suggeriments {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.suggeriments-rapids button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  color: var(--gray-400);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggeriments-rapids button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-perfil);
  color: white;
}
</style>