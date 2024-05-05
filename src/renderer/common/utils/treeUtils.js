import lodash from 'lodash';

function Node(id, label, serviceName = null) {
    this.id = id;
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
    // // 目录不够，不合并
    // if (packages.length <= index + 3) {
    let node = this.childrenMap.get(pkg);
    if (!node) {
        node = new Node(lodash.join(lodash.slice(packages, 0, index + 1), "."), pkg, serviceName);
        this.childrenMap.set(pkg, node);
        this.children.push(node);
    }

    node.addNode(serviceName, packages, index + 1);
};

function createTree(filtedInterface, split) {

    let topNode = new Node("top");

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

// 合并只有一个子节点的包
function mergeOptimization(children) {

    for (let i = 0; i < children.length; i++) {
        let data = children[i];

        if (!data.children || data.children.length == 0) {
            continue;
        }

        mergeOptimization(data.children);

        if (data.children.length == 1) {
            data.label = data.label + "." + data.children[0].label;
            data.serviceName = data.children[0].serviceName;
            data.children = data.children[0].children;
        }
    }

    return children;
}

export default {
    createTree,
    Node
}