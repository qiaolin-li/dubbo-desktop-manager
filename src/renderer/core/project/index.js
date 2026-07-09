
class ProjectManager {

    /**
     * 项目配置新增/更新组件
     */
	#projectUpdateComponentList = [];
	getProjectUpdateComponentList = () => this.#projectUpdateComponentList.slice();

    /**
     * 项目管理页面，从首页点击已创建的项目会打开这里配置的组件
     */
    #projectPageComponentList = [];
    getProjectPageComponentList = () => this.#projectPageComponentList.slice();

    /**
     * 添加一个数据源更新组件，提供当前数据源的信息展示功能
     * @param {*} componentInfo
     */
    addProjectUpdateComponent(componentInfo) {
        this.#projectUpdateComponentList.push(componentInfo);
    }

    /**
     * 增加一个项目管理页面
     * @param {*} projectType 
     * @param {*} component 
     * @param {*} options 
     * @returns 
     */
    addProjectPageComponent(projectType, component, options = {}) {
        // 判断 component为vue组件对象
        if(!projectType || typeof component !== "object") {
            throw new Error("projectType, component are required");
        }

        const entry = {
            projectType: projectType,
            component,
            module: options.module ||"builtin"
        };

        const currentIndex = this.#projectPageComponentList.findIndex((item) => item.projectType === entry.projectType);
        if (currentIndex > -1) {
            this.#projectPageComponentList.splice(currentIndex, 1, entry);
            return;
        }

        this.#projectPageComponentList.push(entry);
    }


    /**
     * 获取当前项目的管理页面组件
     * @param {String} projectType 
     * @returns 
     */
    async getProjectPageComponent(projectType) {

        if(!projectType) {
            throw new  Error("projectType is required");
        }

        const projectPage = this.#projectPageComponentList.find(item => item.projectType === projectType);
        return projectPage?.component ?? null;
    }
}

export default new ProjectManager();