import { LightningElement, track, wire } from 'lwc';
import getTasksForUser from '@salesforce/apex/TaskController.getTasksForUser';
import createTask from '@salesforce/apex/TaskController.createTask';
import updateTaskStatus from '@salesforce/apex/TaskController.updateTaskStatus';
import deleteTask from '@salesforce/apex/TaskController.deleteTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class TaskManager extends LightningElement {
    @track tasks = [];
    @track taskName = '';
    @track description = '';
    @track dueDate = '';
    @track priority = '';
    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    columns = [
        { label: 'Task Name', fieldName: 'Name' },
        { label: 'Description', fieldName: 'Description__c' },
        { label: 'Due Date', fieldName: 'Due_Date__c', type: 'date' },
        { label: 'Priority', fieldName: 'Priority__c' },
        { label: 'Status', fieldName: 'Status__c' },
        { type: 'button', typeAttributes: { label: 'Update Status', name: 'update_status' } },
        { type: 'button', typeAttributes: { label: 'Delete', name: 'delete' } }
    ];

    @wire(getTasksForUser, { priorityFilter: null, statusFilter: null })
    wiredTasks({ error, data }) {
        if (data) {
            this.tasks = data;
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    async createTask() {
        const newTask = {
            Name: this.taskName,
            Description__c: this.description,
            Due_Date__c: this.dueDate,
            Priority__c: this.priority,
            Status__c: 'New'
        };
        try {
            await createTask({ newTask });
            this.showToast('Success', 'Task created successfully', 'success');
            this.refreshTasks();
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'update_status') {
            await updateTaskStatus({ taskId: row.Id, newStatus: 'Completed' });
            this.showToast('Success', 'Task status updated', 'success');
            this.refreshTasks();
        } else if (actionName === 'delete') {
            await deleteTask({ taskId: row.Id });
            this.showToast('Success', 'Task deleted successfully', 'success');
            this.refreshTasks();
        }
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({ title, message, variant });
        this.dispatchEvent(evt);
    }

    refreshTasks() {
        return refreshApex(this.wiredTasks);
    }
}
