import type { Origin } from '../centers'
import relief from './huancayo-relief.json'

const { bounds, meters } = relief
const rows = meters.length
const columns = meters[0].length
const kmPerLatitude = 111.2
const kmPerLongitude = kmPerLatitude * Math.cos((bounds.north + bounds.south) * Math.PI / 360)
const widthKm = (bounds.east - bounds.west) * kmPerLongitude
const heightKm = (bounds.north - bounds.south) * kmPerLatitude
export const elevationRange = { min: Math.min(...meters.flat()), max: Math.max(...meters.flat()) }
const baseMeters = elevationRange.min - 410
const exaggeration = 2.7
const toHeight = (elevation: number) => (elevation - baseMeters) * exaggeration / 1000

interface Vertex { east: number; north: number; height: number }
interface ScreenPoint { x: number; y: number; depth: number }
interface Face { vertices: Vertex[]; color: string }
export interface Camera { bearing: number; pitch: number; zoom: number }
export interface Viewport { width: number; height: number }
export const initialCamera: Camera = { bearing: -27, pitch: 39, zoom: 1 }

function vertexAt(u: number, v: number, elevation: number): Vertex {
  return { east: (u - .5) * widthKm, north: (.5 - v) * heightKm, height: toHeight(elevation) }
}

export function terrainPoint([latitude, longitude]: Origin) {
  const u = (longitude - bounds.west) / (bounds.east - bounds.west)
  const v = (bounds.north - latitude) / (bounds.north - bounds.south)
  if (u < 0 || u > 1 || v < 0 || v > 1) return null
  const x = u * (columns - 1)
  const y = v * (rows - 1)
  const left = Math.min(Math.floor(x), columns - 2)
  const top = Math.min(Math.floor(y), rows - 2)
  const mix = (a: number, b: number, fraction: number) => a + (b - a) * fraction
  const upper = mix(meters[top][left], meters[top][left + 1], x - left)
  const lower = mix(meters[top + 1][left], meters[top + 1][left + 1], x - left)
  const elevation = mix(upper, lower, y - top)
  return { vertex: vertexAt(u, v, elevation), elevation: Math.round(elevation) }
}

const palette = [
  [36, 110, 139], [74, 149, 141], [137, 159, 119], [192, 166, 121], [239, 217, 159],
]

function terrainColor(elevation: number, eastSlope: number, northSlope: number) {
  const position = (elevation - elevationRange.min) / (elevationRange.max - elevationRange.min) * (palette.length - 1)
  const band = Math.min(Math.floor(position), palette.length - 2)
  const light = (.4 * eastSlope - .56 * northSlope + .73) / Math.hypot(eastSlope, northSlope, 1)
  const shade = .72 + (light + .2) * .45
  return `rgb(${palette[band].map((channel, index) => Math.round((channel + (palette[band + 1][index] - channel) * (position - band)) * shade)).join(',')})`
}

const grid = meters.map((row, y) => row.map((elevation, x) => vertexAt(x / (columns - 1), y / (rows - 1), elevation)))
const faces: Face[] = []
for (let y = 0; y < rows - 1; y++) {
  for (let x = 0; x < columns - 1; x++) {
    const a = grid[y][x]
    const b = grid[y][x + 1]
    const c = grid[y + 1][x + 1]
    const d = grid[y + 1][x]
    const elevation = (meters[y][x] + meters[y][x + 1] + meters[y + 1][x] + meters[y + 1][x + 1]) / 4
    const eastSlope = (b.height + c.height - a.height - d.height) / (2 * (b.east - a.east))
    const northSlope = (a.height + b.height - c.height - d.height) / (2 * (a.north - d.north))
    faces.push({ vertices: [a, b, c, d], color: terrainColor(elevation, eastSlope, northSlope) })
  }
}

function addWall(a: Vertex, b: Vertex, color: string) {
  faces.push({ vertices: [a, b, { ...b, height: 0 }, { ...a, height: 0 }], color })
}
for (let x = 0; x < columns - 1; x++) {
  addWall(grid[0][x], grid[0][x + 1], '#203251')
  addWall(grid[rows - 1][x], grid[rows - 1][x + 1], '#203251')
}
for (let y = 0; y < rows - 1; y++) {
  addWall(grid[y][0], grid[y + 1][0], '#2e4565')
  addWall(grid[y][columns - 1], grid[y + 1][columns - 1], '#2e4565')
}

export function makeProjection(viewport: Viewport, camera: Camera) {
  const bearing = camera.bearing * Math.PI / 180
  const pitch = camera.pitch * Math.PI / 180
  const sinBearing = Math.sin(bearing), cosBearing = Math.cos(bearing)
  const sinPitch = Math.sin(pitch), cosPitch = Math.cos(pitch)
  const rotate = ({ east, north, height }: Vertex): ScreenPoint => {
    const forward = east * sinBearing + north * cosBearing
    return {
      x: east * cosBearing - north * sinBearing,
      y: -forward * sinPitch - height * cosPitch,
      depth: forward * cosPitch - height * sinPitch,
    }
  }
  const corners = [-widthKm / 2, widthKm / 2].flatMap(east =>
    [-heightKm / 2, heightKm / 2].flatMap(north => [0, toHeight(elevationRange.max)].map(height => rotate({ east, north, height }))),
  )
  const left = Math.min(...corners.map(point => point.x)), right = Math.max(...corners.map(point => point.x))
  const top = Math.min(...corners.map(point => point.y)), bottom = Math.max(...corners.map(point => point.y))
  const scale = Math.min(viewport.width * .9 / (right - left), viewport.height * .84 / (bottom - top)) * camera.zoom
  const project = (vertex: Vertex) => {
    const { x, y, depth } = rotate(vertex)
    return { x: viewport.width / 2 + (x - (left + right) / 2) * scale, y: viewport.height / 2 + (y - (top + bottom) / 2) * scale, depth }
  }
  return { project, northAngle: Math.atan2(-sinBearing, cosBearing * sinPitch) * 180 / Math.PI }
}

export function drawRelief(context: CanvasRenderingContext2D, size: Viewport, project: ReturnType<typeof makeProjection>['project']) {
  context.clearRect(0, 0, size.width, size.height)
  const surface = faces.map(face => {
    const points = face.vertices.map(project)
    return { points, color: face.color, depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length }
  }).sort((first, second) => second.depth - first.depth)
  context.lineWidth = .7
  for (const { points, color } of surface) {
    context.beginPath()
    context.moveTo(points[0].x, points[0].y)
    for (const point of points.slice(1)) context.lineTo(point.x, point.y)
    context.closePath()
    context.fillStyle = color
    context.strokeStyle = color
    context.fill()
    context.stroke()
  }
}

export function radiusPoints(origin: Origin, radiusM: number) {
  return Array.from({ length: 97 }, (_, index) => {
    const angle = index * Math.PI / 48
    return terrainPoint([
      origin[0] + Math.sin(angle) * radiusM / (kmPerLatitude * 1000),
      origin[1] + Math.cos(angle) * radiusM / (kmPerLongitude * 1000),
    ])
  })
}
