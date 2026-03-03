import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// 配置：可选择本地文件或远程 API
const config = {
  // 设为 true 使用远程 API，false 使用本地文件
  useRemote: process.env.USE_REMOTE === 'true',
  // 远程 OpenClaw Gateway 地址
  remoteUrl: process.env.OPENCLAW_URL || 'http://192.168.150.126:18789',
  // 本地 sessions 文件路径
  localSessionsFile: process.env.SESSIONS_FILE || '/home/orangepi/.openclaw/agents/orchestrator/sessions/sessions.json'
}

// 议员定义
const AGENTS = [
  { id: 'orchestrator', name: '议长', icon: '🏛️', type: 'manager' },
  { id: 'backend', name: '后端议员', icon: '⚙️', type: 'code' },
  { id: 'frontend', name: '前端议员', icon: '🎨', type: 'code' },
  { id: 'qa', name: '测试议员', icon: '🧪', type: 'search' },
  { id: 'devops', name: '运维议员', icon: '🚀', type: 'code' },
  { id: 'reporter', name: '报告议员', icon: '📊', type: 'write' },
]

// 从远程 API 获取 sessions
async function fetchRemoteSessions() {
  try {
    const response = await fetch(`${config.remoteUrl}/api/sessions`, {
      headers: { 'Accept': 'application/json' }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Remote fetch error:', error.message)
    return null
  }
}

// 从本地文件获取 sessions
async function fetchLocalSessions() {
  try {
    const data = await fs.readFile(config.localSessionsFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Local fetch error:', error.message)
    return null
  }
}

// 获取 sessions 数据
async function getSessions() {
  if (config.useRemote) {
    return await fetchRemoteSessions()
  }
  return await fetchLocalSessions()
}

// 读取 sessions 并分析状态
async function getAgentStatus(agentId) {
  try {
    const sessions = await getSessions()
    
    if (!sessions || Object.keys(sessions).length === 0) {
      return { 
        status: 'offline', 
        currentTask: '未启动', 
        progress: 0,
        lastActivity: null
      }
    }
    
    const activeSessions = Object.values(sessions).filter(s => 
      s.modelProvider && s.model && s.sessionId
    )
    
    if (activeSessions.length === 0) {
      return { 
        status: 'idle', 
        currentTask: '等待任务', 
        progress: 0 
      }
    }
    
    // 议长状态检测
    if (agentId === 'orchestrator') {
      const mainSession = activeSessions[0]
      const hasRecentActivity = mainSession.lastMessageAt && 
        (Date.now() - new Date(mainSession.lastMessageAt).getTime()) < 60000
      
      let task = '调度任务中'
      let status = 'running'
      
      if (mainSession.systemPromptReport) {
        const prompt = mainSession.systemPromptReport.systemPrompt || ''
        if (prompt.includes('写代码') || prompt.includes('代码')) {
          task = '处理代码任务'
        } else if (prompt.includes('搜索') || prompt.includes('查找')) {
          task = '搜索信息中'
        } else if (prompt.includes('测试') || prompt.includes('验证')) {
          task = '测试验证中'
        } else if (prompt.includes('报告') || prompt.includes('总结')) {
          task = '撰写报告中'
        }
      }
      
      if (!hasRecentActivity) {
        status = 'idle'
        task = '等待任务'
      } else if (Math.random() > 0.7) {
        status = 'thinking'
        task = '思考中...'
      }
      
      return {
        status,
        currentTask: task,
        progress: hasRecentActivity ? Math.floor(Math.random() * 40) + 60 : 0,
        model: mainSession.model,
        provider: mainSession.modelProvider,
        sessionId: mainSession.sessionId,
        lastActivity: mainSession.lastMessageAt
      }
    }
    
    // 其他议员
    const relevantSession = activeSessions.find(s => 
      s.sessionKey && s.sessionKey.includes(agentId)
    )
    
    if (relevantSession) {
      const hasRecentActivity = relevantSession.lastMessageAt && 
        (Date.now() - new Date(relevantSession.lastMessageAt).getTime()) < 60000
      
      if (!hasRecentActivity) {
        return { status: 'idle', currentTask: '等待任务', progress: 0 }
      }
      
      const agent = AGENTS.find(a => a.id === agentId)
      let task = '执行任务中'
      let status = 'running'
      
      if (agent?.type === 'code') task = '编写代码中'
      else if (agent?.type === 'search') task = '搜索信息中'
      else if (agent?.type === 'write') task = '撰写文档中'
      
      if (Math.random() > 0.8) {
        status = 'thinking'
        task = '思考解决方案'
      }
      
      return {
        status,
        currentTask: task,
        progress: Math.floor(Math.random() * 30) + 40,
        model: relevantSession.model,
        lastActivity: relevantSession.lastMessageAt
      }
    }
    
    return { status: 'idle', currentTask: '等待任务', progress: 0 }
    
  } catch (error) {
    console.error(`Error getting status for ${agentId}:`, error.message)
    return { status: 'error', currentTask: '连接错误', progress: 0, error: error.message }
  }
}

// 获取所有议员状态
async function getAllAgentStatus() {
  const results = await Promise.all(
    AGENTS.map(async (agent) => {
      const status = await getAgentStatus(agent.id)
      return {
        id: agent.id,
        name: agent.name,
        icon: agent.icon,
        type: agent.type,
        ...status,
        updatedAt: new Date().toISOString()
      }
    })
  )
  return results
}

// API: 获取所有议员状态
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await getAllAgentStatus()
    res.json(agents)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// API: 获取配置信息
app.get('/api/config', (req, res) => {
  res.json({
    useRemote: config.useRemote,
    remoteUrl: config.remoteUrl,
    mode: config.useRemote ? 'remote' : 'local'
  })
})

// API: 设置远程模式
app.post('/api/config', (req, res) => {
  if (req.body.useRemote !== undefined) {
    config.useRemote = req.body.useRemote
  }
  if (req.body.remoteUrl) {
    config.remoteUrl = req.body.remoteUrl
  }
  res.json({ success: true, config })
})

// API: 获取指定议员详情
app.get('/api/agents/:id', async (req, res) => {
  try {
    const agent = await getAgentStatus(req.params.id)
    res.json(agent)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// API: 获取任务历史
app.get('/api/tasks', (req, res) => {
  res.json([])
})

// API: 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: { mode: config.useRemote ? 'remote' : 'local' }
  })
})

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  getAllAgentStatus().then(agents => {
    socket.emit('init', agents)
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// 每 3 秒更新状态
async function updateStatus() {
  const agents = await getAllAgentStatus()
  io.emit('agentsUpdate', agents)
}

setInterval(updateStatus, 3000)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pixel Office Server running on port ${PORT}`)
  console.log(`📡 Mode: ${config.useRemote ? 'remote' : 'local'}`)
  if (config.useRemote) {
    console.log(`🌐 Remote URL: ${config.remoteUrl}`)
  }
  console.log(`📊 API: http://localhost:${PORT}/api/agents`)
})
