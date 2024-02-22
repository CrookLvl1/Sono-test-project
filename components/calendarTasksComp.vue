<template>
    <div class="calendar-tasks-wrapper">
        <h3 class="date">{{ monthTitles[date.getMonth()] }} {{ date.getDate() }} число, {{ dayTitles[dayIndex] }}</h3>
        <button class="back abort" @click="toPreviousWindowHanlder">&#10149;</button>
        <Transition name="fade" mode="out-in">
            <template v-if="currentWindow === 'main'">
                <div class="tasks">
                    <Transition name="fade" mode="out-in">
                        <template v-if="tasksArray.length > 0">
                            <ul @click="taskActionHandler">
                                <TransitionGroup name="tasks">
                                    <li v-for="task, index in tasksArray" :taskIndex="index" :key="task.id">
                                        {{ task.title }}
                                        <div class="buttons">
                                            <button class="watch accept round"
                                                :action="'watch'"><span>&#128065;</span></button>
                                            <button class="abort round" :action="'remove'"><span>-</span></button>
                                        </div>
                                    </li>
                                </TransitionGroup>
                            </ul>
                        </template>
                        <template v-else>
                            <span>Пусто... Попробуйте добавить новые задачи на данную дату</span>
                        </template>
                    </Transition>
                    <button class="accept" @click="currentWindow = 'add-task'">
                        <span>+</span>
                    </button>
                </div>
            </template>
            <template v-else-if="currentWindow === 'add-task'">
                <div class="add-task">
                    <input type="text" ref="titleElement" placeholder="Заголовок">
                    <textarea ref="descriptionElement" placeholder="Описание"></textarea>
                    <div class="select-time" ref="timeContainer">
                        <input @blur="blurHandler" type="number" value="00" min="0" max="23">
                        <span>:</span>
                        <input @blur="blurHandler" type="number" value="00" min="0" max="58">
                        <span>-</span>
                        <input @blur="blurHandler" type="number" value="00" min="0" max="23">
                        <span>:</span>
                        <input @blur="blurHandler" type="number" value="00" min="0" max="59">
                    </div>
                    <button class="add accept" @click="addTaskHandler">Добавить</button>
                </div>
            </template>
            <template v-else-if="currentWindow === 'watch-task'">
                <div v-if="currentTask" class="watch-task">
                    <h4 class="title">{{ currentTask.title }}</h4>
                    <p class="description">{{ currentTask.description }}</p>
                    <div class="time">
                        С {{ getTimeStr(currentTask.time.from) }}
                        до {{ getTimeStr(currentTask.time.to) }}
                    </div>
                </div>
            </template>
        </Transition>
    </div>
</template>

<script setup>
const emit = defineEmits(['close-window']);
const props = defineProps(['dateArguments']);

const calendarStore = useCalendarStore();

const monthTitles = calendarStore.monthTitles;
const dayTitles = calendarStore.dayTitlesFull;


const toPreviousWindowHanlder = () => {
    switch (currentWindow.value) {
        case 'main': {
            emit('close-window');
            break;
        }
        case 'add-task':
        case 'watch-task': {
            currentWindow.value = 'main'
            break;
        }


    }
}


const dateArgs = props.dateArguments;
const dayIndex = dateArgs.pop();

const date = new Date(...dateArgs);

const timeContainer = ref(null);
const titleElement = ref(null);
const descriptionElement = ref(null);

const currentTask = shallowRef(null);

const missingInputShow = (el) => {
    el.style.boxShadow = '0 0 15px 5px red';
    setTimeout(() => el.style.boxShadow = '', 500);
}

const tasksArray = computed(() => calendarStore.getTasks(...dateArgs))


const currentWindow = ref('main');

const getTimeInputsCollection = () => {
    return Array.from(timeContainer.value?.children)
        .filter(element => element.tagName === "INPUT")
}

const addTaskHandler = () => {
    const inputsCollection = getTimeInputsCollection()

    const inputsArray = inputsCollection
        .map(element => +element.value);

    const titleStr = titleElement.value.value;
    const descriptionStr = descriptionElement.value.value;

    const minutesFrom = inputsArray[0] * 60 + inputsArray[1];
    const minutesTo = inputsArray[2] * 60 + inputsArray[3];

    if (!titleStr) {
        missingInputShow(titleElement.value);
        return;
    }
    if (!descriptionStr) {
        missingInputShow(descriptionElement.value);
        return;
    }
    if (minutesTo < minutesFrom) {
        missingInputShow(inputsCollection[2]);
        missingInputShow(inputsCollection[3]);
        return;
    }

    calendarStore.updateTasks({
        title: titleStr,
        description: descriptionStr,
        id: new Date().getTime(),
        time: {
            from: minutesFrom,
            to: minutesTo
        }
    }, date, 'add');

    titleElement.value.value = '';
    descriptionElement.value.value = '';
    inputsCollection
        .forEach(element => element.value = '00');
}

const blurHandler = (ev) => {
    const element = ev.target;

    //Целочисленное число
    const elementValue = +Math.floor(element.value);

    const elementMaxAttribute = +element.getAttribute('max');
    const elementMinAttribute = +element.getAttribute('min');

    if (elementValue > elementMaxAttribute) element.value = elementMaxAttribute;
    else if (elementValue < elementMinAttribute) element.value = elementMaxAttribute;
    else element.value = elementValue < 10 ? '0' + elementValue : elementValue;
}

const taskActionHandler = (ev) => {
    let target = ev.target;
    let action = null;
    while (target && !(target.tagName === "LI")) {
        if (target.tagName === "BUTTON")
            action = target.getAttribute('action');

        target = target.parentElement;
    }
    if (!action) return;

    const task = tasksArray.value[target.getAttribute('taskIndex')];
    switch (action) {
        case 'watch': {
            currentTask.value = task;
            currentWindow.value = 'watch-task';
            break;
        }
        case 'remove': {
            calendarStore.updateTasks(task, date, 'remove');
            break;
        }
    }

}

const getTimeStr = (minutes) => {
    let hours = Math.floor(minutes / 60);
    minutes %= 60;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    return `${hours}:${minutes}`;
}

</script>

<style lang="scss" scoped>
@import '@/assets/scss/transitions/fade.scss';
@import '@/assets/scss/buttons.scss';
@import '@/assets/scss/transitions/tasks.scss';
@import '@/assets/scss/calendar-tasks-comp.scss';
</style>