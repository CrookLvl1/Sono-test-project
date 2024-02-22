<template>
    <div class="calendar-grid-wrapper">

        <div class="month-select">
            <button v-if="currentWindow === 0" @click="updateCurrentMonth('monthBackward')">&#10094;</button>
            <h4 v-if="currentWindow === 0" @click="updateCurrentWindow(1)">{{ monthTitles[month] }} {{ selectedYear }}г.
            </h4>
            <h4 v-else-if="currentWindow === 1" @click="updateCurrentWindow(1)">{{ selectedYear }}г.</h4>
            <h4 v-else @click="updateCurrentWindow(-1)">Выберите год</h4>
            <button v-if="currentWindow === 0" @click="updateCurrentMonth('monthForward')">&#10095;</button>
        </div>
        <transition name="fade" mode="out-in">
            <template v-if="currentWindow === 0">
                <transition name="fade" mode="out-in">
                    <div class="table" @click="tableClickHandler" :key="chosenDate">
                        <div class="table__row">
                            <div class="table__cell table__cell-header" v-for="title in dayTitlesShort">
                                <h5>{{ title }}</h5>
                            </div>
                        </div>
                        <div class="table__row" v-for="row, rowIndex in matrix" :key="rowIndex">
                            <div :class="{
                                'table__cell': true,
                                'table__cell-data': true,
                                'inactive': cellObj.month !== month,
                                'have-task': cellObj.tasks.length !== 0,
                                'today': cellObj.day === currentDate.getDate() && cellObj.month === currentDate.getMonth() && cellObj.year === currentDate.getFullYear()
                            }" v-for="cellObj, columnIndex in row"
                                :key="`${cellObj.year}${cellObj.month}${cellObj.day}`" :month="cellObj.month"
                                :year="cellObj.year" :day="cellObj.day" :dayIndex="columnIndex" :tasks="cellObj.tasks">
                                <span>{{ cellObj.day }}</span>
                            </div>
                        </div>
                    </div>
                </transition>
            </template>
            <template v-else-if="currentWindow === 1">
                <div class="table table-select" @click="dateSelectHandler($event, 'month')">
                    <div class="table-select__cell table-select__cell-month" v-for="monthIndex in 12"
                        :key="monthTitles[monthIndex - 1]">
                        <button :month="monthIndex - 1">{{ monthTitles[monthIndex - 1] }}</button>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table table-select" @click="dateSelectHandler($event, 'year')">
                    <div class="table-select__cell table-select__cell-year" v-for="yearIndex in 20" :key="yearIndex">
                        <button :year="year - 10 + yearIndex">{{ year - 10 + yearIndex }}</button>
                    </div>
                </div>
            </template>

        </transition>
    </div>
</template>

<script setup>
const emit = defineEmits(['daySelected'])

const calendarStore = useCalendarStore();
const dayTitlesShort = calendarStore.dayTitlesShort;
const monthTitles = calendarStore.monthTitles;
const currentDate = calendarStore.currentDate;

const matrix = computed(() => calendarStore.matrix);
const chosenDate = computed(() => calendarStore.getChosenDate);
const month = computed(() => chosenDate.value.getMonth())
const year = computed(() => chosenDate.value.getFullYear());

let selectedYear = ref(chosenDate.value.getFullYear()),
    selectedMonth = ref(null);

watch(year, (value) => selectedYear.value = value);


let currentWindow = ref(0);

const updateCurrentWindow = (value) => {
    switch (currentWindow.value) {
        case 0:
            selectedMonth.value = null;
            break;
        case 1:
            if (value === 1) {
                selectedMonth.value = null;
            }
            break;
        case 2:
            break;
        default:
            console.warn('updateCurrentWindow Error', value);
            return;
    }
    currentWindow.value += value;
}

const updateCurrentMonth = (direction) => {
    calendarStore.updateChosenDate(direction)
}

const tableClickHandler = (ev) => {
    let target = ev.target;
    while (target && !target?.classList.contains('table__cell-data')) {
        target = target.parentElement;
    }
    if (!target) return;
    emit('daySelected', target.getAttribute('year'), target.getAttribute('month'), target.getAttribute('day'), target.getAttribute('dayIndex'));
}
const dateSelectHandler = (ev, type) => {
    if (!type) return;

    let target = ev.target;
    while (target && !(target?.tagName === 'BUTTON')) {
        target = target.parentElement;
    }
    if (!target) return;
    switch (type) {
        case 'month': {
            selectedMonth.value = target.getAttribute('month');
            updateCurrentWindow(-1);

            calendarStore.updateChosenDate('set', new Date(selectedYear.value, selectedMonth.value))

            break;
        }
        case 'year': {
            selectedYear.value = target.getAttribute('year');
            updateCurrentWindow(-1);
            break;
        }
        default: {
            console.warn('dateSelectHandler Error', ev, type);
            return;
        }
    }
}

</script>

<style lang="scss" scoped>
@import'@/assets/scss/calendar-grid-comp.scss';
@import'@/assets/scss/transitions/fade.scss';
</style>