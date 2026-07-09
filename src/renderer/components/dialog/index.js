import Vue                      from 'vue'
import i18n                     from '@/renderer/common/i18n'
import appSimpleDialog          from '@/renderer/components/dialog/simple-dialog.vue';

class DialogHelper {

    getDefaultCancelButton() {
        return { 
            text: i18n.t("base.cancel"), 
            order: 200,
            click (done){
                done(null, "cancel");
            },
        };
    };
    
    openSimpleDialog(dialogInfo) {
        const { showConfirmButton = true, confirmText, onConfirm, showCancelButton = false, cancelText, onCancel } = dialogInfo;

        const actions = [];

        if(showConfirmButton ?? true) {
            actions.push({ 
                text: confirmText ?? i18n.t("base.confirm"), 
                type: 'primary',
                order: 100,
                click(done, dialog, component) {
                    if (onConfirm) {
                        onConfirm((data) => done(data, "confirm"), dialog, component);
                    } else {
                        done(null, "confirm");
                    }
                },
            });
        }

        
        if(showCancelButton ?? true) {
            actions.push({ 
                text: cancelText ?? i18n.t("base.cancel"), 
                order: 200,
                click (done, dialog, component){
                    if (onCancel) {
                        onCancel((data) => done(data, "cancel"), dialog, component);
                    } else {
                        done(null, "cancel");
                    }
                },
            });
        }

        dialogInfo.actions = actions;

        return this.openDialog(dialogInfo)
    }


    /**
     * 打开一个 dialog 框，里面放置用户的组件
     * @param {object} dialogInfo
     */
    openDialog(dialogInfo) {
        const DialogConstructor = Vue.extend(appSimpleDialog);
        const instance = new DialogConstructor({
            i18n,
            propsData: {
                ...dialogInfo,
            },
        });

        // 创建一个新的元素来挂载对话框
        const dialogContainer = document.createElement("div");

        // 将对话框挂载到新创建的元素上
        instance.$mount(dialogContainer);

        // 将新创建的元素添加到 body
        document.body.appendChild(instance.$el);

        // 打开 Dialog
        instance.show();
        return instance.createDialogHandle();
    }
}

export default new DialogHelper();
