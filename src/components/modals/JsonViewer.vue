<script setup lang="ts">
    defineProps(['modal' , 'data'])
    const emit = defineEmits(['update:modal'])
</script>


<template>
    <a-modal title="Json"  width="600px" :footer="null" @cancel="emit('update:modal', false)">
        <json-viewer :value="data"></json-viewer>
    </a-modal>
</template>