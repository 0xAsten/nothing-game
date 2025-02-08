import React, { useEffect, useState } from 'react'

interface AnimatedStatProps {
  value: number
  className: string
  previousValue?: number
}

export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  value,
  className,
  previousValue,
}) => {
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (previousValue === undefined) return

    if (value > previousValue) {
      setAnimationClass('increasing')
    } else if (value < previousValue) {
      setAnimationClass('decreasing')
    }

    const timer = setTimeout(() => {
      setAnimationClass('')
    }, 500) // Match animation duration

    return () => clearTimeout(timer)
  }, [value, previousValue])

  return (
    <span className={`stat-value ${className} ${animationClass}`}>{value}</span>
  )
}
