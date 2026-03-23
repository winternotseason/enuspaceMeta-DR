import { MappingEmail } from '@/constant/Mapping';

type IssueNotificationPayload = {
  type: 'new-issue' | 'new-comment';
  issueNumber: number;
  issueTitle: string;
  issueUrl?: string;
  issueAuthorLogin?: string;
  issueAuthorName?: string;
  commentAuthorLogin?: string;
  commentAuthorName?: string;
  commentBody?: string;
  recipients?: string[];
};

const NEW_ISSUE_RECIPIENT_LOGINS = ['winternotseason', 'songing1111'] as const;

export const getNewIssueRecipients = () =>
  NEW_ISSUE_RECIPIENT_LOGINS.map((login) => MappingEmail[login]).filter(Boolean);

export const notifyIssueByEmail = async (payload: IssueNotificationPayload) => {
  const response = await fetch('/api/issue-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send issue notification email');
  }

  return response.json();
};
