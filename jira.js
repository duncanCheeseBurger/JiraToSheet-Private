import fetch from 'node-fetch'; // You need to install 'node-fetch' using npm or yarn
import 'dotenv/config'

const jiraBaseUrl = 'https://btse.atlassian.net';


const getJiraTickets = async () => {
  const issueArray = [];
  try {
    // Create the basic authentication header
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${process.env.username}:${process.env.apiToken}`).toString('base64')}`,
    };

    // Get the list of issues from the board
    const jql = 'created >= "2023-10-01" AND created <= "2023-10-31"';

    const queryParameters = new URLSearchParams({
      jql: jql,
      fields: 'summary,id,created,labels,issuetype,status,priority,duedate',
      maxResults: '200',
    }).toString();
    
    const url = `${jiraBaseUrl}/rest/agile/1.0/board/${process.env.boardId}/issue?${queryParameters}`;
    
    const response = await fetch(url, { headers });

    const responseBody = await response.text(); // Get the response text
    if (response.status === 200) {
      try {
        const data = JSON.parse(responseBody);
        if (data.issues) {
          const issues = data.issues;
          issues.forEach((issue) => {
            issueArray.push([
              issue.key,
              issue.fields.summary,
              issue.fields.labels.join(', '),
              issue.fields.created
            ]);
          });
          return issueArray; 
        } else {
          console.error('No issues found on this board.');
          return [];
        }
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return [];
      }
    } else {
      console.error(`Failed to retrieve Jira tickets. Status: ${response.status}`);
      console.error('Response Body:', responseBody);
      return [];
    }
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// getJiraTickets();
export default getJiraTickets;
// export { issueArray, getJiraTickets };