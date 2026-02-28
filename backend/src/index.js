import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

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

// 模拟数据 - 议员状态
const agents = [
  {
    id: 'orchestrator',
    name: '议长',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'backend',
    name: '后端议员',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'frontend',
    name: '前端议员',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'qa',
    name: '测试议员',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'devops',
    name: '运维议员',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'reporter',
    name: '报告议员',
    status: 'idle',
    currentTask: '等待任务',
    progress: 0,
    startedAt: null,
    updatedAt: new Date().toISOString()
  }
]

// 任务历史
const taskHistory = []

// API: 获取所有议员状态
app.get('/api/agents', (req, res) => {
  res.json(agents)
})

// API: 获取指定议员详情
app.get('/api/agents/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' })
  }
  res.json(agent)
})

// API: 获取任务历史
app.get('/api/tasks', (req, res) => {
  res.json(taskHistory)
})

// API: 更新议员状态 (供测试使用)
app.post('/api/agents/:id/status', (req, res) => {
  const { status, currentTask, progress } = req.body
  const agent = agents.find(a => a.id === req.params.id)
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' })
  }
  
  agent.status = status
  if (currentTask !== undefined) agent.currentTask = currentTask
  if (progress !== undefined) agent.progress = progress
  agent.updatedAt = new Date().toISOString()
  
  // 广播更新
  io.emit('agentUpdate', agent)
  
  res.json(agent)
})

// WebSocket 连接
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // 发送当前所有状态
  socket.emit('init', agents)
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// 模拟任务执行 (用于演示)
function simulateTasks() {
  const randomAgent = agents[Math.floor(Math.random() * agents.length)]
  
  if (randomAgent.status === 'idle') {
    randomAgent.status = 'running'
    randomAgent.currentTask = `任务-${Date.now().toString().slice(-4)}`
    randomAgent.progress = 0
    randomAgent.startedAt = new Date().toISOString()
    io.emit('agentUpdate', randomAgent)
  } else if (randomAgent.status === 'running') {
    randomAgent.progress += Math.floor(Math.random() * 30) + 10
    
    if (randomAgent.progress >= 100) {
      taskHistory.push({
        ...randomAgent,
        completedAt: new Date().toISOString()
      })
      randomAgent.status = 'completed'
      randomAgent.progress = 100
      io.emit('agentUpdate', randomAgent)
      
      // 1秒后重置为空闲
      setTimeout(() => {
        randomAgent.status = 'idle'
        randomAgent.currentTask = '等待任务'
        randomAgent.progress = 0
        randomAgent.startedAt = null
        io.emit('agentUpdate', randomAgent)
      }, 2000)
    } else {
      io.emit('agentUpdate', randomAgent)
    }
  }
}

// 每3秒模拟一次任务变化 (仅用于演示)
setInterval(simulateTasks, 3000)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 WebSocket ready`)
})
