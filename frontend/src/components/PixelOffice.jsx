import { useState, useEffect } from 'react'
import PixelAgent from './PixelAgent'
import StatusPanel from './StatusPanel'

// 区域定义
const ZONES = [
  { id: 'code', name: '💻 代码区', x: 0, y: 0, width: 50, height: 50, color: '#2d3748' },
  { id: 'search', name: '🔍 搜索区', x: 50, y: 0, width: 25, height: 50, color: '#744210' },
  { id: 'write', name: '✍️ 写作区', x: 75, y: 0, width: 25, height: 50, color: '#2c5282' },
  { id: 'rest', name: '☕ 休息区', x: 0, y: 50, width: 100, height: 50, color: '#276749' },
]

// Agent 分配到区域
const AGENT_ZONES = {
  orchestrator: 'search',  // 议长 - 搜索区
  backend: 'code',         // 后端 - 代码区
  frontend: 'code',        // 前端 - 代码区
  qa: 'search',           // 测试 - 搜索区
  devops: 'code',         // 运维 - 代码区
  reporter: 'write',      // 报告 - 写作区
}

const AGENTS = [
  { id: 'orchestrator', name: '议长', icon: '🏛️' },
  { id: 'backend', name: '后端议员', icon: '⚙️' },
  { id: 'frontend', name: '前端议员', icon: '🎨' },
  { id: 'qa', name: '测试议员', icon: '🧪' },
  { id: 'devops', name: '运维议员', icon: '🚀' },
  { id: 'reporter', name: '报告议员', icon: '📊' },
]

function PixelOffice() {
  const [agents, setAgents] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents')
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      setAgents(data)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const getAgentById = (agentId) => agents.find(a => a.id === agentId)

  const getZoneForAgent = (agentId) => {
    const agent = getAgentById(agentId)
    const status = agent?.status
    
    // 根据状态分配区域
    if (status === 'offline') return null
    if (status === 'idle' || status === 'waiting') return 'rest'
    if (status === 'error') return 'rest' // 出错也回休息区
    
    return AGENT_ZONES[agentId] || 'rest'
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题栏 */}
        <header className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🏢 Pixel Office</h1>
            <p className="text-gray-400 text-sm">OpenClaw Agent 监控中心</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-gray-300 text-sm">{error ? '连接错误' : '已连接'}</span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                更新: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        <div className="flex gap-4">
          {/* 像素办公室主场景 */}
          <div className="flex-1">
            <div 
              className="relative rounded-lg overflow-hidden"
              style={{ 
                height: '400px',
                background: 'linear-gradient(to bottom, #1a202c 0%, #2d3748 100%)'
              }}
            >
              {/* 区域背景 */}
              {ZONES.map(zone => (
                <div
                  key={zone.id}
                  className="absolute border border-gray-700"
                  style={{
                    left: zone.x + '%',
                    top: zone.y + '%',
                    width: zone.width + '%',
                    height: zone.height + '%',
                    backgroundColor: zone.color,
                    opacity: 0.3
                  }}
                >
                  <span className="absolute top-2 left-2 text-xs text-gray-400">
                    {zone.name}
                  </span>
                </div>
              ))}

              {/* 区域分隔线 */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600"></div>

              {/* 像素小人 */}
              {AGENTS.map((agent, index) => {
                const agentData = getAgentById(agent.id)
                const zoneId = getZoneForAgent(agent.id)
                const zone = ZONES.find(z => z.id === zoneId)
                
                if (!zone) return null // offline 状态不显示

                return (
                  <PixelAgent
                    key={agent.id}
                    agent={agent}
                    status={agentData?.status || 'offline'}
                    task={agentData?.currentTask || ''}
                    zone={zone}
                    index={index}
                  />
                )
              })}
            </div>
          </div>

          {/* 状态面板 */}
          <StatusPanel agents={agents} />
        </div>

        {/* 底部统计 */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          <StatBox 
            label="在线" 
            value={agents.filter(a => a.status !== 'offline').length}
            color="green"
          />
          <StatBox 
            label="工作中" 
            value={agents.filter(a => a.status === 'running').length}
            color="blue"
          />
          <StatBox 
            label="思考中" 
            value={agents.filter(a => a.status === 'thinking').length}
            color="yellow"
          />
          <StatBox 
            label="待命" 
            value={agents.filter(a => a.status === 'idle').length}
            color="gray"
          />
          <StatBox 
            label="出错" 
            value={agents.filter(a => a.status === 'error').length}
            color="red"
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  const colors = {
    green: 'bg-green-900 text-green-300',
    blue: 'bg-blue-900 text-blue-300',
    yellow: 'bg-yellow-900 text-yellow-300',
    gray: 'bg-gray-700 text-gray-300',
    red: 'bg-red-900 text-red-300',
  }
  
  return (
    <div className={colors[color] + " rounded-lg p-3 text-center"}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}

export default PixelOffice
