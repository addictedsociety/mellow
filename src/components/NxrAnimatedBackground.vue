<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const { intensity = 1, particleCount = 90 } = defineProps<{
  intensity?: number
  particleCount?: number
}>()

const containerRef = ref<HTMLDivElement | null>(null)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let auroraMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null = null
let particles: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null
let colorProbe: HTMLDivElement | null = null

const timer = new THREE.Timer()
const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

const cssColorToVec3 = (cssVar: string, fallback: [number, number, number]): THREE.Vector3 => {
  if (!colorProbe) return new THREE.Vector3(...fallback)
  colorProbe.style.color = ''
  colorProbe.style.color = `var(${cssVar})`
  const rgb = getComputedStyle(colorProbe).color
  const match = rgb.match(/rgba?\(([^)]+)\)/)
  if (!match) return new THREE.Vector3(...fallback)
  const parts = match[1].split(',').map((v) => parseFloat(v.trim()) / 255)
  return new THREE.Vector3(
    parts[0] ?? fallback[0],
    parts[1] ?? fallback[1],
    parts[2] ?? fallback[2]
  )
}

const readThemeColors = () => {
  return {
    primary: cssColorToVec3('--primary', [0.55, 0.36, 1]),
    accent: cssColorToVec3('--chart-2', [0.35, 0.55, 1]),
    secondary: cssColorToVec3('--chart-1', [0.95, 0.6, 0.4]),
    background: cssColorToVec3('--background', [0.05, 0.05, 0.07]),
    foreground: cssColorToVec3('--foreground', [1, 1, 1])
  }
}

const auroraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const auroraFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uIntensity;
  uniform vec3 uPrimary;
  uniform vec3 uAccent;
  uniform vec3 uSecondary;
  uniform vec3 uBackground;

  // Simplex-ish smooth noise
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
    for (int i = 0; i < 5; i++) {
      value += amp * noise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;

    float t = uTime * 0.02;

    vec2 pointerOffset = (uPointer - 0.5) * 0.15;
    p += pointerOffset;

    vec2 q = vec2(
      fbm(p + vec2(0.0, t)),
      fbm(p + vec2(5.2, -t * 1.3) + 1.7)
    );

    vec2 r = vec2(
      fbm(p + 4.0 * q + vec2(1.7 + t * 0.5, 9.2)),
      fbm(p + 4.0 * q + vec2(8.3 - t * 0.4, 2.8))
    );

    float f = fbm(p + 4.0 * r);
    float field = smoothstep(-0.2, 0.9, f);

    float blob1 = smoothstep(0.6, 0.0, length(p - vec2(-0.4, 0.25) + r * 0.3));
    float blob2 = smoothstep(0.7, 0.0, length(p - vec2(0.45, -0.2) + r * 0.4));
    float blob3 = smoothstep(0.55, 0.0, length(p - vec2(0.0, 0.4) + q * 0.3));

    vec3 color = uBackground;
    color = mix(color, uPrimary, blob1 * 0.55 * uIntensity);
    color = mix(color, uAccent, blob2 * 0.5 * uIntensity);
    color = mix(color, uSecondary, blob3 * 0.4 * uIntensity);
    color = mix(color, uPrimary * 0.6 + uAccent * 0.4, field * 0.25 * uIntensity);

    float vignette = smoothstep(1.2, 0.2, length(p));
    color = mix(uBackground, color, vignette);

    float grain = (hash(uv * uResolution + uTime).x) * 0.015;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`

const particlesVertex = /* glsl */ `
  attribute float aSize;
  attribute float aOffset;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  varying float vAlpha;

  void main() {
    vec3 pos = position;

    float drift = sin(uTime * 0.2 + aOffset * 6.28) * 0.08;
    float bob = cos(uTime * 0.35 + aOffset * 12.56) * 0.06;

    pos.x += drift + uPointer.x * 0.05 * (0.3 + aOffset);
    pos.y += bob + uPointer.y * 0.05 * (0.3 + aOffset);

    vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.6 + aOffset * 9.42));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + 0.4 * sin(uTime + aOffset * 3.14));
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particlesFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`

const buildParticles = (count: number) => {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const offsets = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 2.4
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.4
    positions[i * 3 + 2] = 0
    sizes[i] = Math.random() * 3 + 1.5
    offsets[i] = Math.random()
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1))

  return geometry
}

const applyThemeColors = () => {
  if (!auroraMesh || !particles) return
  const colors = readThemeColors()
  auroraMesh.material.uniforms.uPrimary.value.copy(colors.primary)
  auroraMesh.material.uniforms.uAccent.value.copy(colors.accent)
  auroraMesh.material.uniforms.uSecondary.value.copy(colors.secondary)
  auroraMesh.material.uniforms.uBackground.value.copy(colors.background)
  particles.material.uniforms.uColor.value.copy(colors.foreground)
}

const handlePointerMove = (event: PointerEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  pointer.tx = (event.clientX - rect.left) / rect.width
  pointer.ty = 1 - (event.clientY - rect.top) / rect.height
}

const animate = () => {
  if (!renderer || !scene || !camera || !auroraMesh || !particles) return
  timer.update()
  const elapsed = timer.getElapsed()

  pointer.x += (pointer.tx - pointer.x) * 0.05
  pointer.y += (pointer.ty - pointer.y) * 0.05

  auroraMesh.material.uniforms.uTime.value = elapsed
  auroraMesh.material.uniforms.uPointer.value.set(pointer.x, pointer.y)
  particles.material.uniforms.uTime.value = elapsed
  particles.material.uniforms.uPointer.value.set(pointer.x - 0.5, pointer.y - 0.5)

  renderer.render(scene, camera)
  frameId = requestAnimationFrame(animate)
}

const resize = () => {
  if (!renderer || !auroraMesh || !containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value
  renderer.setSize(clientWidth, clientHeight, false)
  auroraMesh.material.uniforms.uResolution.value.set(clientWidth, clientHeight)
}

onMounted(() => {
  if (!containerRef.value) return

  colorProbe = document.createElement('div')
  colorProbe.style.display = 'none'
  containerRef.value.appendChild(colorProbe)

  const colors = readThemeColors()

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 1

  const pixelRatio = Math.min(window.devicePixelRatio, 2)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight, false)
  containerRef.value.appendChild(renderer.domElement)

  const auroraMaterial = new THREE.ShaderMaterial({
    vertexShader: auroraVertex,
    fragmentShader: auroraFragment,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(containerRef.value.clientWidth, containerRef.value.clientHeight)
      },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: intensity },
      uPrimary: { value: colors.primary },
      uAccent: { value: colors.accent },
      uSecondary: { value: colors.secondary },
      uBackground: { value: colors.background }
    }
  })
  auroraMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), auroraMaterial)
  scene.add(auroraMesh)

  const particleMaterial = new THREE.ShaderMaterial({
    vertexShader: particlesVertex,
    fragmentShader: particlesFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: colors.foreground }
    }
  })
  particles = new THREE.Points(buildParticles(particleCount), particleMaterial)
  scene.add(particles)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(containerRef.value)

  themeObserver = new MutationObserver(applyThemeColors)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-mode', 'class']
  })

  window.addEventListener('pointermove', handlePointerMove)

  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  window.removeEventListener('pointermove', handlePointerMove)
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  auroraMesh?.geometry.dispose()
  auroraMesh?.material.dispose()
  particles?.geometry.dispose()
  particles?.material.dispose()
  renderer?.dispose()
  if (renderer?.domElement && containerRef.value?.contains(renderer.domElement)) {
    containerRef.value.removeChild(renderer.domElement)
  }
  if (colorProbe && containerRef.value?.contains(colorProbe)) {
    containerRef.value.removeChild(colorProbe)
  }
  renderer = null
  scene = null
  camera = null
  auroraMesh = null
  particles = null
  colorProbe = null
})
</script>

<template>
  <div ref="containerRef" class="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
</template>
