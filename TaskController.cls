public with sharing class TaskController {
    @AuraEnabled(cacheable=true)
    public static List<Task__c> getTasksForUser(String priorityFilter, String statusFilter) {
        String userId = UserInfo.getUserId();
        String query = 'SELECT Id, Name, Description__c, Due_Date__c, Priority__c, Status__c, Assigned_To__c ' +
                       'FROM Task__c WHERE Assigned_To__c = :userId';
        if (priorityFilter != null) {
            query += ' AND Priority__c = :priorityFilter';
        }
        if (statusFilter != null) {
            query += ' AND Status__c = :statusFilter';
        }
        return Database.query(query);
    }

    @AuraEnabled
    public static Id createTask(Task__c newTask) {
        if (newTask.Due_Date__c < Date.today()) {
            throw new AuraHandledException('Due Date cannot be in the past.');
        }
        insert newTask;
        return newTask.Id;
    }

    @AuraEnabled
    public static void updateTaskStatus(Id taskId, String newStatus) {
        Task__c task = [SELECT Id, Status__c FROM Task__c WHERE Id = :taskId LIMIT 1];
        task.Status__c = newStatus;
        update task;
    }

    @AuraEnabled
    public static void deleteTask(Id taskId) {
        delete [SELECT Id FROM Task__c WHERE Id = :taskId LIMIT 1];
    }
}
