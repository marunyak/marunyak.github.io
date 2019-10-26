import './styles/sass/main.scss';

const tasks = 'taskList';
const root = document.querySelector("#root");
const createTask = document.querySelector('.create-task');
const taskList = document.querySelector('.task-list');
const titleTask = document.querySelector('.create-task input[name="title"]');
const descriptionTask = document.querySelector('.create-task textarea[name="description"]');
const priorityTask = document.querySelector('.create-task select[name="priority"]');
const searchFilter = document.querySelector('input[name="filter-search"]');
const openFilter = document.querySelector('select[name="filter-open-done"]');
const priorityFilter = document.querySelector('select[name="filter-priority"]');
let list = JSON.parse(localStorage.getItem(tasks)) || [];
let filter = { search: '', open: 'all', priority: 'all' };

if (list) renderList();

//Listen changes on options button in task card

taskList.addEventListener('click', (e) => {
    e.preventDefault();
    let elem = e.target;
    let editTaskParent = elem.parentElement
                            .parentElement
                            .parentElement
                            .parentElement;
    let id = editTaskParent.id;

    if (elem.classList.contains('options')) {
        elem.children[0].classList.toggle('show');
    }

    if (elem.classList.contains('delete')) {
        elem.parentElement.classList.toggle('show');
        list = list.filter((item) => item.id !== id);
        saveToLocalStorage(list);
        changeFilter();
    }

    if (elem.classList.contains('edit')) {
        let item = list.find((item) => item.id === id);
        let isdone = editTaskParent.classList.contains("task-done");
        createTask.setAttribute('task-id', id);
        createTask.setAttribute('task-done', isdone);
        createTask.classList.toggle('show');
        root.classList.toggle('opacity');
        titleTask.value = item.title;
        descriptionTask.value = item.description;
        priorityTask.value = item.priority;
        elem.parentElement.classList.toggle('show');
    }

    if (elem.classList.contains('done')) {
        list = list.filter((item) => {
            if (item.id === id) {
                item.done = !item.done;
            }
            return item;
        });
        saveToLocalStorage(list);
        changeFilter();
    }
});

//Listen changes on Cancel and Save buttons in edit/create task window

createTask.addEventListener('click', (e) => {
    e.preventDefault();
    let elem = e.target;

    if (elem.classList.contains('save')) {
        save();
        renderList();
        cancel(e);
    }

    if (elem.classList.contains('cancel')) {
        cancel(e);
    }
});

//Listen changes on search input

searchFilter.addEventListener('input', () => changeFilter());

//Listen changes on selects

document.querySelector('.filter').addEventListener('change', () => changeFilter());

//Open window for creating task

document.querySelector('.create').addEventListener('click', (e) => {
    createTask.classList.toggle('show');
    root.classList.toggle('opacity');
    document.body.classList.toggle('stop-scrolling');
});

//Filter tasks

function changeFilter() {
    if(!list) return;
    let temp_list = '';
    filter['search'] = searchFilter.value.replace(/(<([^>]+)>)/ig,"");
    filter['open'] = openFilter.value.replace(/(<([^>]+)>)/ig,"");
    filter['priority'] = priorityFilter.value.replace(/(<([^>]+)>)/ig,"");
    temp_list = list.filter((item) => (filter.search === ''
                            || item.title.search(new RegExp(`^${filter.search.toLocaleLowerCase()}`,'g'))!== -1))
                    .filter((item, index, arr) => {
                       return (filter.open === 'all'
                            || (filter.open === 'open' && arr[index].done === false)
                            || (filter.open === 'done' && arr[index].done === true)
                    )})
                    .filter((item, index, arr) => (filter.priority === 'all'
                            || arr[index].priority === filter.priority));
    renderList(temp_list);
}

//Save task in edit/create window

function save() {
    let title = titleTask.value.trimStart().replace(/(<([^>]+)>)/ig,"");
    let description = descriptionTask.value.trimStart().replace(/(<([^>]+)>)/ig,"");
    let priority = priorityTask.value.replace(/(<([^>]+)>)/ig,"");

    if (title === null || title === '') return;

    if (createTask.getAttribute('task-id') && createTask.getAttribute('task-done')) {
        let isdone = createTask.getAttribute('task-done') === 'false'?false:true;
        let id = createTask.getAttribute('task-id');
        list = list.map((item) => {
            if (item.id === id) {
                item = { id: id, title: title, description: description, priority: priority, done: isdone };
            }
            return item;
        });
        saveToLocalStorage(list);
        createTask.removeAttribute('task-id');
        createTask.removeAttribute('task-done');
        changeFilter();
    } else {
        let saveList = saveToList(title, description, priority);
        list.push(saveList);
        saveToLocalStorage(list);
    }
}

//Cancel window edit/create a task

function cancel(e) {
    titleTask.value = null;
    descriptionTask.value = null;
    e.target.parentElement
            .parentElement
            .parentElement
            .classList.toggle('show');
    root.classList.toggle('opacity');
    document.body.classList.toggle('stop-scrolling');
}

//Render list of tasks

function renderList(new_list = '') {
    const renderTasks = new_list || list;
    taskList.innerHTML = '';
    renderTasks.forEach((element) => {
        createElement(element.id, element.title, element.description, element.priority, element.done);
    });
}

//Save task in list

function saveToList(title, description, priority) {
    return { id: Date.now().toString(), title: title, description: description, priority: priority, done: false };
}

//Save list of tasks in LocalStorage

function saveToLocalStorage(list) {
    localStorage.setItem(tasks,JSON.stringify(list));
}

//Create task

function createElement(id, title, description, priority, done = false) {
    const colorsPriority = { high: 'red', normal: 'yellow',low: 'blue', };
    const task = `<div class="task ${done !== false?'task-done':''}" id="${id}">
        <div class="title">${title}</div>
        <p class="text">${description}</p>
        <i class="${done !== false?"material-icons":''}">${done !== false?"done":''}</i>
        <div class="settings">
            <div class="status-priority ${colorsPriority[priority]}">${priority}</div>
            <div class="options">...
                <ul class="options-list">
                    <li class="done">${done !== false?'open':'done'}</li>
                    <li class="edit">edit</li>
                    <li class="delete">delete</li>
                </ul>
            </div>
        </div>
    </div>`;
    taskList.innerHTML += task;
}
