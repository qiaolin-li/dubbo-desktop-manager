import index from "@/renderer/views/index.vue";
import layout from '@/renderer/components/layout/';

export default [{
    path: '/',
    component: layout,
    children: [{
        path: '/',
        name: 'index',
        component: index,
        meta: {
            title: '系统设置',
            icon: 'el-icon-setting',
        },
    }, ],
}, ]