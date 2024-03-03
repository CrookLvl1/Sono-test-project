<template>
    <div>
        <CalendarGridComp @daySelected="daySelectedHandler" />
        <Transition name="fade">
            <template v-if="showTasks">
                <div class="bg-block" @click.self="closeWindow">
                    <CalendarTasksComp @close-window="closeWindow" :dateArguments="dateArguments" />
                </div>
            </template>
        </Transition>
    </div>
</template>

<script  setup>
useHeadSafe({
    title: 'Календарь',
    link: [
        { rel: 'icon', type: 'image/png', href: '/icon.png' }
    ]
})
const showTasks = ref(false);
const dateArguments = shallowRef([]);

const daySelectedHandler = (...args) => {
    dateArguments.value = args;
    showTasks.value = true;
}

const closeWindow = () => showTasks.value = false;

</script>
    
<style lang="scss" scoped>
@import'@/assets/scss/transitions/fade.scss';

.bg-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, .25);
    width: 100svw;
    height: 100svh;
    z-index: 100;
    position: fixed;
    left: 0;
    top: 0;
}
</style>