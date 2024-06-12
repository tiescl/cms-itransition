import JiraClient from 'jira-client';

const jiraApiKey = process.env.JIRA_API_KEY;

const jira = new JiraClient({
  protocol: 'https',
  host: 'cms-tiescl.atlassian.net',
  username: 'tiescl.to@gmail.com',
  password: jiraApiKey,
  apiVersion: '2',
  strictSSL: true
});

export default jira;
