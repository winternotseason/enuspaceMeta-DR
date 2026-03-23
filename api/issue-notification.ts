const nodemailer = require('nodemailer');

const emailMapping = {
  BrightJoy: 'jwlee@enu-tech.co.kr',
  byunghoonyoon: 'byunghoon@enu-tech.co.kr',
  'ENU-leegyuchan': 'leegyuchan@enu-tech.co.kr',
  songing1111: 'songing@enu-tech.co.kr',
  winternotseason: 'xitseo@enu-tech.co.kr',
  dlgustj8941enu: 'dlgustj8941@enu-tech.co.kr',
  ENUJoYujin: 'ska05142@enu-tech.co.kr',
  JungWonSeok97: 'ukksj0621@enu-tech.co.kr',
  'narini-ops': 'narini@enu-tech.co.kr',
};

const defaultIssueRecipients = ['winternotseason', 'songing1111']
  .map((login) => emailMapping[login as keyof typeof emailMapping])
  .filter(Boolean);

const getTransporter = () =>
  nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const toArray = (value : string | string[] | undefined) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

module.exports = async function handler(req : any, res : any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
  return res.status(500).json({
    error: 'Mail server is not configured',
    hasSmtpUser: !!process.env.SMTP_USER,
    hasSmtpPass: !!process.env.SMTP_PASS,
    hasMailFrom: !!process.env.MAIL_FROM,
  });
}
  const {
    type,
    issueNumber,
    issueTitle,
    issueUrl,
    issueAuthorLogin,
    issueAuthorName,
    commentAuthorLogin,
    commentAuthorName,
    commentBody,
    recipients,
  } = req.body || {};

  let targetRecipients = [];
  let subject = '';
  let text = '';

  if (type === 'new-issue') {
    targetRecipients = toArray(recipients).length > 0 ? toArray(recipients) : defaultIssueRecipients;
    subject = '[Issue #' + issueNumber + '] New issue created';
    text = [
      'A new issue has been created.',
      'Title: ' + (issueTitle || ''),
      'Author: ' + (issueAuthorName || issueAuthorLogin || ''),
      issueUrl ? 'URL: ' + issueUrl : '',
    ]
      .filter(Boolean)
      .join('\n');
  } else if (type === 'new-comment') {
    const authorEmail =
      typeof issueAuthorLogin === 'string' ? emailMapping[issueAuthorLogin as keyof typeof emailMapping] : undefined;

    targetRecipients = toArray(recipients).length > 0 ? toArray(recipients) : toArray(authorEmail);
    subject = '[Issue #' + issueNumber + '] New comment added';
    text = [
      'A new comment has been added to your issue.',
      'Title: ' + (issueTitle || ''),
      'Issue Author: ' + (issueAuthorName || issueAuthorLogin || ''),
      'Comment Author: ' + (commentAuthorName || commentAuthorLogin || ''),
      '',
      String(commentBody || ''),
      '',
      issueUrl ? 'URL: ' + issueUrl : '',
    ]
      .filter((line) => line !== '')
      .join('\n');
  } else {
    return res.status(400).json({ error: 'Unsupported notification type' });
  }

  if (targetRecipients.length === 0) {
    return res.status(200).json({ ok: true, skipped: true, reason: 'No recipients resolved' });
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: targetRecipients.join(','),
      subject,
      text,
    });

    return res.status(200).json({ ok: true, recipients: targetRecipients });
  } catch (error) {
    console.error('issue-notification error', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};
