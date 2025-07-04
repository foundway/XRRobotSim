import { useState, useRef, Suspense } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Enemy } from './Enemy'
import { useSceneStore } from '../../store/SceneStore'

const spawnInterval = 2
const spawnVolume = { minX: -5, maxX: 5, minY: 2, maxY: 5, minZ: -7, maxZ: -5 }

interface EnemyData {
  id: string
  position: Vector3
}

export const EnemySpawner = () => {
  const [enemies, setEnemies] = useState<EnemyData[]>([])
  const { enemyCount, enemyCountMax, setEnemyCount } = useSceneStore()
  const lastSpawnTime = useRef(0)
  const hasStarted = useRef(false)

  const getRandomSpawnPosition = (): Vector3 => {
    const x = Math.random() * (spawnVolume.maxX - spawnVolume.minX) + spawnVolume.minX
    const y = Math.random() * (spawnVolume.maxY - spawnVolume.minY) + spawnVolume.minY
    const z = Math.random() * (spawnVolume.maxZ - spawnVolume.minZ) + spawnVolume.minZ
    return new Vector3(x, y, z)
  }

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime
    
    if (!hasStarted.current && currentTime > 1) {
      hasStarted.current = true
      lastSpawnTime.current = currentTime
    }
    if (hasStarted.current && currentTime - lastSpawnTime.current >= spawnInterval && enemyCount < enemyCountMax) {
      const newEnemy: EnemyData = {
        id: `enemy-${Date.now()}-${Math.random()}`,
        position: getRandomSpawnPosition()
      }
      setEnemies(prev => [...prev, newEnemy])
      const newCount = enemyCount + 1
      setEnemyCount(newCount)
      lastSpawnTime.current = currentTime
      console.log(`Enemy spawned! Total enemies: ${newCount}/${enemyCountMax}`)
    }
  })

  return (
    <>
      <Suspense fallback={null}>
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            initialPosition={enemy.position}
          />
        ))}
      </Suspense>
    </>
  )
} 