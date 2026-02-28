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

// OpenClaw 配置文件路径
const SESSIONS_FILE = '/home/orangepi/.openclaw/agents/orchestrator/sessions/sessions.json'
const PROJECT_CONFIG = '/home/orangepi/.openclaw/workspace/ai-parliament/config/project.json'

// 议员定义
const AGENTS = [
  { id: 'orchestrator', name: '议长', icon: '🏛️' },
  { id: 'backend', name: '后端议员', icon: '⚙️' },
  { id: 'frontend', name: '前端议员', icon: '🎨' },
  { id: 'qa', name: '测试议员', icon: '🧪' },
  { id: 'devops', name: '运维议员', icon: '🚀' },
  { id: 'reporter', name: '报告议员', icon: '📊' },
]

// 获取真实状态
async function getAgentStatus(agentId) {
  try {
    // 读取 sessions 文件
    const sessionsData = await fs.readFile(SESSIONS_FILE, 'utf-8')
    const sessions = JSON.parse(sessionsData)
    
    // 查找当前活跃会话
    const activeSession = Object.values(sessions).find(s => 
      s.modelProvider && s.model
    )
    
    if (!activeSession) {
      return { status: 'offline', currentTask: '未启动', progress: 0 }
    }
    
    // 判断是否为议长
    if (agentId === 'orchestrator') {
      const tokens = activeSession.contextTokens || 200000
      const used = activeSession.systemPromptReport?.systemPrompt?.chars || 0
      const usage = Math.round((used / tokens) * 100)
      
      return {
        status: 'running',
        currentTask: '调度任务中',
        progress: Math.min(usage, 100),
        model: activeSession.model,
        provider: activeSession.modelProvider,
        sessionId: activeSession.sessionId
      }
    }
    
    // 其他议员 - 检查是否有子代理会话
    const subagentSession = Object.values(sessions).find(s => 
      s.sessionKey && s.sessionKey.includes(agentId)
    )
    
    if (subagentSession) {
      return {
        status: 'running',
        currentTask: '执行任务',
        progress: 50,
        model: subagentSession.model,
        sessionId: subagentSession.sessionId
      }
    }
    
    return { status: 'idle', currentTask: '等待任务', progress: 0 }
    
  } catch (error) {
    console.error(`Error getting status for ${agentId}:`, error.message)
    return { status: 'offline', currentTask: '未连接', progress: 0 }
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // 发送当前所有状态
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
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 WebSocket ready`)
})
