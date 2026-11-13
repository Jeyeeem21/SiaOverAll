import { CheckCircle, ClipboardList, Eye, FileCheck2, FileX2, Printer, Bike, Car, Truck, Bus } from 'lucide-react';

// Skeleton Loader for Request List
function RequestListSkeleton() {
  const SkeletonRow = () => (
    <tr>
      <td><div className="skeleton" style={{width: '70%', height: '14px', marginBottom: '6px'}}></div><div className="skeleton" style={{width: '50%', height: '12px'}}></div></td>
      <td><div className="skeleton" style={{width: '80px', height: '24px', borderRadius: '999px'}}></div></td>
      <td><div className="skeleton" style={{width: '60%', height: '14px'}}></div></td>
      <td><div className="skeleton" style={{width: '70%', height: '14px'}}></div></td>
      <td><div className="skeleton" style={{width: '90px', height: '24px', borderRadius: '999px'}}></div></td>
      <td><div style={{display: 'flex', justifyContent: 'flex-end', gap: '4px'}}><div className="skeleton" style={{width: '32px', height: '32px', borderRadius: '8px'}}></div><div className="skeleton" style={{width: '32px', height: '32px', borderRadius: '8px'}}></div></div></td>
    </tr>
  );

  return (
    <main className="container page-enter">
      <header className="page-heading">
        <div>
          <div className="skeleton" style={{width: '120px', height: '12px', marginBottom: '8px'}}></div>
          <div className="skeleton" style={{width: '300px', height: '24px', marginBottom: '8px'}}></div>
          <div className="skeleton" style={{width: '400px', height: '14px'}}></div>
        </div>
      </header>

      <section className="stats-grid">
        {[1,2,3,4].map(i => (
          <article key={i} className="stat-card">
            <div className="skeleton" style={{width: '40px', height: '40px', borderRadius: '12px'}}></div>
            <div style={{flex: 1}}>
              <div className="skeleton" style={{width: '80%', height: '12px', marginBottom: '8px'}}></div>
              <div className="skeleton" style={{width: '50%', height: '22px'}}></div>
            </div>
          </article>
        ))}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <div className="skeleton" style={{width: '200px', height: '18px', marginBottom: '6px'}}></div>
            <div className="skeleton" style={{width: '350px', height: '12px'}}></div>
          </div>
          <div className="skeleton" style={{width: '32px', height: '26px', borderRadius: '999px'}}></div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Vehicle</th>
                <th>Plate number</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function RequestList({ requests, onViewRequest, onApprove, onOpenGenerated, loading }) {
  // Show skeleton if loading
  if (loading) {
    return <RequestListSkeleton />;
  }
  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const generatedRequests = requests.filter((request) => request.status === 'generated');
  const completedRequests = requests.filter((request) => request.status === 'completed');
  const declinedRequests = requests.filter((request) => ['declined', 'rejected'].includes(request.status));

  const vehicleIcon = (type) => {
    const props = { size: 15, 'aria-hidden': true };
    if (type === 'Motorcycle' || type === 'Tricycle') return <Bike {...props} />;
    if (type === 'SUV') return <Truck {...props} />;
    if (type === 'Van') return <Bus {...props} />;
    return <Car {...props} />;
  };

  const RequestTable = ({ rows, variant, showReason = false }) => (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Student</th><th>Vehicle</th>{showReason ? <th>Reason</th> : <><th>Plate number</th><th>Submitted</th></>}<th>Status</th>{['pending', 'generated'].includes(variant) && <th className="text-right">Actions</th>}</tr></thead>
        <tbody>{rows.map((request) => <tr key={request.id}>
          <td><div className="student-cell"><span className="student-name">{request.studentName}</span><span className="student-id">ID: {request.studentId}</span></div></td>
          <td><span className="vehicle-badge">{vehicleIcon(request.vehicleType)} {request.vehicleType}</span></td>
          {showReason ? <td className="reason-cell">{request.remarks || request.declineReason || 'No reason provided'}</td> : <><td><span className="plate">{request.plateNumber}</span></td><td className="date-cell">{request.submittedDate}</td></>}
          <td><span className={`status-badge ${variant}`}>{variant === 'pending' ? 'Pending' : variant === 'generated' ? 'Ready to print' : variant === 'completed' ? 'Completed' : 'Declined'}</span></td>
          {variant === 'pending' && <td><div className="table-actions"><button className="icon-button" onClick={() => onViewRequest(request)} title="View request details" aria-label="View request details"><Eye size={16} /></button><button className="icon-button" onClick={() => onApprove(request)} title="Approve and customize sticker" aria-label="Approve and customize sticker"><CheckCircle size={16} /></button></div></td>}
          {variant === 'generated' && <td><div className="table-actions"><button className="icon-button" onClick={() => onOpenGenerated(request)} title="Open sticker for printing" aria-label="Open sticker for printing"><Printer size={16} /></button></div></td>}
        </tr>)}</tbody>
      </table>
    </div>
  );

  const EmptyState = ({ message }) => <div className="empty-state"><ClipboardList size={28} /><p>{message}</p></div>;

  return <main className="container page-enter">
    <header className="page-heading"><div><p className="eyebrow">Administration</p><h1>Vehicle Sticker Requests</h1><p>Review applications and generate approved vehicle stickers.</p></div></header>
    <section className="stats-grid" aria-label="Request summary">
      <article className="stat-card"><div className="stat-icon pending"><ClipboardList size={19} /></div><div><p>Pending requests</p><strong>{pendingRequests.length}</strong></div></article>
      <article className="stat-card"><div className="stat-icon completed"><FileCheck2 size={19} /></div><div><p>Completed</p><strong>{completedRequests.length}</strong></div></article>
      <article className="stat-card"><div className="stat-icon declined"><FileX2 size={19} /></div><div><p>Declined</p><strong>{declinedRequests.length}</strong></div></article>
      <article className="stat-card"><div className="stat-icon total"><Car size={19} /></div><div><p>Total requests</p><strong>{requests.length}</strong></div></article>
    </section>
    <section className="content-section"><div className="section-heading"><div><h2>Pending sticker requests</h2><p>Applications awaiting review and sticker configuration.</p></div><span className="count-badge">{pendingRequests.length}</span></div>{pendingRequests.length ? <RequestTable rows={pendingRequests} variant="pending" /> : <EmptyState message="No pending requests" />}</section>
    {generatedRequests.length > 0 && <section className="content-section"><div className="section-heading"><div><h2>Ready to print</h2><p>Stickers generated and awaiting physical printing confirmation.</p></div><span className="count-badge">{generatedRequests.length}</span></div><RequestTable rows={generatedRequests} variant="generated" /></section>}
    {completedRequests.length > 0 && <section className="content-section"><div className="section-heading"><div><h2>Completed requests</h2><p>Stickers that have already been issued.</p></div><span className="count-badge">{completedRequests.length}</span></div><RequestTable rows={completedRequests} variant="completed" /></section>}
    {declinedRequests.length > 0 && <section className="content-section"><div className="section-heading"><div><h2>Declined requests</h2><p>Applications that need correction or resubmission.</p></div><span className="count-badge">{declinedRequests.length}</span></div><RequestTable rows={declinedRequests} variant="declined" showReason /></section>}
  </main>;
}

export default RequestList;
