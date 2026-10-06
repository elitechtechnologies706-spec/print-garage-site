import { useEffect } from 'react';
import { ArrowLeft, Download, LockKeyhole, LogOut } from 'lucide-react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  getGetViewsAdminQueryKey,
  useGetViewsAdmin,
  useLoginViewsAdmin,
  useLogoutViewsAdmin,
} from '@workspace/api-client-react';
import { Form } from '../components/ui/form';
import './admin-views.css';

const adminClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });

function AdminViewsContent() {
  const queryClient = useQueryClient();
  const history = useGetViewsAdmin({ query: { queryKey: getGetViewsAdminQueryKey(), retry: false, refetchOnMount: 'always' } });
  const login = useLoginViewsAdmin({
    mutation: {
      onSuccess: () => {
        form.reset();
        void queryClient.invalidateQueries({ queryKey: getGetViewsAdminQueryKey() });
      },
    },
  });
  const logout = useLogoutViewsAdmin({
    mutation: {
      onSuccess: () => {
        window.location.assign('/admin/views');
      },
    },
  });
  const form = useForm<{ password: string }>({ defaultValues: { password: '' } });

  useEffect(() => {
    document.title = 'Visit history | Print Garage Admin';
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
    return () => { robots?.remove(); };
  }, []);

  const unauthorized = (history.error as { status?: number } | null)?.status === 401;
  const signIn = unauthorized || (!history.data && !history.isPending && !history.isFetching && !history.isError);

  return (
    <div className="views-admin">
      <header className="views-admin-header">
        <a href="/" data-testid="link-admin-home"><ArrowLeft size={17} aria-hidden="true" /> Print Garage</a>
        <span><LockKeyhole size={16} aria-hidden="true" /> Admin / Views</span>
      </header>
      <main className="views-admin-main">
        <div className="views-admin-heading">
          <span className="views-admin-eyebrow">Private / Site activity</span>
          <h1>Homepage views.</h1>
          <p>Each homepage load is recorded with its time, IP address and browser details. This information is visible only after admin sign-in.</p>
        </div>

        {history.isPending && !unauthorized && <p className="views-admin-state" role="status">Loading visit history…</p>}
        {history.isError && !unauthorized && (
          <div className="views-admin-state" role="alert">
            Could not load the visit history. Please try again.
            <button type="button" onClick={() => void history.refetch()} data-testid="button-admin-retry">Retry</button>
          </div>
        )}

        {signIn && (
          <Form {...form}>
            <form className="views-admin-login" onSubmit={form.handleSubmit(({ password }) => login.mutate({ data: { password } }))}>
              <span className="views-admin-eyebrow">Restricted access</span>
              <h2>Enter the admin password.</h2>
              <input className="views-admin-username" type="text" name="username" autoComplete="username" value="print-garage-admin" readOnly tabIndex={-1} aria-hidden="true" />
              <label htmlFor="views-password">Password</label>
              <input id="views-password" type="password" autoComplete="current-password" required data-testid="input-admin-password" {...form.register('password', { required: true })} />
              {login.isError && <p role="alert" className="views-admin-error">Sign-in failed. Check the password or try again later.</p>}
              <button type="submit" disabled={login.isPending} data-testid="button-admin-sign-in">{login.isPending ? 'Checking…' : 'View visits'}</button>
            </form>
          </Form>
        )}

        {history.data && !unauthorized && (
          <>
            <div className="views-admin-summary">
              <div><span>Total homepage views</span><strong data-testid="text-admin-view-count">{history.data.count.toLocaleString('en-UG')}</strong></div>
              <div className="views-admin-actions">
                <a href="/api/views.json" download="views.json" data-testid="link-admin-export"><Download size={17} aria-hidden="true" /> Download views.json</a>
                <button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} data-testid="button-admin-sign-out"><LogOut size={17} aria-hidden="true" /> Sign out</button>
              </div>
            </div>
            <section className="views-admin-list" aria-label="Recent homepage visits">
              <h2>Recent visits <small>Latest 100</small></h2>
              {history.data.visits.length === 0 ? <p className="views-admin-empty">No homepage views recorded yet.</p> : (
                <div className="views-admin-table-wrap">
                  <table>
                    <thead><tr><th scope="col">Time (Kampala)</th><th scope="col">IP address</th><th scope="col">Browser / device</th></tr></thead>
                    <tbody>
                      {history.data.visits.map((visit) => (
                        <tr key={visit.id} data-testid={`row-admin-visit-${visit.id}`}>
                          <td><time dateTime={visit.timestamp}>{new Intl.DateTimeFormat('en-UG', { timeZone: 'Africa/Kampala', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(visit.timestamp))}</time></td>
                          <td className="views-admin-mono">{visit.ip}</td>
                          <td className="views-admin-agent">{visit.userAgent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminViews() {
  return <QueryClientProvider client={adminClient}><AdminViewsContent /></QueryClientProvider>;
}