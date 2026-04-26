# Render Home Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将智能渲染首页调整为参考图的米白卡片风格，同时保留现有上传、点数、生成、结果与历史能力。

**Architecture:** 只改 `pages/cloudFunction/cloudFunction.vue` 的视觉层和轻量视图模型，不改云函数、不改上传链路、不改生成链路。新增一个小型首页视图模型辅助函数，用测试先锁定首页文案和主按钮状态，再把模板与样式切换到新布局。

**Tech Stack:** uni-app Vue 单文件组件、uniCloud、Node `node:test`

---

## File Structure

- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\cloudFunction\cloudFunction.vue`
  - 责任：首页模板、布局、样式重做，逻辑仅做最小接线
- Modify: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\page-models.js`
  - 责任：新增首页视图模型辅助函数，供测试约束文案映射
- Modify: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\frontend\page-models.js`
  - 责任：同步前端 ESM 版本的首页视图模型辅助函数
- Modify: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-page-models.test.js`
  - 责任：先写失败测试，再验证首页状态映射

## Task 1: 锁定首页状态文案

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-page-models.test.js`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\page-models.js`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\frontend\page-models.js`

- [ ] **Step 1: 写失败测试**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 补最小实现**
- [ ] **Step 4: 运行测试确认通过**

## Task 2: 重做智能渲染首页视觉

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\cloudFunction\cloudFunction.vue`

- [ ] **Step 1: 将顶部信息区改成原型卡片层级**
- [ ] **Step 2: 将上传区改成双卡片中间箭头布局**
- [ ] **Step 3: 将参数区改成风格设置表单行**
- [ ] **Step 4: 将主按钮、充值提示、结果与历史区改成新版视觉**
- [ ] **Step 5: 自检移动端布局与现有交互是否保持可用**
