# AI Curtain Product Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `aiCurtain` 从 uniCloud 示例工程重构为面向客户的四导航窗帘 AI 小程序，完整落地样板间、智能渲染、我的作品、个人中心、点数账户与微信支付购买点数。

**Architecture:** 前端按四个业务导航和若干二级页重组，智能渲染作为唯一生成入口；云端按目录、渲染、作品、点数、支付、人工补点申请拆分；现有 `curtain-preview-*` 云函数保留并升级为产品链路中的渲染核心。所有点数与订单状态以数据库为准，生成成功后再扣点。

**Tech Stack:** uni-app Vue 2 单文件组件、uniCloud 阿里云云函数、uniCloud 云数据库与云存储、uni-id-pages 登录能力、微信小程序支付、Node `node:test`

---

## Scope Check

规格覆盖四个前台导航、样板间目录、作品管理、点数体系、支付订单和人工补点申请，虽然是多模块组合，但这些模块共享一条清晰主链路：`样板间/上传 -> 生成 -> 作品 -> 点数/支付`。可作为单一产品重构计划执行，但必须拆成多任务、逐阶段验收，不要一次性全改。

本仓库当前仍含大量示例页面和示例云函数。执行本计划时：

- 不要运行 `vue-tsc`、`lint`、`npm run build`
- 不要回退 `unpackage/dist` 生成产物，除非用户明确要求
- 所有新增或修改文件保持 UTF-8 无 BOM

## File Structure

### Frontend Pages

- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages.json`
  - 责任：重写页面注册和 tabBar，只保留四个业务导航与必要的二级业务页、登录页。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\render\index.vue`
  - 责任：智能渲染首页，承接上传、点数展示、参数设置、立即生成。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\render\result.vue`
  - 责任：渲染结果详情与前后对比、重生成、保存、分享。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\showroom\index.vue`
  - 责任：经典样板间分类与列表，点击后回填到智能渲染页。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\works\index.vue`
  - 责任：我的作品列表、状态筛选、删除、重生成、预览。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\index.vue`
  - 责任：个人中心首页，展示账户摘要与导航入口。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\points.vue`
  - 责任：点数流水页。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\orders.vue`
  - 责任：支付订单页。
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\recharge.vue`
  - 责任：套餐购买与人工补点申请页。

### Frontend Shared Modules

- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\render-session.js`
  - 责任：承载样板间回填、重生成回填、默认参数合并。
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\default-scenes.js`
  - 责任：样板间默认兜底数据。
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\default-packages.js`
  - 责任：套餐默认兜底数据。
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\point-rules.js`
  - 责任：前端点数文案、扣点说明、状态映射。

### Cloud Database Schemas

- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_scene_category.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_scene_template.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_render_record.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_account.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_flow.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_package.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_pay_order.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_manual_recharge_apply.schema.json`

### Cloud Functions

- Modify: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-preview-create-upload-ticket\index.js`
  - 责任：继续生成上传凭证，但适配产品化命名与渲染记录来源。
- Modify: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-preview-generate\index.js`
  - 责任：迁移到 `curtain_render_record`，接入成功扣点逻辑。
- Modify: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-preview-history\index.js`
  - 责任：升级为作品列表数据源。
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-scene-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-scene-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-summary\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-summary\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-package-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-package-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-work-delete\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-work-delete\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-create\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-create\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-notify\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-notify\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-manual-recharge-apply-create\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-manual-recharge-apply-create\package.json`

### Tests

- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\render-session.test.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-catalog-cloud.test.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-account-cloud.test.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-render-points.test.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-payment-cloud.test.js`

---

## Task 1: 重组导航骨架与共享会话模块

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\render\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\showroom\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\works\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\render-session.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\default-scenes.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\default-packages.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\render-session.test.js`

- [ ] **Step 1: 先为样板间回填会话写失败测试**

```js
const test = require('node:test')
const assert = require('node:assert/strict')

const {
	saveSceneSelection,
	readSceneSelection,
	clearSceneSelection,
	buildRenderDraft
} = require('../common/curtain-app/render-session')

test('buildRenderDraft merges scene defaults with render form defaults', () => {
	const draft = buildRenderDraft({
		sceneTemplateId: 'scene-1',
		sceneTitle: '法式客厅 30㎡',
		backgroundImage: 'cloud://space/scene-1.jpg',
		defaultConfig: {
			pleatMultiple: '2.0',
			headStyle: 'simple',
			includeSheer: true
		}
	})

	assert.equal(draft.sceneTemplateId, 'scene-1')
	assert.equal(draft.sceneTitle, '法式客厅 30㎡')
	assert.equal(draft.config.pleatMultiple, '2.0')
	assert.equal(draft.config.headStyle, 'simple')
	assert.equal(draft.config.includeSheer, true)
})
```

- [ ] **Step 2: 运行测试确认当前失败**

Run: `node --test tests\render-session.test.js`
Expected: FAIL，提示 `Cannot find module '../common/curtain-app/render-session'`

- [ ] **Step 3: 写最小共享模块与默认兜底数据**

```js
const STORAGE_KEY = 'curtain-render-scene-selection'

function buildRenderDraft(scene = {}) {
	return {
		sceneTemplateId: scene.sceneTemplateId || '',
		sceneTitle: scene.sceneTitle || '',
		backgroundImage: scene.backgroundImage || '',
		config: {
			pleatMultiple: scene.defaultConfig?.pleatMultiple || '2.0',
			headStyle: scene.defaultConfig?.headStyle || 'simple',
			includeSheer: typeof scene.defaultConfig?.includeSheer === 'boolean' ? scene.defaultConfig.includeSheer : true
		}
	}
}

module.exports = {
	saveSceneSelection,
	readSceneSelection,
	clearSceneSelection,
	buildRenderDraft
}
```

```js
module.exports = [
	{
		_id: 'default-scene-french-living-01',
		categoryName: '客厅',
		title: '法式客厅 30㎡',
		coverUrl: '/static/mock/showroom/french-living-01.jpg',
		backgroundImage: '/static/mock/showroom/french-living-01.jpg',
		defaultConfig: {
			pleatMultiple: '2.0',
			headStyle: 'simple',
			includeSheer: true
		}
	}
]
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `node --test tests\render-session.test.js`
Expected: PASS

- [ ] **Step 5: 重写 `pages.json` 只保留四导航和必要二级页**

```json
{
  "pages": [
    {
      "path": "pages/render/index",
      "style": {
        "navigationBarTitleText": "智能渲染"
      }
    },
    {
      "path": "pages/showroom/index",
      "style": {
        "navigationBarTitleText": "经典样板间"
      }
    },
    {
      "path": "pages/works/index",
      "style": {
        "navigationBarTitleText": "我的作品"
      }
    },
    {
      "path": "pages/profile/index",
      "style": {
        "navigationBarTitleText": "个人中心"
      }
    },
    {
      "path": "pages/render/result",
      "style": {
        "navigationBarTitleText": "渲染效果"
      }
    },
    {
      "path": "pages/profile/points",
      "style": {
        "navigationBarTitleText": "点数流水"
      }
    },
    {
      "path": "pages/profile/orders",
      "style": {
        "navigationBarTitleText": "订单记录"
      }
    },
    {
      "path": "pages/profile/recharge",
      "style": {
        "navigationBarTitleText": "充值中心"
      }
    }
  ]
}
```

- [ ] **Step 6: 创建四个主页面壳子，先跑通导航结构**

```vue
<template>
	<view class="page">
		<view class="page-title">智能渲染</view>
	</view>
</template>

<script>
export default {
	name: 'RenderIndexPage'
}
</script>
```

```vue
<template>
	<view class="page">
		<view class="page-title">经典样板间</view>
	</view>
</template>

<script>
export default {
	name: 'ShowroomIndexPage'
}
</script>
```

```vue
<template>
	<view class="page">
		<view class="page-title">我的作品</view>
	</view>
</template>

<script>
export default {
	name: 'WorksIndexPage'
}
</script>
```

```vue
<template>
	<view class="page">
		<view class="page-title">个人中心</view>
	</view>
</template>

<script>
export default {
	name: 'ProfileIndexPage'
}
</script>
```

- [ ] **Step 7: 手工验证四导航是否取代原示例入口**

Run:

1. 在 HBuilderX 或微信开发者工具打开项目
2. 启动首页
3. 检查底部 tabBar

Expected:

1. 仅显示 `智能渲染`、`经典样板间`、`我的作品`、`个人中心`
2. 不再显示 `云对象`、`云存储`、`clientDB`、`schema2code`

- [ ] **Step 8: Commit**

```bash
git add pages.json pages/render pages/showroom pages/works pages/profile common/curtain-app tests/render-session.test.js
git commit -m "feat: scaffold curtain app business navigation"
```

## Task 2: 建立样板间目录与套餐目录能力

**Files:**
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_scene_category.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_scene_template.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_package.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-scene-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-scene-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-package-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-package-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-catalog-cloud.test.js`

- [ ] **Step 1: 先写失败测试，覆盖样板间云端读取与兜底套餐输出**

```js
test('scene list falls back to local defaults when database is empty', async () => {
	const result = await cloudFunction.main({
		categoryKey: 'all'
	})

	assert.equal(result.success, true)
	assert.equal(result.list.length > 0, true)
	assert.equal(result.list[0].title, '法式客厅 30㎡')
})

test('package list returns sorted active packages', async () => {
	const result = await packageFunction.main({})
	assert.equal(result.success, true)
	assert.deepEqual(result.list.map(item => item.title), ['体验包', '进阶包', '门店包'])
})
```

- [ ] **Step 2: 运行测试确认当前失败**

Run: `node --test tests\curtain-catalog-cloud.test.js`
Expected: FAIL，提示缺少 `curtain-scene-list` 或 `curtain-point-package-list`

- [ ] **Step 3: 创建 schema 与两个目录型云函数**

```js
exports.main = async (event) => {
	const categoryKey = String(event?.categoryKey || 'all').trim()
	const dbList = await collection.where(buildSceneFilter(categoryKey)).orderBy('sort', 'asc').get()
	const normalizedList = normalizeScenes(dbList.data || [])
	const finalList = normalizedList.length > 0 ? normalizedList : getDefaultScenes(categoryKey)

	return {
		success: true,
		list: finalList,
		source: normalizedList.length > 0 ? 'cloud' : 'default'
	}
}
```

```js
exports.main = async () => {
	const dbList = await collection.where({ status: true }).orderBy('sort', 'asc').get()
	const finalList = (dbList.data || []).length > 0 ? normalizePackages(dbList.data) : getDefaultPackages()
	return {
		success: true,
		list: finalList
	}
}
```

- [ ] **Step 4: 再跑测试确认目录能力通过**

Run: `node --test tests\curtain-catalog-cloud.test.js`
Expected: PASS

- [ ] **Step 5: 部署 schema 与目录云函数做冒烟验证**

Run:

1. 上传 `curtain_scene_category.schema.json`
2. 上传 `curtain_scene_template.schema.json`
3. 上传 `curtain_point_package.schema.json`
4. 运行 `curtain-scene-list`
5. 运行 `curtain-point-package-list`

Expected:

1. 当数据库为空时返回默认兜底数据
2. 当数据库有数据时返回云端目录

- [ ] **Step 6: Commit**

```bash
git add uniCloud-aliyun/database/curtain_scene_category.schema.json uniCloud-aliyun/database/curtain_scene_template.schema.json uniCloud-aliyun/database/curtain_point_package.schema.json uniCloud-aliyun/cloudfunctions/curtain-scene-list uniCloud-aliyun/cloudfunctions/curtain-point-package-list tests/curtain-catalog-cloud.test.js
git commit -m "feat: add curtain scene and package catalogs"
```

## Task 3: 建立点数账户、流水、人工补点申请能力

**Files:**
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_account.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_point_flow.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_manual_recharge_apply.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-summary\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-point-summary\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-manual-recharge-apply-create\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-manual-recharge-apply-create\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-account-cloud.test.js`

- [ ] **Step 1: 先为账户摘要和补点申请写失败测试**

```js
test('point summary creates zero-balance account for first-time user', async () => {
	const result = await pointSummary.main({ uniIdToken: 'token' })
	assert.equal(result.success, true)
	assert.equal(result.balance, 0)
})

test('manual recharge apply rejects empty contact', async () => {
	const result = await rechargeApply.main({ uniIdToken: 'token', contact: '', remark: '' })
	assert.equal(result.success, false)
	assert.equal(result.message, '请填写联系方式')
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests\curtain-account-cloud.test.js`
Expected: FAIL，提示缺少对应云函数

- [ ] **Step 3: 落地账户 schema、流水 schema 与补点申请 schema**

```json
{
  "bsonType": "object",
  "required": ["uid", "balance", "totalRecharge", "totalConsume", "status", "createTime", "updateTime"],
  "properties": {
    "uid": { "bsonType": "string" },
    "balance": { "bsonType": "int" },
    "totalRecharge": { "bsonType": "int" },
    "totalConsume": { "bsonType": "int" },
    "status": { "bsonType": "bool" }
  }
}
```

- [ ] **Step 4: 实现账户摘要与补点申请云函数**

```js
async function ensurePointAccount(uid) {
	const found = await accountCollection.where({ uid }).get()
	if ((found.data || []).length > 0) {
		return found.data[0]
	}
	await accountCollection.add({
		uid,
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0,
		status: true
	})
	return {
		uid,
		balance: 0,
		totalRecharge: 0,
		totalConsume: 0,
		status: true
	}
}
```

```js
exports.main = async (event) => {
	const contact = String(event?.contact || '').trim()
	if (!contact) {
		return { success: false, message: '请填写联系方式' }
	}
	await applyCollection.add({
		uid,
		contact,
		remark: String(event?.remark || '').trim(),
		status: 'pending'
	})
	return { success: true, message: '申请已提交' }
}
```

- [ ] **Step 5: 再跑测试确认账户基础能力通过**

Run: `node --test tests\curtain-account-cloud.test.js`
Expected: PASS

- [ ] **Step 6: 手工验证首次用户也能看到 0 点账户**

Run:

1. 新用户登录
2. 调用 `curtain-point-summary`
3. 提交一次补点申请

Expected:

1. 账户自动初始化为 0 点
2. 补点申请能落库为 `pending`

- [ ] **Step 7: Commit**

```bash
git add uniCloud-aliyun/database/curtain_point_account.schema.json uniCloud-aliyun/database/curtain_point_flow.schema.json uniCloud-aliyun/database/curtain_manual_recharge_apply.schema.json uniCloud-aliyun/cloudfunctions/curtain-point-summary uniCloud-aliyun/cloudfunctions/curtain-manual-recharge-apply-create tests/curtain-account-cloud.test.js
git commit -m "feat: add point summary and manual recharge apply"
```

## Task 4: 升级渲染链路为作品主链路并实现成功扣点

**Files:**
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_render_record.schema.json`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-preview-generate\index.js`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-preview-history\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-work-delete\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-work-delete\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-render-points.test.js`

- [ ] **Step 1: 先为“成功才扣点”写失败测试**

```js
test('render success writes consume flow and decrements point balance once', async () => {
	const result = await generate.main(validEvent)
	assert.equal(result.success, true)
	assert.equal(account.balance, 9)
	assert.equal(pointFlows[0].type, 'consume')
	assert.equal(pointFlows[0].bizType, 'render')
})

test('render failure does not decrement points', async () => {
	const result = await generate.main(failingEvent)
	assert.equal(result.success, false)
	assert.equal(account.balance, 10)
	assert.equal(pointFlows.length, 0)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests\curtain-render-points.test.js`
Expected: FAIL，提示当前 `curtain-preview-generate` 未写点数流水

- [ ] **Step 3: 新建 `curtain_render_record` schema，并将生成函数切换到该集合**

```js
const renderCollection = db.collection('curtain_render_record')

async function createRenderRecord(data) {
	return await renderCollection.add({
		uid: data.uid,
		sourceType: data.sceneTemplateId ? 'template' : 'upload',
		sceneTemplateId: data.sceneTemplateId || '',
		sceneTitle: data.sceneTitle || '',
		backgroundFileId: data.backgroundFileId,
		fabricFileId: data.textureFileId,
		prompt: data.prompt,
		config: data.config || {},
		pointsCost: 1,
		status: 'processing'
	})
}
```

- [ ] **Step 4: 在生成成功分支中扣点并写消费流水**

```js
async function consumePointsAfterRenderSuccess(uid, renderRecordId, amount) {
	const account = await ensurePointAccount(uid)
	if (account.balance < amount) {
		throw createError('点数不足，无法完成扣减', 'POINTS_NOT_ENOUGH')
	}
	const balanceAfter = account.balance - amount
	await accountCollection.doc(account._id).update({
		balance: balanceAfter,
		totalConsume: account.totalConsume + amount
	})
	await flowCollection.add({
		uid,
		type: 'consume',
		amount,
		balanceAfter,
		bizType: 'render',
		bizId: renderRecordId,
		remark: '窗帘智能渲染成功扣点'
	})
}
```

- [ ] **Step 5: 升级历史函数和删除作品函数**

```js
exports.main = async (event) => {
	const listResult = await renderCollection.where({ uid }).orderBy('createTime', 'desc').limit(pageSize).get()
	return {
		success: true,
		list: await refreshHistoryTempUrls(listResult.data || [])
	}
}
```

```js
exports.main = async (event) => {
	const recordId = String(event?.recordId || '').trim()
	await renderCollection.where({ _id: recordId, uid }).remove()
	return { success: true, message: '作品已删除' }
}
```

- [ ] **Step 6: 再跑测试确认“成功才扣点”通过**

Run: `node --test tests\curtain-render-points.test.js`
Expected: PASS

- [ ] **Step 7: 用真实云端流程验证“失败不扣点、成功才扣点”**

Run:

1. 准备余额 1 点的测试账号
2. 先触发一次失败生成
3. 再触发一次成功生成

Expected:

1. 失败后账户余额不变
2. 成功后余额减 1
3. 点数流水新增一条 `consume`

- [ ] **Step 8: Commit**

```bash
git add uniCloud-aliyun/database/curtain_render_record.schema.json uniCloud-aliyun/cloudfunctions/curtain-preview-generate uniCloud-aliyun/cloudfunctions/curtain-preview-history uniCloud-aliyun/cloudfunctions/curtain-work-delete tests/curtain-render-points.test.js
git commit -m "feat: add product render record and success-only point consume"
```

## Task 5: 落地支付订单、套餐购买与到账回调

**Files:**
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\database\curtain_pay_order.schema.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-create\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-create\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-notify\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-notify\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-list\index.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\uniCloud-aliyun\cloudfunctions\curtain-pay-order-list\package.json`
- Create: `D:\workfile\uniapp\simple\aiCurtain\tests\curtain-payment-cloud.test.js`

- [ ] **Step 1: 先写订单创建与回调幂等测试**

```js
test('create order stores package points and amount before payment', async () => {
	const result = await createOrder.main({ uniIdToken: 'token', packageId: 'pkg-1' })
	assert.equal(result.success, true)
	assert.equal(savedOrder.points, 10)
	assert.equal(savedOrder.amountFen, 990)
})

test('notify success updates order once and increments point balance once', async () => {
	await notify.main({ orderNo: 'order-1', tradeState: 'SUCCESS' })
	await notify.main({ orderNo: 'order-1', tradeState: 'SUCCESS' })
	assert.equal(account.balance, 10)
	assert.equal(rechargeFlows.length, 1)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: FAIL，提示缺少订单相关云函数

- [ ] **Step 3: 实现支付订单创建函数**

```js
exports.main = async (event) => {
	const pkg = await getActivePackage(event.packageId)
	const orderNo = buildOrderNo()
	await orderCollection.add({
		uid,
		packageId: pkg._id,
		orderNo,
		amountFen: pkg.priceFen,
		points: pkg.points + (pkg.bonusPoints || 0),
		status: 'init',
		payType: 'wxpay'
	})
	return {
		success: true,
		orderNo,
		paymentParams: await createWechatPayParams(orderNo, pkg.priceFen)
	}
}
```

- [ ] **Step 4: 实现回调函数，支付成功后加点并写充值流水**

```js
async function markOrderPaid(order) {
	if (order.status === 'success') {
		return { success: true, skipped: true }
	}
	const account = await ensurePointAccount(order.uid)
	const rechargeAmount = order.points
	const balanceAfter = account.balance + rechargeAmount

	await orderCollection.doc(order._id).update({
		status: 'success',
		payTime: new Date()
	})
	await accountCollection.doc(account._id).update({
		balance: balanceAfter,
		totalRecharge: account.totalRecharge + rechargeAmount
	})
	await flowCollection.add({
		uid: order.uid,
		type: 'recharge',
		amount: rechargeAmount,
		balanceAfter,
		bizType: 'order',
		bizId: order.orderNo,
		remark: '套餐支付成功充值点数'
	})
}
```

- [ ] **Step 5: 再跑测试确认订单与回调通过**

Run: `node --test tests\curtain-payment-cloud.test.js`
Expected: PASS

- [ ] **Step 6: 在微信开发者工具联调支付前置链路**

Run:

1. 打开充值页
2. 选择套餐
3. 调用 `curtain-pay-order-create`

Expected:

1. 订单能够写入 `curtain_pay_order`
2. 前端拿到 `paymentParams`
3. 未支付前余额不变化

- [ ] **Step 7: Commit**

```bash
git add uniCloud-aliyun/database/curtain_pay_order.schema.json uniCloud-aliyun/cloudfunctions/curtain-pay-order-create uniCloud-aliyun/cloudfunctions/curtain-pay-order-notify uniCloud-aliyun/cloudfunctions/curtain-pay-order-list tests/curtain-payment-cloud.test.js
git commit -m "feat: add curtain point purchase order flow"
```

## Task 6: 完成智能渲染、经典样板间与结果页

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\render\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\render\result.vue`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\showroom\index.vue`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\render-session.js`
- Create: `D:\workfile\uniapp\simple\aiCurtain\common\curtain-app\point-rules.js`

- [ ] **Step 1: 先扩展共享模块测试，覆盖样板间回填和点数文案**

```js
test('saveSceneSelection persists selected showroom scene for render page', () => {
	saveSceneSelection({
		sceneTemplateId: 'scene-1',
		sceneTitle: '法式客厅 30㎡'
	})
	assert.equal(readSceneSelection().sceneTemplateId, 'scene-1')
})
```

- [ ] **Step 2: 运行测试确认当前失败**

Run: `node --test tests\render-session.test.js`
Expected: FAIL，提示缺少存取实现

- [ ] **Step 3: 完善样板间列表页，接 `curtain-scene-list` 并在点击时回填**

```js
async handleSelectScene(scene) {
	saveSceneSelection({
		sceneTemplateId: scene._id,
		sceneTitle: scene.title,
		backgroundImage: scene.backgroundUrl,
		defaultConfig: scene.defaultConfig || {}
	})
	uni.switchTab({
		url: '/pages/render/index'
	})
}
```

- [ ] **Step 4: 完善智能渲染页，接点数摘要、上传、生成与回填逻辑**

```js
onShow() {
	const scene = readSceneSelection()
	if (scene.sceneTemplateId) {
		const draft = buildRenderDraft(scene)
		this.form.sceneTemplateId = draft.sceneTemplateId
		this.form.sceneTitle = draft.sceneTitle
		this.form.backgroundUrl = draft.backgroundImage
		this.form.config = draft.config
		clearSceneSelection()
	}
	this.loadPointSummary()
}
```

```js
async submitGenerate() {
	const summary = await this.loadPointSummary()
	if (summary.balance < 1) {
		uni.navigateTo({ url: '/pages/profile/recharge' })
		return
	}
	const res = await uniCloud.callFunction({
		name: 'curtain-preview-generate',
		data: buildGeneratePayload(this.form)
	})
}
```

- [ ] **Step 5: 新建结果页，承接对比预览、重生成、保存、分享**

```vue
<template>
	<view class="result-page">
		<image :src="result.resultUrl" mode="widthFix" class="result-image" />
		<button @click="handleRegenerate">重新生成</button>
		<button @click="handleSave">保存到本地</button>
		<button open-type="share">一键分享</button>
	</view>
</template>
```

- [ ] **Step 6: 再跑共享模块测试并手工验证主链路**

Run:

1. `node --test tests\render-session.test.js`
2. 打开小程序
3. 从经典样板间点击一个场景
4. 跳转回智能渲染并生成

Expected:

1. 单测 PASS
2. 场景被回填到智能渲染页
3. 生成成功后跳转结果页

- [ ] **Step 7: Commit**

```bash
git add pages/render/index.vue pages/render/result.vue pages/showroom/index.vue common/curtain-app/render-session.js common/curtain-app/point-rules.js tests/render-session.test.js
git commit -m "feat: build render showroom and result flow"
```

## Task 7: 完成我的作品与个人中心相关页面

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\works\index.vue`
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\index.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\points.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\orders.vue`
- Create: `D:\workfile\uniapp\simple\aiCurtain\pages\profile\recharge.vue`

- [ ] **Step 1: 用已完成的云函数接口整理页面数据结构**

```js
data() {
	return {
		statusTab: 'all',
		list: [],
		loading: false
	}
}
```

```js
data() {
	return {
		summary: {
			balance: 0,
			totalRecharge: 0,
			totalConsume: 0
		},
		packages: [],
		flows: [],
		orders: []
	}
}
```

- [ ] **Step 2: 实现我的作品页的筛选、删除、重生成、预览**

```js
async loadWorks() {
	const res = await uniCloud.callFunction({
		name: 'curtain-preview-history',
		data: { pageNo: 1, pageSize: 20, status: this.statusTab }
	})
	this.list = (res.result?.list || []).filter(item => this.statusTab === 'all' ? true : item.status === this.statusTab)
}
```

```js
async handleDelete(recordId) {
	await uniCloud.callFunction({
		name: 'curtain-work-delete',
		data: { recordId }
	})
	await this.loadWorks()
}
```

- [ ] **Step 3: 实现个人中心首页和点数/订单/充值页**

```js
async onShow() {
	const res = await uniCloud.callFunction({
		name: 'curtain-point-summary'
	})
	this.summary = res.result || this.summary
}
```

```js
async handleBuyPackage(pkg) {
	const res = await uniCloud.callFunction({
		name: 'curtain-pay-order-create',
		data: { packageId: pkg._id }
	})
	await uni.requestPayment({
		provider: 'wxpay',
		...res.result.paymentParams
	})
}
```

```js
async submitManualApply() {
	await uniCloud.callFunction({
		name: 'curtain-manual-recharge-apply-create',
		data: {
			contact: this.form.contact,
			remark: this.form.remark
		}
	})
}
```

- [ ] **Step 4: 手工验证作品和账户页**

Run:

1. 打开 `我的作品`
2. 切换状态筛选
3. 删除一条作品
4. 进入个人中心查看余额
5. 打开充值页查看套餐和补点申请

Expected:

1. 作品能按状态筛选
2. 删除后列表刷新
3. 个人中心展示真实余额
4. 套餐列表和补点申请可用

- [ ] **Step 5: Commit**

```bash
git add pages/works/index.vue pages/profile/index.vue pages/profile/points.vue pages/profile/orders.vue pages/profile/recharge.vue
git commit -m "feat: add works and profile experience"
```

## Task 8: 下线示例入口并完成最终回归

**Files:**
- Modify: `D:\workfile\uniapp\simple\aiCurtain\pages.json`
- Optionally Delete or leave unreferenced: `D:\workfile\uniapp\simple\aiCurtain\pages\cloudObject\cloudObject.vue`
- Optionally Delete or leave unreferenced: `D:\workfile\uniapp\simple\aiCurtain\pages\clientDB\**\*`
- Optionally Delete or leave unreferenced: `D:\workfile\uniapp\simple\aiCurtain\pages\storage\**\*`
- Optionally Delete or leave unreferenced: `D:\workfile\uniapp\simple\aiCurtain\pages\schema2code\**\*`
- Optionally Delete or leave unreferenced: `D:\workfile\uniapp\simple\aiCurtain\pages\validate-demo\**\*`

- [ ] **Step 1: 先从路由层彻底下线示例页面**

```json
{
  "tabBar": {
    "list": [
      { "pagePath": "pages/render/index", "text": "智能渲染" },
      { "pagePath": "pages/showroom/index", "text": "经典样板间" },
      { "pagePath": "pages/works/index", "text": "我的作品" },
      { "pagePath": "pages/profile/index", "text": "个人中心" }
    ]
  }
}
```

- [ ] **Step 2: 再清理不再引用的示例页文件**

```bash
git rm -r pages/cloudObject pages/clientDB pages/storage pages/schema2code pages/validate-demo pages/test pages/secure-network pages/user-info pages/cloudFunction
```

如果需要暂缓物理删除，则保留文件但不再出现在 `pages.json` 中。

- [ ] **Step 3: 运行所有 Node 回归测试**

Run:

1. `node --test tests\render-session.test.js`
2. `node --test tests\curtain-catalog-cloud.test.js`
3. `node --test tests\curtain-account-cloud.test.js`
4. `node --test tests\curtain-render-points.test.js`
5. `node --test tests\curtain-payment-cloud.test.js`
6. `node --test tests\curtain-preview-cloud.test.js`

Expected:

1. 全部 PASS
2. 无编码乱码
3. 不依赖 `vue-tsc`、`lint`、`npm run build`

- [ ] **Step 4: 做最终人工回归**

Run:

1. 启动小程序
2. 浏览经典样板间并回填到智能渲染
3. 上传空窗照和面料图生成
4. 验证成功扣点、失败不扣点
5. 查看我的作品
6. 查看点数流水
7. 下单购买套餐并验证到账
8. 提交人工补点申请

Expected:

1. 只看到四个业务导航
2. 主链路全部可用
3. 点数和订单状态一致

- [ ] **Step 5: Commit**

```bash
git add pages.json pages tests uniCloud-aliyun
git commit -m "feat: finish ai curtain product rebuild"
```

## Verification Checklist

- [ ] `pages.json` 仅保留四个业务导航与必要二级页
- [ ] 样板间云目录与默认兜底数据同时可用
- [ ] 智能渲染页可承接样板间回填
- [ ] 生成成功才扣点，失败不扣点
- [ ] 作品列表支持筛选、删除、预览、重生成
- [ ] 个人中心可展示真实余额
- [ ] 套餐购买流程可创建订单
- [ ] 支付成功后自动加点并生成充值流水
- [ ] 人工补点申请可提交并落库
- [ ] 不相关示例功能不再暴露给最终用户
- [ ] 全部测试使用 `node --test`，未运行 `vue-tsc`、`lint`、`npm run build`

## Risks & Mitigations

- 风险：支付下单依赖真实商户配置，开发环境无法完整走通
  - 缓解：先把订单创建、回调幂等和加点逻辑用 Node 回归测试固化，支付网关只做集成冒烟。
- 风险：项目删除示例页过早，可能误删仍被 `uni-id-pages` 或其他通用能力引用的文件
  - 缓解：先从 `pages.json` 下线入口，再做物理删除；删除前用 `rg` 检查引用。
- 风险：生成链路切换到 `curtain_render_record` 时，旧记录无法继续展示
  - 缓解：历史函数在过渡期兼容读取旧集合或做一次性迁移脚本。

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-26-ai-curtain-product-rebuild.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
