<template>
    <el-tree class="notSelect interfaceTree" ref="tree" :data="data" :props="props" :node-key="nodeKey" 
        :default-expanded-keys="defaultExpandIds"
        highlight-curren :accordion="true" :expand-on-click-node="false" 
        @node-click="handleNodeClick" @node-expand="$emit('node-expand', $event)"
        @node-collapse="$emit('node-collapse', $event)" @node-contextmenu="$emit('node-contextmenu', $event)">

        <div class="custom-tree-icon" slot-scope="{ node, data }">
            <span>{{ data[props.label] }}</span>
        </div>

    </el-tree>
  </template>
  
  <script>
  import lodash from 'lodash';
  
  
  const clickCountMap = new Map();
  
  export default {
    components: {
    },
    data() {
      return {};
    },
    props: {
        props: Object,
        data: Array,
        nodeKey: String
    },
    methods: {
      handleNodeClick(data, $event) {
        if (!data ){
          return;
        }
        
        // 叶子节点
        if(!data[this.props.children] || !data[this.props.children].length){ 
          setTimeout(() => {
            clickCountMap.delete(data);
          }, 300);
          
          const oldClickCount = clickCountMap.get(data) || 1;
          if(oldClickCount > 1){
            if(this.defaultExpandIds.find(item => item === data)) {
              this.handleNodeCollapse(data)
            } else {
              this.handleNodeExpand(data)
            }
          } else {
            clickCountMap.set(data, oldClickCount + 1);
          }
          return;
        }

        this.$emit('node-click', $event)
      },
      // 树节点展开
      handleNodeExpand(data) {
        // 保存当前展开的节点
        if (!this.defaultExpandIds.find(item => item === data.nodeId)) { 
          this.defaultExpandIds.push(data.nodeId)
        }
      },
      // 树节点关闭
      handleNodeCollapse(data) {
        // 删除当前关闭的节点
        this.$refs.tree.store._getAllNodes().forEach(item => {
          if(item.data.nodeId === data.nodeId){
            item.expanded = false
          }
        });

        lodash.remove(this.defaultExpandIds, item =>  item.startsWith(data.nodeId));
    },

    // 删除树子节点
    removeChildrenIds(data) {
      if (!data[this.props.children]) {
        return;
      }
      data[this.props.children].forEach((item) =>{
        const index = this.defaultExpandIds.indexOf(item.nodeId)
        if (index > 0) {
          this.defaultExpandIds.splice(index, 1)
        }
        this.removeChildrenIds(item)
      })
    }
    },
  };
  </script>
  
  <style  >
  
  .interfaceContainer {
    height: 100%;
    min-width: max-content;
    display: flex;
    flex-direction: column;
  }
  
  .searchTool {
    display: flex;
  }
  
  .interfaceTree {
    height: 100%;
    overflow: auto;
  }
  
  .custom-tree-icon {
    position: relative;
  }
  
  .el-icon-folder {
    margin-right: 5px;
    color: rgb(136, 241, 124);
    border-radius: 50%;
  }
  .el-input.is-active .el-input__inner, .el-input__inner:focus {
      border-color: rgb(62, 177, 78) !important;
      outline: 0;
  }
  
  /* 未展开 */
  .el-tree .el-icon-caret-right:before{   
    content: "\e6e0";
    font-size: 16px;
    color: #389e0d;
  }
  
  .el-tree .is-leaf::before {
      content: "S";
      /* margin-left: 5px; */
      /* font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; */
      font-family: Georgia, serif;
      color: #389e0d;
      border: 1px solid #389e0d ;
      width: 12px;
      height: 12px;
      text-align: center;
      font-size: 12px;
      border-radius: 50%;
      display: inline-block;
  }
  </style>