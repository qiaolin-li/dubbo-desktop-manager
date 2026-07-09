<template>
    <img src="../assets/icon.png" :width="width" :height="height" />
</template>

<script>
export default {
    name: "DdmIcon",
    props: {
        width: {
            type: Number,
            default: 40,
        },
        height: {
            type: Number,
            default: 40,
        }
    }
};
</script>

<style>
</style>
