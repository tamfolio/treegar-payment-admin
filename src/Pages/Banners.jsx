import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAdminBanner, useUpdateBanner } from "../hooks/bannerHooks";
import { useCompanies, formatCompanyOptions } from "../hooks/companyhooks";

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const formatDate = (v) => (v ? new Date(v).toLocaleString() : "—");

const Banners = () => {
  const [companyId, setCompanyId] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ header: "", body: "", isActive: true });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies();
  const companies = companiesResponse?.data?.items || [];
  const companyOptions = formatCompanyOptions(companies);

  const { data, isLoading, isFetching, error: fetchError } = useAdminBanner(companyId, {
    enabled: !!companyId,
  });
  const updateMutation = useUpdateBanner();

  const isNotFound = fetchError?.response?.status === 404;
  const banner = data?.data;

  useEffect(() => {
    setEditing(false);
    setError("");
    setSuccess("");
    if (banner) {
      setForm({
        header: banner.header ?? "",
        body: banner.body ?? "",
        isActive: banner.isActive ?? true,
      });
    } else {
      setForm({ header: "", body: "", isActive: true });
    }
  }, [companyId, banner]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.header.trim()) {
      setError("Header is required");
      return;
    }
    if (form.header.length > 200) {
      setError("Header must be 200 characters or fewer");
      return;
    }
    setError("");

    updateMutation.mutate(
      { companyId: companyId ? parseInt(companyId) : null, ...form },
      {
        onSuccess: (res) => {
          if (res?.success === false) {
            setError(res.message || "Failed to update banner");
            return;
          }
          setSuccess("Banner updated successfully");
          setEditing(false);
          setTimeout(() => setSuccess(""), 4000);
        },
        onError: (err) => {
          setError(
            err?.response?.data?.message || err.message || "Failed to update banner"
          );
        },
      }
    );
  };

  const selectedCompany = companyOptions.find((c) => String(c.value) === String(companyId));

  return (
    <Layout>
      <div className="p-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage company banners shown to customers in the app
          </p>
        </div>

        {/* Company selector */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Select Company
          </h3>
          {loadingCompanies ? (
            <div className="flex items-center gap-3 py-2">
              <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading companies…</p>
            </div>
          ) : (
            <div>
              <label className={labelCls}>Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className={inputCls}
              >
                <option value="">— Select a company —</option>
                {companyOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* No company selected */}
        {!companyId && (
          <p className="text-sm text-gray-400">Select a company above to view or manage its banner.</p>
        )}

        {/* Loading */}
        {companyId && isLoading && (
          <div className="bg-white rounded-lg shadow p-12 flex flex-col items-center justify-center gap-3">
            <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm text-gray-500">Loading banner…</p>
          </div>
        )}

        {/* Fetch error (not 404) */}
        {fetchError && !isLoading && !isNotFound && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-red-800">Could not load banner</p>
            <p className="text-xs text-red-600 mt-0.5">
              {fetchError?.response?.data?.message || fetchError.message || "An error occurred"}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Banner card */}
        {companyId && !isLoading && !isFetching && (banner || isNotFound) && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedCompany?.label ?? `Company #${companyId}`} — Banner
                </h2>
                {banner && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      banner.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>
              {!editing && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20"
                >
                  {banner ? "Edit" : "Create"}
                </button>
              )}
            </div>

            {/* View mode */}
            {!editing && (
              <div className="px-5 py-4">
                {banner ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className={labelCls}>Header</dt>
                      <dd className="text-sm font-medium text-gray-900">{banner.header || "—"}</dd>
                    </div>
                    <div>
                      <dt className={labelCls}>Body</dt>
                      <dd className="text-sm text-gray-700 whitespace-pre-wrap">{banner.body || "—"}</dd>
                    </div>
                    <div className="flex gap-8 pt-1">
                      <div>
                        <dt className={labelCls}>Last Updated</dt>
                        <dd className="text-sm text-gray-700">{formatDate(banner.updatedAt)}</dd>
                      </div>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400 py-4">
                    No banner configured for this company. Click{" "}
                    <span className="font-medium">Create</span> to add one.
                  </p>
                )}
              </div>
            )}

            {/* Edit mode */}
            {editing && (
              <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
                <div>
                  <label className={labelCls}>
                    Header{" "}
                    <span className="text-gray-400 font-normal">(max 200 chars)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={form.header}
                    onChange={(e) => setForm((p) => ({ ...p, header: e.target.value }))}
                    placeholder="Banner headline"
                    className={inputCls}
                    autoFocus
                    disabled={updateMutation.isPending}
                  />
                  <p className="text-xs text-gray-400 mt-0.5 text-right">
                    {form.header.length}/200
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Body</label>
                  <textarea
                    rows={4}
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    placeholder="Banner message content"
                    className={inputCls}
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    disabled={updateMutation.isPending}
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (visible to customers)
                  </label>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      if (banner) {
                        setForm({
                          header: banner.header ?? "",
                          body: banner.body ?? "",
                          isActive: banner.isActive ?? true,
                        });
                      }
                    }}
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save Banner"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Banners;
