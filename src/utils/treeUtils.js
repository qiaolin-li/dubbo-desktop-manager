
function Node(label, serviceName = null) {
    this.label = label;
    this.serviceName = serviceName;
    this.childrenMap = new Map();
    this.children = [];
}


Node.prototype.addNode = function (serviceName, packages, index = 0) {
    if (index >= packages.length) {
        return;
    }

    let pkg = packages[index];
    // 最后一个目录，是接口名
    // if (packages.length - 1 == index) {
    //     let node = new Node(pkg, serviceName);
    //     this.childrenMap.set(pkg, node);
    //     this.children.push(node);
    //     return;
    // }

    // // 目录不够，不合并
    // if (packages.length <= index + 3) {
        let node = this.childrenMap.get(pkg);
        if (!node) {
            node = new Node(pkg, serviceName);
            this.childrenMap.set(pkg, node);
            this.children.push(node);
        }

        node.addNode(serviceName, packages, index + 1);
        return;
    // }

    // let newPkg = "";
    // for (let i = index; i < index + 3; i++) {
    //     newPkg += packages[i];
    //     let topNode = this.childrenMap.get(newPkg);
    //     if (topNode) {
    //         topNode.addNode(serviceName, packages, i);
    //         return;
    //     }

    //     if (i < index + 3 - 1) {
    //         newPkg += ".";
    //     }
    // }

    // // 如果都没命中，那么创建一个
    // let node = new Node(newPkg);
    // this.childrenMap.set(newPkg, node);
    // this.children.push(node);
    // node.addNode(serviceName, packages, index + 3);
};



function createTree(allInterfaceList, split, keyword) {

    let topNode = new Node("top");
    let filtedInterface = allInterfaceList;
    if (keyword) {
        keyword = keyword.toLowerCase();
        filtedInterface = allInterfaceList.filter((i) => i.name.toLowerCase().indexOf(keyword) !== -1);
    }
    
    for (let i = 0; i < filtedInterface.length; i++) {
        let interfaceInfo = filtedInterface[i];
    
        // 防止不存在
        if (!interfaceInfo.name) {
            continue;
        }
        let packages = interfaceInfo.name.split(split);
        // 防止不存在
        if (!packages) {
            continue;
        }
    
        topNode.addNode(interfaceInfo.serviceName, packages);
    }
    // return prefixOptimization(optimizationTree(topNode.children));
    return mergeOptimization(topNode.children);
}

function prefixOptimization(children, parent = "", level = 0){

    let newChildren = [];
    for(let i =0; i<children.length; i++){
        let data = children[i];

        if(data.children){
            data.children = prefixOptimization(data.children, data.label, level + 1);
        }
        
        for(let j = 0; j < data.children.length; j++){
            let childrenData = data.children[j];
            let newLabel = parent + "/" + childrenData.label;
            newChildren.push({
                label: newLabel,
                serviceName : childrenData.serviceName,
                children: data.children[j].children 
            })
        }

    }

    return newChildren;
}


// 合并只有一个子节点的包
function mergeOptimization(children){

    for(let i =0; i<children.length; i++){
        let data = children[i];

        if(!data.children || data.children.length == 0){
            continue;
        }

        mergeOptimization(data.children);

        if(data.children.length == 1){
            data.label = data.label + "." + data.children[0].label;
            data.serviceName = data.children[0].serviceName;
            data.children = data.children[0].children;
        }


    }

    return children;
}

function optimizationTree(children){
    for(let i = 0; i < children.length; i++){
        let node = children[i];
        if(!node || !node.children){
            return;
        }
        optimizationTree(node.children);

        if(node.children.length == 1){
            let data = node.children[0];
            node.label = node.label + "/" + data.label;
            node.children = data.children;
        }

    }

    return children;
}


export default {
    createTree,
    Node
}