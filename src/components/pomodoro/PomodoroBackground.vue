<script setup lang="ts">
import * as THREE from 'three'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { PomodoroMode } from '@/stores/pomodoro'

const { mode } = defineProps<{
  mode: PomodoroMode
}>()

const containerRef = ref<HTMLDivElement | null>(null)

type Palette = {
  primary: THREE.Vector3
  secondary: THREE.Vector3
  background: THREE.Vector3
  speed: number
  intensity: number
}

const MODE_PALETTES: Record<PomodoroMode, Palette> = {
  focus: {
    primary: new THREE.Vector3(0.96, 0.32, 0.36),
    secondary: new THREE.Vector3(1.0, 0.58, 0.3),
    background: new THREE.Vector3(0.07, 0.04, 0.06),
    speed: 0.4,
    intensity: 1.15
  },
  shortBreak: {
    primary: new THREE.Vector3(0.32, 0.86, 0.86),
    secondary: new THREE.Vector3(0.55, 0.95, 0.7),
    background: new THREE.Vector3(0.04, 0.07, 0.09),
    speed: 0.2,
    intensity: 0.85
  },
  longBreak: {
    primary: new THREE.Vector3(0.66, 0.44, 1.0),
    secondary: new THREE.Vector3(0.95, 0.55, 0.85),
    background: new THREE.Vector3(0.06, 0.04, 0.1),
    speed: 0.1,
    intensity: 0.95
  }
}

const targetState = {
  primary: new THREE.Vector3(),
  secondary: new THREE.Vector3(),
  background: new THREE.Vector3(),
  speed: 1,
  intensity: 1
}

const applyMode = (next: PomodoroMode) => {
  const palette = MODE_PALETTES[next]
  targetState.primary.copy(palette.primary)
  targetState.secondary.copy(palette.secondary)
  targetState.background.copy(palette.background)
  targetState.speed = palette.speed
  targetState.intensity = palette.intensity
}

applyMode(mode)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let phase = 0

const clock = new THREE.Clock()

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform vec3 uPrimary;
  uniform vec3 uSecondary;
  uniform vec3 uBackground;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(in vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(
      dot(a, hash(i + 0.0)),
      dot(b, hash(i + o)),
      dot(c, hash(i + 1.0))
    );
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    float t = uTime * 0.35;

    vec2 q = vec2(
      fbm(p + vec2(0.0, t)),
      fbm(p + vec2(5.2, -t))
    );

    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7 + t * 0.4, 9.2)),
      fbm(p + 3.0 * q + vec2(8.3 - t * 0.3, 2.8))
    );

    float blob1 = smoothstep(0.75, 0.0, length(p - vec2(-0.45, 0.25) + r * 0.4));
    float blob2 = smoothstep(0.7, 0.0, length(p - vec2(0.4, -0.3) + r * 0.35));
    float blob3 = smoothstep(0.55, 0.0, length(p + q * 0.35));

    vec3 color = uBackground;
    color = mix(color, uPrimary, blob1 * uIntensity);
    color = mix(color, uSecondary, blob2 * uIntensity * 0.85);
    color = mix(color, mix(uPrimary, uSecondary, 0.5), blob3 * uIntensity * 0.55);

    float vignette = smoothstep(1.4, 0.25, length(p));
    color = mix(uBackground, color, vignette);

    float grain = (hash(uv * uResolution + uTime * 60.0).x) * 0.012;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`

const animate = () => {
  if (!renderer || !scene || !camera || !mesh) return

  const dt = clock.getDelta()
  const u = mesh.material.uniforms
  const lerpFactor = 0.04

  u.uPrimary.value.lerp(targetState.primary, lerpFactor)
  u.uSecondary.value.lerp(targetState.secondary, lerpFactor)
  u.uBackground.value.lerp(targetState.background, lerpFactor)
  u.uIntensity.value += (targetState.intensity - u.uIntensity.value) * lerpFactor
  u.uSpeed.value += (targetState.speed - u.uSpeed.value) * lerpFactor

  phase += dt * u.uSpeed.value
  u.uTime.value = phase

  renderer.render(scene, camera)
  frameId = requestAnimationFrame(animate)
}

const resize = () => {
  if (!renderer || !mesh || !containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value
  renderer.setSize(clientWidth, clientHeight, false)
  mesh.material.uniforms.uResolution.value.set(clientWidth, clientHeight)
}

watch(
  () => mode,
  (next) => {
    applyMode(next)
  }
)

onMounted(() => {
  if (!containerRef.value) return

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight, false)
  containerRef.value.appendChild(renderer.domElement)

  const palette = MODE_PALETTES[mode]

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(containerRef.value.clientWidth, containerRef.value.clientHeight)
      },
      uIntensity: { value: palette.intensity },
      uSpeed: { value: palette.speed },
      uPrimary: { value: palette.primary.clone() },
      uSecondary: { value: palette.secondary.clone() },
      uBackground: { value: palette.background.clone() }
    }
  })
  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  scene.add(mesh)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(containerRef.value)

  clock.start()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  mesh?.geometry.dispose()
  mesh?.material.dispose()
  renderer?.dispose()
  if (renderer?.domElement && containerRef.value?.contains(renderer.domElement)) {
    containerRef.value.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
  mesh = null
})
</script>

<template>
  <div ref="containerRef" class="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
</template>
