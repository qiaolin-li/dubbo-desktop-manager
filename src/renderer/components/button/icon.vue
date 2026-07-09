<template>
    <span class="app-icon" :style="iconStyle" v-on="$listeners">
        <i v-if="iconClass" :class="iconClass" ></i>
        <img v-else-if="imageSrc" :src="imageSrc" :alt="alt" >
        <template v-else>
            <slot></slot>
        </template>
    </span>
</template>

<script>

export default {
    name: 'AppIcon',
    props: {
        iconClass: {
            type: String,
            default: '',
        },
        imageSrc: {
            type: String,
            default: '',
        },
        alt: {
            type: String,
            default: '',
        },
        size: {
            type: [String, Number],
            default: 14,
        },
    },
    data() {
        return {
        };
    },
    computed: {
        iconStyle() {
            if (!this.size) {
                return {};
            }

            const size = typeof this.size === 'number' ? `${this.size}px` : this.size;
            return {
                '--app-icon-size': size,
            };
        },
    },
};
</script>

<style scoped>

.app-icon {
    width: var(--app-icon-size);
    height: var(--app-icon-size);
    display: flex;
    align-content: center;
    justify-content: center;
}

.app-icon i {
    font-size: calc(var(--app-icon-size) * 1.15);
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translateY(0.5px);
}

.app-icon :deep(svg) {
    width: 100% !important;
    height: 100% !important;

    max-width: 100%;
    max-height: 100%;

    fill: currentColor;

    display: block;
}

.app-icon img {
    width: 100%;
    height: 100%;

    object-fit: contain;
}


</style>
