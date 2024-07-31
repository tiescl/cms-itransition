import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import JiraIssue from '../../types/JiraIssue';
import InlineLoadingScreen from '../layout/InlineLoadingScreen';

interface ITicketsProps {
  issues: JiraIssue[];
  isLoading: boolean;
}

function JiraTickets({ issues, isLoading }: ITicketsProps) {
  let { t } = useTranslation();

  return isLoading ? (
    <InlineLoadingScreen message='inlineLoading.tickets' />
  ) : (
    <table className='table table-bordered table-striped table-hover'>
      <thead>
        <tr>
          <th>{t('user.jKey')}</th>
          <th>{t('user.jSummary')}</th>
          <th>{t('user.jStatus')}</th>
          <th>{t('user.jPriority')}</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => (
          <tr key={issue.key}>
            <td>
              <Link
                to={`https://cms-tiescl.atlassian.net/browse/${issue.key}`}
                className='text-decoration-none'
                target='_blank'
                rel='noreferrer'
              >
                {issue.key}
              </Link>
            </td>
            <td>{issue.summary}</td>
            <td>{issue.status}</td>
            <td>{issue.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default JiraTickets;
