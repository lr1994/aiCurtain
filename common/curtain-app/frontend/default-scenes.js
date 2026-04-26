const scenes = [
	{
		_id: 'default-scene-french-living-01',
		categoryKey: 'living-room',
		categoryName: '客厅',
		title: '法式客厅 30㎡',
		coverUrl: '/static/mock/showroom/french-living-01.jpg',
		backgroundImage: '/static/mock/showroom/french-living-01.jpg',
		tags: ['法式', '客厅', '大落地窗'],
		defaultConfig: {
			pleatMultiple: '2.0',
			headStyle: 'simple',
			includeSheer: true
		}
	},
	{
		_id: 'default-scene-cream-bedroom-01',
		categoryKey: 'bedroom',
		categoryName: '卧室',
		title: '奶油风卧室 18㎡',
		coverUrl: '/static/mock/showroom/cream-bedroom-01.jpg',
		backgroundImage: '/static/mock/showroom/cream-bedroom-01.jpg',
		tags: ['奶油风', '卧室', '飘窗'],
		defaultConfig: {
			pleatMultiple: '1.8',
			headStyle: 'wave',
			includeSheer: true
		}
	},
	{
		_id: 'default-scene-modern-study-01',
		categoryKey: 'study',
		categoryName: '书房',
		title: '现代书房 12㎡',
		coverUrl: '/static/mock/showroom/modern-study-01.jpg',
		backgroundImage: '/static/mock/showroom/modern-study-01.jpg',
		tags: ['现代', '书房', '百叶窗位'],
		defaultConfig: {
			pleatMultiple: '2.2',
			headStyle: 'box',
			includeSheer: false
		}
	}
];

export default scenes;
