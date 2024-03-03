export const useCalendarStore = defineStore('calendarStore', () => {
    //readonly objects
    const monthTitles = Object.freeze(['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']);

    const dayTitlesShort = Object.freeze(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']);
    const dayTitlesFull = Object.freeze(['Понедельник', 'Вторник', 'Среда', 'Четверг',
        'Пятница', 'Суббота', 'Воскресенье']);

    const currentDate = new Date();

    const getDays = (month, year) => {
        switch (month) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
            case 1:
                return year % 4 === 0 ? 29 : 28;
            default:
                return -1;
        }
    }

    //Объект заданий типа {'number': {'number': {'number': Array<Task>}}}
    //Task - объект типа {title: string, desc: string, time: {from: number, to: number}, id: number}

    const tasks = reactive({});

    onMounted(() => {
        if (!localStorage.getItem('tasks')) return;
        const tasksObj = JSON.parse(localStorage.getItem('tasks'));
        Object.assign(tasks, tasksObj)
    })

    const getTasks = (year, month, day) => tasks[year] && tasks[year][month] && tasks[year][month][day] || [];

    const updateTasks = (task, date, action) => {
        const year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();

        switch (action) {
            case 'add': {
                if (!Object.hasOwn(tasks, year))
                    tasks[year] = {};
                if (!Object.hasOwn(tasks[year], month))
                    tasks[year][month] = {}
                if (!Object.hasOwn(tasks[year][month], day))
                    tasks[year][month][day] = [];

                tasks[year][month][day].push(task);
                break;
            }
            case 'remove': {
                if (!(Object.hasOwn(tasks, year) && Object.hasOwn(tasks[year], month) && Object.hasOwn(tasks[year][month], day))) return;
                const tasksArray = tasks[year][month][day];

                const taskIndex = tasksArray.findIndex(checkingTask => checkingTask.id === task.id);
                if (taskIndex === -1) return;

                tasksArray.splice(taskIndex, 1)
                break;
            }
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    const chosenDate = shallowRef(new Date());
    const getChosenDate = computed(() => chosenDate.value)

    const updateChosenDate = (action, date = null) => {
        switch (action) {
            case 'monthForward': {
                chosenDate.value = new Date(chosenDate.value.getFullYear(), chosenDate.value.getMonth() + 1);
                return;
            }
            case 'monthBackward': {
                chosenDate.value = new Date(chosenDate.value.getFullYear(), chosenDate.value.getMonth() - 1);
                return;
            }
            case 'set': {
                if (!date) return;
                chosenDate.value = date;
                return;
            }
            default: {
                return;
            }
        }
    }

    const calcMatrixLimits = (date) => {
        let month = date.getMonth(),
            year = date.getFullYear();
        //Текущее значение дня недели в пределах 0-6, где 0-пн, 6-вс
        let dayIndex = date.getDay() - 1;
        if (dayIndex < 0) dayIndex += 7;

        //День месяца
        let day = date.getDate() % 7;
        if (dayIndex - day < 0) day -= 7;

        //Значение дня недели первого числа в пределах 0-6, где 0-пн, 6-вс
        let firstDayIndex = (1 - day + dayIndex) % 7;
        let additionalDaysBefore = firstDayIndex;

        //Количество дней в месяце
        let daysInMonth = getDays(month, year);
        //Количество строк в матрице
        let rows = Math.ceil((daysInMonth + firstDayIndex) / 7);

        //tmp - переход на последнюю строку в матрице
        let tmp = Math.floor(daysInMonth / 7) * 7;
        //cntr - counter - защита от бесконечного цикла
        let cntr = 0;
        while (tmp < daysInMonth) {
            firstDayIndex = (firstDayIndex + 1) % 7;
            tmp++;
            cntr++;
            if (cntr > 100) {
                console.warn(`calcMatrixLimits Error in while Cycle, tmp = ${tmp}, firstDayIndex = ${firstDayIndex}`);
                break;
            }
        }
        //Дней другого месяца в последней строке данного месяца
        let additionalDaysAfter = 7 - firstDayIndex;
        return {
            additionalDaysBefore,
            additionalDaysAfter,
            daysInMonth,
            rows,
            month,
            year
        }
    }
    //Матрица объектов типа {year: number, month: number, day: number, tasks: Array<Task>}
    const matrix = computed(() => {
        const matrixLimits = calcMatrixLimits(chosenDate.value);
        const firstDayIndex = matrixLimits.additionalDaysBefore;

        const resultMatrix = [];


        let daysInPrevMonth = 0;
        if (matrixLimits.additionalDaysBefore) {
            const month = matrixLimits.month - 1 < 0 ? 11 : matrixLimits.month - 1;
            const year = matrixLimits.month === 0 ? matrixLimits.year - 1 : matrixLimits.year;
            daysInPrevMonth = getDays(month, year)
        }

        let nextMonthStart = matrixLimits.additionalDaysAfter ? 1 : 0;

        const currentMonthDays = getDays(matrixLimits.month, matrixLimits.year);
        for (let row = 0; row < matrixLimits.rows; row++) {
            const matrixRow = [];

            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                const dayObj = {
                    year: matrixLimits.year,
                    month: matrixLimits.month,
                    day: row * 7 + dayIndex - firstDayIndex + 1,
                    tasks: [],
                };

                if (row === 0 && matrixLimits.additionalDaysBefore) {
                    dayObj.month--;
                    dayObj.day = daysInPrevMonth - (matrixLimits.additionalDaysBefore - 1);
                    matrixLimits.additionalDaysBefore--;
                }

                else if (row === matrixLimits.rows - 1 && matrixLimits.additionalDaysAfter &&
                    dayObj.day > currentMonthDays) {
                    dayObj.month++;
                    dayObj.day = nextMonthStart++;
                    matrixLimits.additionalDaysAfter--;
                }

                else dayObj.day = row * 7 + dayIndex - firstDayIndex + 1;



                if (dayObj.month < 0) {
                    dayObj.month = 11;
                    dayObj.year--;
                };

                dayObj.tasks = getTasks(dayObj.year, dayObj.month, dayObj.day)

                matrixRow.push(dayObj)
            }
            resultMatrix.push(matrixRow);
        }
        return resultMatrix;
    })




    return {
        monthTitles,
        dayTitlesShort,
        dayTitlesFull,
        getChosenDate,
        updateChosenDate,
        updateTasks,
        getTasks,
        currentDate,
        matrix
    }
})