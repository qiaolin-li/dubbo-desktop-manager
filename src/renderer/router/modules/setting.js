/**
 * 系统设置
 */
 import layout from '@/renderer/components/layout/';

 export default [
   // 默认页面
   {
     path: '/setting',
     component: layout,
     children: [
       {
         name: 'setting',
         path: '/setting',
         component: () => import('@/renderer/views/settings/index.vue'),
         meta: {
           title: '系统',
           icon: 'el-icon-setting',
         },
       },
     ],
   },
 ];
 