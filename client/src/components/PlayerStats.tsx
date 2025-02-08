import React from 'react'
import { PlayerStats as PlayerStatsType } from '@/types/game'
import { AnimatedStat } from './AnimatedStat'

interface PlayerStatsProps {
  stats: PlayerStatsType
  previousStats?: PlayerStatsType
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({
  stats,
  previousStats,
}) => {
  return (
    <div className="player-stats-container">
      <div className="player-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Gold</span>
          <AnimatedStat
            value={stats.gold}
            className="gold"
            previousValue={previousStats?.gold}
          />
        </div>
        <div className="stat-card">
          <span className="stat-label">Attack</span>
          <AnimatedStat
            value={stats.attack}
            className="atk"
            previousValue={previousStats?.attack}
          />
        </div>
        <div className="stat-card">
          <span className="stat-label">Defense</span>
          <AnimatedStat
            value={stats.defense}
            className="def"
            previousValue={previousStats?.defense}
          />
        </div>
        <div className="stat-card">
          <span className="stat-label">Health</span>
          <AnimatedStat
            value={stats.health}
            className="hp"
            previousValue={previousStats?.health}
          />
        </div>
      </div>
    </div>
  )
}
