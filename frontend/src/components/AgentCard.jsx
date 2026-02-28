const STATUS_CONFIG = {
  idle: { color: 'bg-green-500', text: '空闲', textColor: 'text-green-600' },
  running: { color: 'bg-yellow-500', text: '执行中', textColor: 'text-yellow-600' },
  completed: { color: 'bg-blue-500', text: '已完成', textColor: 'text-blue-600' },
  error: { color: 'bg-red-500', text: '错误', textColor: 'text-red-600' },
  offline: { color: 'bg-gray-400', text: '离线', textColor: 'text-gray-500' },
}

function AgentCard({ id, name, icon, status, currentTask, progress }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <StatusBadge config={config} />
        </div>
        <h3 className="text-white font-bold text-lg mt-2">{name}</h3>
        <p className="text-blue-100 text-xs mt-1">ID: {id}</p>
      </div>
      
      {/* 内容 */}
      <div className="p-4">
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">当前任务</p>
          <p className="text-sm font-medium text-gray-800 truncate">{currentTask}</p>
        </div>
        
        {/* 进度条 */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>进度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${config.color}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* 状态时间 */}
        <p className="text-xs text-gray-400 mt-3">
          状态: {config.text}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ config }) {
  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-white text-xs`}>
      <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
    </span>
  )
}

export default AgentCard
