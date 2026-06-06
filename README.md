# 四胡换把滑音时值偏差训练系统

二人台戏班排练室专用的纯浏览器端四胡换把滑音时值训练工具。通过播放参考音频片段，让学员在换把滑音标记处按下空格键，系统实时检测按键时刻与参考时刻的偏差，帮助学员精准掌握四胡换把滑音的时值。

## ✨ 功能特性

- **实时偏差检测**：毫秒级精度检测按键时刻与参考时刻的偏差
- **三级评分系统**：
  - **Perfect**：偏差 ≤ 40ms
  - **Good**：偏差 ≤ 90ms
  - **Miss**：偏差 > 90ms
- **Combo 连击机制**：连续命中累计 Combo，连续 3 次 Miss 断 Combo
- **多维度统计**：
  - 当前 Combo 数与最高 Combo
  - 各把位命中率柱状图
  - 平均偏差值
  - Perfect/Good/Miss 统计
- **个人最佳记录**：自动保存并展示个人最佳成绩
- **内置示例片段**：附 2 首示例练习曲，含完整换把时刻表
- **动态音频生成**：使用 Web Audio API 实时合成训练音频，无需外部音频文件
- **中国传统美学设计**：深紫檀色 + 金色配色，思源宋体/黑体字体

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 即可使用。

### Docker 部署

```bash
# 构建镜像
docker build -t sihu-training .

# 运行容器
docker run -d -p 8080:80 --name sihu-training sihu-training
```

访问 `http://localhost:8080` 即可使用。

### 生产构建

```bash
npm run build
```

构建产物将生成在 `dist` 目录，可直接部署到任何静态文件服务器。

## 🎯 使用方法

1. 选择训练片段（内置 2 首示例）
2. 点击「开始训练」按钮
3. 等待 3 秒倒计时
4. 听到换把滑音时，按下 **空格键** 响应
5. 系统实时显示评分和偏差值
6. 训练结束后查看最终成绩和等级评定

## 📁 项目结构

```
project/
├── src/
│   ├── components/          # UI 组件
│   │   ├── ComboDisplay.tsx     # Combo 显示
│   │   ├── ControlButtons.tsx   # 控制按钮
│   │   ├── Countdown.tsx        # 倒计时
│   │   ├── FinalResult.tsx      # 最终结果
│   │   ├── ProgressBar.tsx      # 进度条
│   │   ├── RatingFeedback.tsx   # 评级反馈动画
│   │   └── StatsPanel.tsx       # 统计面板
│   ├── config/              # 配置文件
│   │   ├── constants.ts         # 常量（评分阈值等）
│   │   └── segments.ts          # 训练片段配置
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useGeneratedAudio.ts # 动态音频生成
│   │   └── useKeyboard.ts       # 键盘输入处理
│   ├── modules/             # 核心模块
│   │   ├── AudioGenerator.ts    # 音频生成器
│   │   ├── AudioPlayer.ts       # 音频播放器
│   │   ├── Storage.ts           # 本地存储
│   │   └── TrainingEngine.ts    # 训练引擎
│   ├── pages/               # 页面
│   │   └── Home.tsx             # 主页面
│   ├── store/               # 状态管理
│   │   └── useTrainingStore.ts  # Zustand Store
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── Dockerfile               # Docker 配置
├── nginx.conf               # Nginx 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
└── README.md                # 本文档
```

## 🎵 如何替换新片段

### 1. 准备数据

在 `src/config/segments.ts` 中添加新的训练片段配置：

```typescript
export const TRAINING_SEGMENTS: TrainingSegment[] = [
  // ... 现有片段
  {
    id: 'your-segment-id',           // 唯一标识
    name: '片段名称',                  // 显示名称
    description: '片段描述',           // 描述信息
    audioFile: '/audio/your-audio.mp3', // 音频文件路径（如使用动态生成可忽略）
    durationMs: 16000,                 // 总时长（毫秒）
    preCountDownMs: 3000,              // 开始前倒计时（毫秒）
    markers: [                         // 换把标记时刻表
      { timeMs: 1500, position: 1, label: '第一把位' },
      { timeMs: 3200, position: 2, label: '第二把位' },
      { timeMs: 4800, position: 3, label: '第三把位' },
      // ... 更多标记
    ],
  },
];
```

### 2. 配置说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 片段唯一标识符，建议使用英文 |
| `name` | `string` | 显示在下拉选择框中的名称 |
| `description` | `string` | 片段简介，显示在选择区下方 |
| `audioFile` | `string` | 音频文件路径。如使用动态音频生成功能，此路径会被覆盖 |
| `durationMs` | `number` | 音频总时长，单位：毫秒 |
| `preCountDownMs` | `number` | 开始训练前的倒计时时长，单位：毫秒 |
| `markers` | `PositionMarker[]` | 换把标记数组，按时间顺序排列 |

### 3. 换把标记格式

```typescript
interface PositionMarker {
  timeMs: number;      // 换把时刻（从音频开始计算的毫秒偏移）
  position: number;    // 把位号（1-4）
  label?: string;      // 可选：显示标签，如「第一把位」
}
```

### 4. 使用自定义音频文件

如果不使用动态音频生成功能，而是使用真实的音频文件：

1. 将音频文件（MP3/WAV 格式）放入 `public/audio/` 目录
2. 在片段配置中设置正确的 `audioFile` 路径，如 `/audio/your-audio.mp3`
3. 修改 `useGeneratedAudio` hook 或在 `Home.tsx` 中禁用动态生成

### 5. 修改评分规则

在 `src/config/constants.ts` 中调整评分阈值：

```typescript
export const RATING_THRESHOLDS: RatingThresholds = {
  PERFECT: 40,   // Perfect 最大偏差（毫秒）
  GOOD: 90,      // Good 最大偏差（毫秒）
};

export const COMBO_RULES: ComboRules = {
  MAX_CONSECUTIVE_MISS: 3,  // 连续多少次 Miss 断 Combo
};
```

## 🎹 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **状态管理**：Zustand
- **样式方案**：Tailwind CSS 3
- **音频处理**：Web Audio API
- **图标库**：Lucide React
- **容器化**：Docker + Nginx

## 📊 数据存储

个人最佳成绩存储在浏览器 `localStorage` 中，key 为 `siHuTraining_bestRecords`。

数据格式：
```typescript
interface BestRecord {
  segmentId: string;       // 片段 ID
  maxCombo: number;        // 最高连击
  accuracy: number;        // 命中率 (0-1)
  averageDeviation: number; // 平均偏差（毫秒）
  timestamp: number;       // 记录时间戳
}
```

## 🎨 设计风格

- **主色调**：深紫檀色 (#5C1A1A) —— 象征传统乐器的木质质感
- **点缀色**：金色 (#D4AF37) —— 象征民乐的优雅与华贵
- **字体**：思源宋体（标题）、思源黑体（正文）
- **布局**：居中对称，借鉴中国传统卷轴画构图
- **动效**：卷轴展开、粒子散射、脉冲提示等

## 📝 License

MIT License
