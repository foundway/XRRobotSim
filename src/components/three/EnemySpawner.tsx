import { useState, useRef, Suspense, useEffect } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Enemy } from './Enemy'
import { useSceneStore } from '../../store/SceneStore'

const spawnInterval = 2
const spawnVolume = { minX: -5, maxX: 5, minY: 2, maxY: 5, minZ: -7, maxZ: -5 }

export const EnemySpawner = () => {
  const [enemyIds, setEnemyIds] = useState<string[]>([])
  const { enemyCountMax } = useSceneStore()
  const lastSpawnTime = useRef(0)
  const hasStarted = useRef(false)
  const enemyRefs = useRef<{ [key: string]: { isHibernated: () => boolean, spawn: (position: Vector3) => void } }>({})

  const getRandomSpawnPosition = (): Vector3 => {
    const x = Math.random() * (spawnVolume.maxX - spawnVolume.minX) + spawnVolume.minX
    const y = Math.random() * (spawnVolume.maxY - spawnVolume.minY) + spawnVolume.minY
    const z = Math.random() * (spawnVolume.maxZ - spawnVolume.minZ) + spawnVolume.minZ
    return new Vector3(x, y, z)
  }

  useEffect(() => {
    const ids = Array.from({ length: enemyCountMax }, (_, i) => `enemy-${i}`)
    setEnemyIds(ids)
  }, [enemyCountMax])

  const registerEnemy = (id: string, ref: { isHibernated: () => boolean, spawn: (position: Vector3) => void }) => {
    enemyRefs.current[id] = ref
  }

  const checkSpawn = (state: any) => {
    const currentTime = state.clock.elapsedTime
    
    if (!hasStarted.current && currentTime > 1) {
      hasStarted.current = true
      lastSpawnTime.current = currentTime
    }
    if (hasStarted.current && currentTime - lastSpawnTime.current >= spawnInterval) {
      for (const id of enemyIds) {
        const enemyRef = enemyRefs.current[id]
        if (enemyRef && enemyRef.isHibernated()) {
          enemyRef.spawn(getRandomSpawnPosition())
          lastSpawnTime.current = currentTime
          console.log(`Enemy ${id} spawned!`)
          break
        }
      }
    }
  }

  useFrame((state) => {
    checkSpawn(state)
  })

  return (
    <Suspense fallback={null}>
      {enemyIds.map((id) => (
        <Enemy
          key={id}
          id={id}
          onRegister={registerEnemy}
        />
      ))}
    </Suspense>
  )
} 