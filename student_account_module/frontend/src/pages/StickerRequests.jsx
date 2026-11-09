import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navigation from '../components/Navigation';
import ApiService from '../services/api';

const documents = [
  ['license', 'Driver license'],
  ['official_receipt', 'Official receipt'],
  ['certificate_of_registration', 'Certificate of registration']
];

const StickerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    plate_number: '',
    vehicle_type: 'car',
    vehicle_model: '',
    vehicle_color: ''
  });
  const [files, setFiles] = useState({});

  useEffect(() => {
    ApiService.getStickerRequests()
      .then((response) => {
        setRequests(response.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Unable to load sticker requests.');
        setLoading(false);
      });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    Object.entries(files).forEach(([key, value]) => body.append(key, value));
    setSubmitting(true);
    try {
      const response = await ApiService.createStickerRequest(body);
      setRequests((current) => [response.data, ...current]);
      event.target.reset();
      setForm({ plate_number: '', vehicle_type: 'car', vehicle_model: '', vehicle_color: '' });
      setFiles({});
      toast.success('Sticker request submitted.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const viewDocument = (document) =>
    ApiService.viewStickerRequestDocument(selected.id, document).catch((error) =>
      toast.error(error.message)
    );

  const getStatusBadge = (status) => {
    const configs = {
      pending: 'bg-amber-100 text-amber-700 border border-amber-300',
      approved: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      rejected: 'bg-rose-100 text-rose-700 border border-rose-300',
      completed: 'bg-emerald-100 text-emerald-700 border border-emerald-300'
    };
    return configs[status] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  return (
    <>
      <Navigation userRole="student" />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-5 lg:px-6 py-5">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vehicle Sticker Requests</h1>
            <p className="text-[11px] text-gray-400 mt-1.5">Submit your vehicle documents for a campus sticker</p>
          </div>
        </header>

        <main className="mt-7 max-w-4xl mx-auto px-5 lg:px-6 pb-20">
          {/* Submit Form */}
          <div className="card mb-7">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">New Sticker Request</h2>
              <p className="text-[11px] text-gray-400 mt-1">Fill in your vehicle details and upload required documents</p>
            </div>

            <form onSubmit={submit} className="px-5 py-5">
              {/* Vehicle Information */}
              <div className="mb-4">
                <h3 className="text-[13px] font-bold text-gray-900 mb-3">Vehicle Information</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Plate Number *
                    </label>
                    <input
                      required
                      value={form.plate_number}
                      onChange={(event) => setForm({ ...form, plate_number: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="ABC-1234"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Vehicle Type *
                    </label>
                    <select
                      value={form.vehicle_type}
                      onChange={(event) => setForm({ ...form, vehicle_type: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Vehicle Model
                    </label>
                    <input
                      value={form.vehicle_model}
                      onChange={(event) => setForm({ ...form, vehicle_model: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Honda Civic"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Vehicle Color
                    </label>
                    <input
                      value={form.vehicle_color}
                      onChange={(event) => setForm({ ...form, vehicle_color: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="White"
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="mb-4">
                <h3 className="text-[13px] font-bold text-gray-900 mb-3">Required Documents</h3>
                <div className="space-y-3">
                  {documents.map(([key, label]) => (
                    <div key={key}>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        {label} *
                      </label>
                      <input
                        required
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(event) => setFiles({ ...files, [key]: event.target.files?.[0] })}
                        className="w-full text-[11px] text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>

          {/* My Requests */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-gray-900">My Requests</h2>
            </div>

            <div className="px-5 py-5">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-500">No sticker requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelected(request)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-gray-900">{request.plate_number}</p>
                          <p className="text-[11px] text-gray-500 mt-1 capitalize">
                            {request.vehicle_type}
                            {request.vehicle_model && ` • ${request.vehicle_model}`}
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-2">Click to view details →</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setSelected(null)}
          />
          <section className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sticker Request</p>
                  <h2 className="text-[15px] font-bold text-gray-900 mt-1">{selected.plate_number}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</dt>
                  <dd className="mt-1.5">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(selected.status)}`}>
                      {selected.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</dt>
                  <dd className="mt-1.5 text-[13px] font-medium text-gray-900 capitalize">{selected.vehicle_type}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Model</dt>
                  <dd className="mt-1.5 text-[13px] font-medium text-gray-900">{selected.vehicle_model || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color</dt>
                  <dd className="mt-1.5 text-[13px] font-medium text-gray-900">{selected.vehicle_color || 'Not provided'}</dd>
                </div>
              </dl>

              <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <p className="text-[11px] font-bold text-emerald-900">Uploaded Documents</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {documents.map(([document, label]) => (
                    <button
                      key={document}
                      type="button"
                      onClick={() => viewDocument(document)}
                      className="rounded-xl bg-white border border-emerald-300 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      View {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default StickerRequests;
