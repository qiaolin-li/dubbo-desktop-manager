import { useLayoutStore }       from '@/renderer/store/modules/layout.js';
import checkUpdate              from './UpdateChecker';


/**
 * status bar item
 */
class AppStatusbarItem {

    /** 主键 */
    #id;

    /** 位置，left or right */
    #alignment;

    /** 来自哪个模块 */
    #module = 'builtin';

    /** 排序 */
    order;


    /** 显示的图标 */
    icon = '';
    
    /** 显示的文本 */
    text = '';
    
    /** 鼠标放上去时弹出的组件 */
    popoverComponent = null;

    /** 给弹出来的组件的参数 */
    popoverParams = {}

    /** 弹出框的高度, 
     * 为什么不用自适应呢？
     *  因为如果组件中有延迟加载的组件（比如说图片）就会导致弹出来的框被撑大，导致popover越过底部，不好看 
     **/
    popoverHeight = null;

    /** 鼠标放上去时的提示，这个配置与 #popoverComponent 冲突，优先生效 #popoverComponent */
    tooltip = '';

    /** 是否为警告效果  */
    warning = false;

    /** 是否禁用效果，不可点击 */
    disabled = false;

    /** 是否可见 */
    visible = false;

    /** 被点击时回调函数 */
    click = null

    constructor(id, alignment, order = 0, options = {}) {
        this.#id = id;
        this.#alignment = alignment === 'left' ? 'left' : 'right';
        this.order = Number.isFinite(order) ? order : 0;
        // Object.assign(this, options);
        this.#module = options.module || 'builtin';
    }

    get id() {
        return this.#id;
    }
    get alignment() {
        return this.#alignment;
    }
    get module() {
        return this.#module;
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

}


class StatusBarManager {
	
    #statusbarEntryMap = new Map();

	init() {
        checkUpdate.run(this);
	}

    
    /**
     * 创建一个 statusbar 显示
     * @param {*} id 
     * @param {*} alignment 
     * @param {*} order 
     * @param {*} options 
     * @returns 
     */
	addStatusbarItem(alignment = "right", order = 0, options = {}) {
		if (!["left", "right"].includes(alignment)) {
			throw new TypeError("statusbar item alignment only support left or right");
		}

		const statusbarItem = new AppStatusbarItem(crypto.randomUUID(), alignment, order, {
			...options,
		});


        statusbarItem.dispose = () => {
            useLayoutStore().removeStatusbar(statusbarItem);
        };

        useLayoutStore().addStatusbar(statusbarItem);
		return statusbarItem;
	}

    getStatusbarItem(id) {
        const statusbarEntry = this.#statusbarEntryMap.get(id);
        return statusbarEntry instanceof AppStatusbarItem ? statusbarEntry : null;
    }

}





export { AppStatusbarItem };
export default new StatusBarManager();
