import React, { useState, useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Enemy } from './Enemy'

interface EnemyData {
  id: string
  position: Vector3
}

export const EnemySpawner = () => {
  const [enemies, setEnemies] = useState<EnemyData[]>([])
  const [enemyCount, setEnemyCount] = useState(0)
  const lastSpawnTime = useRef(0)
  const spawnInterval = 3 // Spawn every 3 seconds
  const maxEnemies = 10
  const hasStarted = useRef(false)
  const spawnVolume = { minX: -5, maxX: 5, minY: 2, maxY: 5, minZ: -7, maxZ: -5 }

  // Generate random position within spawn volume
  const getRandomSpawnPosition = (): Vector3 => {
    const x = Math.random() * (spawnVolume.maxX - spawnVolume.minX) + spawnVolume.minX
    const y = Math.random() * (spawnVolume.maxY - spawnVolume.minY) + spawnVolume.minY
    const z = Math.random() * (spawnVolume.maxZ - spawnVolume.minZ) + spawnVolume.minZ
    return new Vector3(x, y, z)
  }

  // Dispatch event for UI updates
  const updateEnemyCount = (count: number) => {
    setEnemyCount(count)
    window.dispatchEvent(new CustomEvent('enemySpawned', { detail: { count } }))
  }

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime
    
    // Start spawning after 1 second
    if (!hasStarted.current && currentTime > 1) {
      hasStarted.current = true
      lastSpawnTime.current = currentTime
    }
    
    // Check if it's time to spawn a new enemy
    if (hasStarted.current && currentTime - lastSpawnTime.current >= spawnInterval && enemyCount < maxEnemies) {
      const newEnemy: EnemyData = {
        id: `enemy-${Date.now()}-${Math.random()}`,
        position: getRandomSpawnPosition()
      }
      
      setEnemies(prev => [...prev, newEnemy])
      const newCount = enemyCount + 1
      updateEnemyCount(newCount)
      lastSpawnTime.current = currentTime
      
      // Log spawn for debugging
      console.log(`Enemy spawned! Total enemies: ${newCount}/${maxEnemies}`)
    }
  })

  // Optional: Add cleanup for enemies that get too close to character
  useEffect(() => {
    const checkEnemyDistances = () => {
      setEnemies(prev => {
        const characterPos = new Vector3(0, 0, -3)
        return prev.filter(enemy => {
          // This would need to be implemented with actual enemy positions
          // For now, we'll keep all enemies
          return true
        })
      })
    }
    
    const interval = setInterval(checkEnemyDistances, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          id={enemy.id}
          initialPosition={enemy.position}
        />
      ))}
    </>
  )
} 