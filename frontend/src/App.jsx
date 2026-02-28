import { useState, useEffect } from 'react'
import AgentCard from './components/AgentCard'

const AGENTS = [
  { id: 'orchestrator', name: '议长', icon: '🏛️' },
  { id: 'backend', name: '后端议员', icon: '⚙️' },
  { id: 'frontend', name: '前端议员', icon: '🎨' },
  { id: 'qa', name: '测试议员', icon: '🧪' },
  { id: 'devops', name: '运维议员', icon: '🚀' },
  { id: 'reporter', name: '报告议员', icon: '📊' },
]

function App() {
  const [agents, setAgents] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 初始获取
    fetchAgents()
    
    // 定时轮询 (3秒)
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

  const getAgentStatus = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.status || 'offline'
  }

  const getAgentTask = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.currentTask || '无任务'
  }

  const getAgentProgress = (agentId) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.progress || 0
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏛️ AI Parliament Dashboard
          </h1>
          <p className="text-gray-500">智能体任务实时监测平台</p>
          
          {/* 状态栏 */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></span>
              {error ? '连接错误' : '已连接'}
            </span>
            {lastUpdate && (
              <span className="text-gray-400">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </header>

        {/* 议员卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map(agent => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              icon={agent.icon}
              status={getAgentStatus(agent.id)}
              currentTask={getAgentTask(agent.id)}
              progress={getAgentProgress(agent.id)}
            />
          ))}
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <StatCard label="在线议员" value={agents.filter(a => a.status !== 'offline').length} />
          <StatCard label="执行中" value={agents.filter(a => a.status === 'running').length} />
          <StatCard label="已完成" value={agents.filter(a => a.status === 'completed').length} />
          <StatCard label="错误" value={agents.filter(a => a.status === 'error').length} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

export default App
