export default [
  // 默认页面
  {
    name: 'setting',
    path: '/setting',
    component: () => import('@/renderer/views/settings/index.vue'),
    meta: {
      title: '系统',
      icon: 'el-icon-setting',
    },
  },
];