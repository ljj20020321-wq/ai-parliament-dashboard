import { useState, useEffect } from 'react'

// 像素小人的颜色配置
const AGENT_COLORS = {
  orchestrator: { body: '#9333ea', head: '#c084fc' },  // 紫色 - 议长
  backend: { body: '#3b82f6', head: '#60a5fa' },       // 蓝色 - 后端
  frontend: { body: '#ec4899', head: '#f9a8d4' },     // 粉色 - 前端
  qa: { body: '#f59e0b', head: '#fbbf24' },           // 黄色 - 测试
  devops: { body: '#10b981', head: '#34d399' },      // 绿色 - 运维
  reporter: { body: '#8b5cf6', head: '#a78bfa' },    // 紫色 - 报告
}

// 状态动画配置
const STATUS_ANIMATION = {
  running: { type: 'work', speed: 200 },
  thinking: { type: 'think', speed: 500 },
  idle: { type: 'walk', speed: 800 },
  error: { type: 'fall', speed: 0 },
  waiting: { type: 'idle', speed: 1000 },
}

function PixelAgent({ agent, status, task, zone, index }) {
  const [frame, setFrame] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const colors = AGENT_COLORS[agent.id] || { body: '#6b7280', head: '#9ca3af' }
  const animation = STATUS_ANIMATION[status] || STATUS_ANIMATION.idle

  // 随机初始位置（在区域内）
  useEffect(() => {
    const baseX = zone.x + 5 + (index * 8) % (zone.width - 15)
    const baseY = zone.y + 10 + Math.floor(index / 3) * 20
    setPosition({ x: baseX, y: baseY })
  }, [zone, index])

  // 动画循环
  useEffect(() => {
    if (status === 'offline' || status === 'error') return
    
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4)
    }, animation.speed)
    
    return () => clearInterval(interval)
  }, [status, animation.speed])

  // 计算抖动偏移（模拟动作）
  const getOffset = () => {
    if (status === 'running') {
      return { x: (frame % 2) * 2, y: frame < 2 ? -2 : 0 }
    }
    if (status === 'thinking') {
      return { x: 0, y: Math.sin(frame * Math.PI / 2) * 3 }
    }
    if (status === 'idle') {
      return { x: Math.sin(frame * Math.PI / 2) * 5, y: 0 }
    }
    return { x: 0, y: 0 }
  }

  const offset = getOffset()

  // 气泡显示任务
  const showBubble = status === 'running' || status === 'thinking' || status === 'error'

  return (
    <div
      className="absolute transition-all duration-300"
      style={{
        left: (position.x + offset.x) + '%',
        top: (position.y + offset.y) + '%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 气泡 */}
      {showBubble && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`
            text-xs px-2 py-1 rounded-lg mb-1
            ${status === 'running' ? 'bg-blue-600 text-white' : ''}
            ${status === 'thinking' ? 'bg-yellow-600 text-white' : ''}
            ${status === 'error' ? 'bg-red-600 text-white' : ''}
          `}>
            {task.length > 15 ? task.substring(0, 15) + '...' : task}
          </div>
          {/* 气泡小三角 */}
          <div className={`
            absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45
            ${status === 'running' ? 'bg-blue-600' : ''}
            ${status === 'thinking' ? 'bg-yellow-600' : ''}
            ${status === 'error' ? 'bg-red-600' : ''}
          `}></div>
        </div>
      )}

      {/* 像素小人 */}
      <div className="relative">
        {/* 头部 */}
        <div 
          className="w-6 h-6 rounded-sm"
          style={{ 
            backgroundColor: colors.head,
            boxShadow: status === 'error' ? '0 0 10px red' : 'none'
          }}
        >
          {/* 眼睛 */}
          <div className="absolute top-1.5 left-1 w-1 h-1 bg-white rounded-sm"></div>
          <div className="absolute top-1.5 right-1 w-1 h-1 bg-white rounded-sm"></div>
          
          {/* 状态特殊效果 */}
          {status === 'thinking' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">💭</div>
          )}
          {status === 'error' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">😵</div>
          )}
          {status === 'running' && (
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2">
              <div className="w-1 h-1 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </div>
        
        {/* 身体 */}
        <div 
          className="w-4 h-4 mx-auto -mt-1 rounded-sm"
          style={{ 
            backgroundColor: colors.body,
            opacity: status === 'error' ? 0.5 : 1
          }}
        ></div>
        
        {/* 腿 */}
        <div className="flex justify-center gap-1 -mt-0.5">
          <div 
            className="w-1.5 h-2 rounded-sm"
            style={{ 
              backgroundColor: colors.body,
              transform: status === 'running' ? `translateY(${(frame % 2) * -2}px)` : 'none'
            }}
          ></div>
          <div 
            className="w-1.5 h-2 rounded-sm"
            style={{ 
              backgroundColor: colors.body,
              transform: status === 'running' ? `translateY(${(frame + 1) % 2 * -2}px)` : 'none'
            }}
          ></div>
        </div>
      </div>

      {/* 名字标签 */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-black/50 px-1 rounded">
        {agent.icon} {agent.name}
      </div>
    </div>
  )
}

export default PixelAgent
