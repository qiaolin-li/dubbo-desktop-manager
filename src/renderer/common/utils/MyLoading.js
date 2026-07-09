import { Loading } from 'element-ui';

const STYLE_ID = 'ddm-theme-loading-style';

function ensureLoadingStyle() {
    if (document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.app-loading-mask {
    background: var(--app-theme-mask, rgba(0, 0, 0, 0.2)) !important;
}

.app-loading-mask .el-loading-spinner {
    left: 50%;
    width: 164px;
    margin-top: -58px;
    margin-left: 0;
    padding: 16px 16px 14px;
    border: 1px solid var(--app-theme-border, #d0d7de);
    border-radius: 10px;
    background: var(--app-theme-surface, #ffffff);
    box-shadow: var(--app-theme-shadow, 0 12px 28px rgba(31, 35, 40, 0.12));
    box-sizing: border-box;
    transform: translateX(-50%);
}

.app-loading-mask .el-loading-spinner .circular {
    width: 24px !important;
    height: 24px !important;
}

.app-loading-mask .el-loading-spinner .path {
    stroke: var(--app-theme-accent, #409eff) !important;
}

.app-loading-mask .el-loading-spinner i {
    color: var(--app-theme-accent, #409eff) !important;
    font-size: 22px !important;
}

.app-loading-mask .el-loading-text {
    margin: 10px 0 0;
    color: var(--app-theme-text-primary, #303133) !important;
    font-size: 13px;
    line-height: 1.4;
}

.app-loading-mask__cancel {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    min-width: 84px;
    height: 30px;
    padding: 0 14px;
    border: 1px solid var(--app-theme-button-border, #d0d7de);
    border-radius: 6px;
    background: var(--app-theme-button-bg, #f6f8fa);
    color: var(--app-theme-button-text, #24292f);
    cursor: pointer;
    outline: none;
    box-sizing: border-box;
    transition: background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease;
}

.app-loading-mask__cancel:hover {
    background: var(--app-theme-button-hover-bg, #f3f4f6);
    border-color: var(--app-theme-button-hover-border, #afb8c1);
    color: var(--app-theme-button-hover-text, #24292f);
}
`;
    document.head.appendChild(style);
}

function service(target, text, cancelText, cancelFunction) {
    ensureLoadingStyle();

    const loadingInstance = Loading.service({
        target,
        text,
        background: 'var(--app-theme-mask, rgba(0, 0, 0, 0.2))',
        customClass: 'app-loading-mask',
    });

    if (cancelText) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = cancelText;
        button.className = 'app-loading-mask__cancel';
        button.addEventListener('click', () => {
            cancelFunction && cancelFunction();
        });
        loadingInstance.$el.firstElementChild.appendChild(button);
    }

    return loadingInstance;
}

export default {
    service
};
