import React, { useEffect, useState, useMemo } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiPlus,
  FiBell,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import { RiBuilding4Line } from "react-icons/ri";
import { HiOutlineUsers } from "react-icons/hi";
import Swal from "sweetalert2";

// AdminPartnersPage.jsx
// Single-file React + Tailwind frontend for BBSCART Business Partner List (responsive)
// - Default export component
// - Mocked data + API-like functions
// - Search, filters, sorting, pagination
// - Detail drawer, actions with SweetAlert confirmations
// - Mobile / Tablet / Desktop responsive

const MOCK_PARTNERS = Array.from({ length: 42 }).map((_, i) => ({
  id: `P-${1000 + i}`,
  name: `Partner ${i + 1}`,
  businessName: `Business ${i + 1} Pvt Ltd`,
  type: ["Seller", "Vendor", "Franchise"][i % 3],
  category: ["Retail", "Wholesale", "Services"][i % 3],
  contact: `+91 9${String(100000000 + i).slice(1)}`,
  email: `partner${i + 1}@bbscart.com`,
  city: ["Mumbai", "Delhi", "Bengaluru", "Kolkata"][i % 4],
  status: ["Active", "Pending", "Suspended"][i % 3],
  joinedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  revenue: Math.floor(Math.random() * 1000000),
  kycVerified: i % 4 !== 0,
  rating: (Math.random() * 2 + 3).toFixed(1),
}));

export default function AdminPartnersPage() {
  // state
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("joinedDesc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards' for mobile
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    businessName: "",
    type: "",
    category: "",
    contact: "",
    email: "",
  });

  // fetch mock data (simulate API)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setPartners(MOCK_PARTNERS);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // derived lists for filters
  const cities = useMemo(
    () => ["All", ...Array.from(new Set(partners.map((p) => p.city)))],
    [partners]
  );
  const types = useMemo(
    () => ["All", ...Array.from(new Set(partners.map((p) => p.type)))],
    [partners]
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(partners.map((p) => p.status)))],
    [partners]
  );

  // filtering & searching
  const filtered = useMemo(() => {
    let data = partners.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((p) =>
        [p.name, p.businessName, p.id, p.email, p.contact, p.city].some(
          (field) => field.toLowerCase().includes(q)
        )
      );
    }
    if (statusFilter !== "All")
      data = data.filter((p) => p.status === statusFilter);
    if (typeFilter !== "All") data = data.filter((p) => p.type === typeFilter);
    if (cityFilter !== "All") data = data.filter((p) => p.city === cityFilter);

    // sorts
    if (sortBy === "joinedDesc")
      data.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    if (sortBy === "joinedAsc")
      data.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
    if (sortBy === "revenueDesc") data.sort((a, b) => b.revenue - a.revenue);
    if (sortBy === "revenueAsc") data.sort((a, b) => a.revenue - b.revenue);

    return data;
  }, [partners, query, statusFilter, typeFilter, cityFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [pageCount]);

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // actions
  const openPartner = (p) => {
    setSelectedPartner(p);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedPartner(null);
    setDrawerOpen(false);
  };

  const confirmAction = async (action, partner) => {
    const { value } = await Swal.fire({
      title: `${action} partner?`,
      text: `${action} partner ${partner.name} (${partner.id})`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action,
    });
    if (value) {
      // simulate API and update state
      Swal.fire({
        title: `${action} in progress...`,
        timer: 800,
        showConfirmButton: false,
      });
      setTimeout(() => {
        setPartners((prev) =>
          prev.map((p) =>
            p.id === partner.id
              ? { ...p, status: action === "Suspend" ? "Suspended" : "Active" }
              : p
          )
        );
        Swal.fire("Success", `${action} completed.`, "success");
      }, 800);
    }
  };

  const deletePartner = async (partner) => {
    const { isConfirmed } = await Swal.fire({
      title: `Delete partner?`,
      text: `This action cannot be undone for ${partner.name} (${partner.id})`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (isConfirmed) {
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      Swal.fire("Deleted", "Partner removed.", "success");
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "id",
        "name",
        "businessName",
        "type",
        "category",
        "contact",
        "email",
        "city",
        "status",
        "joinedAt",
        "revenue",
      ],
      ...filtered.map((p) => [
        p.id,
        p.name,
        p.businessName,
        p.type,
        p.category,
        p.contact,
        p.email,
        p.city,
        p.status,
        p.joinedAt,
        p.revenue,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partners_export_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // small helper for responsive table columns
  const StatusChip = ({ status }) => {
    const base =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    if (status === "Active")
      return (
        <span className={`${base} bg-green-100 text-green-800`}>Active</span>
      );
    if (status === "Pending")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>
      );
    return <span className={`${base} bg-red-100 text-red-800`}>Suspended</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white p-3 shadow-sm">
            <RiBuilding4Line className="text-2xl text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Business Partners
            </h1>
            <p className="text-sm text-gray-500">
              Manage BBSCART sellers, vendors, franchises & affiliates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="hidden sm:inline-flex items-center gap-2 bg-white border rounded-md px-3 py-2 shadow-sm"
            onClick={() => exportCSV()}
          >
            <FiDownloadIconPlaceholder /> Export
          </button>
          <button
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-md shadow hover:bg-indigo-700"
            onClick={() => Swal.fire("Open onboarding UI", "", "info")}
          >
            <FiPlus /> New Partner
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Partners" value={partners.length} />
        <StatCard
          title="Pending Approvals"
          value={partners.filter((p) => p.status === "Pending").length}
        />
        <StatCard
          title="Total Revenue (est)"
          value={partners.reduce((s, p) => s + p.revenue, 0)}
          currency
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search partners, id, email or city..."
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="joinedDesc">Joined: Newest</option>
              <option value="joinedAsc">Joined: Oldest</option>
              <option value="revenueDesc">Revenue: High → Low</option>
              <option value="revenueAsc">Revenue: Low → High</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 border rounded-md"
                onClick={() => {
                  setViewMode(viewMode === "table" ? "cards" : "table");
                }}
              >
                Toggle View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading partners...
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="py-2">Partner</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Contact</th>
                    <th>City</th>
                    <th>Status</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-center  ">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-indigo-50 flex items-center justify-center font-semibold text-indigo-600">
                            {p.name
                              .split(" ")
                              .map((s) => s[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {p.businessName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.name} • {p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{p.type}</td>
                      <td>{p.category}</td>
                      <td>
                        <div className="text-sm">{p.contact}</div>
                        <div className="text-xs text-gray-500">{p.email}</div>
                      </td>
                      <td>{p.city}</td>
                      <td>
                        <StatusChip status={p.status} />
                      </td>
                      <td className="text-right">
                        ₹{p.revenue.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            className="px-2 py-1 border rounded-md text-sm"
                            onClick={() => openPartner(p)}
                          >
                            View
                          </button>
                          <button
                            className="px-2 py-1 border rounded-md text-sm"
                            onClick={() => confirmAction("Suspend", p)}
                          >
                            Suspend
                          </button>
                          <button
                            className="px-2 py-1 border rounded-md text-sm text-red-600"
                            onClick={() => deletePartner(p)}
                          >
                            Delete
                          </button>
                          <button className="px-2 py-1 border rounded-md text-sm">
                            Undo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Cards view */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {visible.map((p) => (
                <div key={p.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-indigo-50 flex items-center justify-center font-semibold text-indigo-600">
                        {p.name
                          .split(" ")
                          .map((s) => s[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium">{p.businessName}</div>
                        <div className="text-xs text-gray-500">
                          {p.name} • {p.city}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ₹{p.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{p.status}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="flex-1 px-3 py-2 border rounded-md"
                      onClick={() => openPartner(p)}
                    >
                      Details
                    </button>
                    <button
                      className="px-3 py-2 border rounded-md"
                      onClick={() => confirmAction("Suspend", p)}
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 border rounded-md"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <div className="px-3 py-1 border rounded-md">
                  {page} / {pageCount}
                </div>
                <button
                  className="px-3 py-1 border rounded-md"
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drawer */}
      {isDrawerOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={closeDrawer} />
          <div className="w-full sm:w-96 bg-white p-4 border-l overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedPartner.businessName}
                </h2>
                <div className="text-xs text-gray-500">
                  {selectedPartner.name} • {selectedPartner.id}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 border rounded-md"
                  onClick={() => setIsEditMode((prev) => !prev)}
                >
                  {isEditMode ? <FiX /> : <FiEdit />}
                </button>
                <button
                  className="px-2 py-1 border rounded-md text-red-600"
                  onClick={() => deletePartner(selectedPartner)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <Section title="Overview">
                {isEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.businessName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          businessName: e.target.value,
                        })
                      }
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Business Name"
                    />
                    <input
                      type="text"
                      value={editData.type}
                      onChange={(e) =>
                        setEditData({ ...editData, type: e.target.value })
                      }
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Type"
                    />
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) =>
                        setEditData({ ...editData, category: e.target.value })
                      }
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Category"
                    />
                    <input
                      type="text"
                      value={editData.contact}
                      onChange={(e) =>
                        setEditData({ ...editData, contact: e.target.value })
                      }
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Contact Number"
                    />
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Email"
                    />

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          Swal.fire({
                            icon: "success",
                            title: "Partner Updated",
                            text: "The partner overview details have been saved.",
                            confirmButtonColor: "#4f46e5",
                          });
                          setIsEditMode(false);
                          // mock update
                          Object.assign(selectedPartner, editData);
                        }}
                        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 px-3 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <KeyVal label="Type" value={selectedPartner.type} />
                    <KeyVal label="Category" value={selectedPartner.category} />
                    <KeyVal
                      label="Contact"
                      value={`${selectedPartner.contact} • ${selectedPartner.email}`}
                    />
                    <KeyVal label="City" value={selectedPartner.city} />
                    <KeyVal
                      label="Status"
                      value={<StatusChip status={selectedPartner.status} />}
                    />
                    <KeyVal
                      label="Joined"
                      value={new Date(
                        selectedPartner.joinedAt
                      ).toLocaleDateString()}
                    />
                  </>
                )}
              </Section>

              {/* Rest of your sections remain unchanged */}
              <Section title="Compliance">
                <div className="text-sm">
                  KYC Verified: {selectedPartner.kycVerified ? "Yes" : "No"}
                </div>
                <div className="text-xs text-gray-500">
                  Documents: PAN, GST, Bank Proof (mock)
                </div>
              </Section>

              <Section title="Finance">
                <div className="text-sm">
                  Revenue: ₹{selectedPartner.revenue.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Pending Payouts: ₹
                  {Math.floor(selectedPartner.revenue * 0.1).toLocaleString()}
                </div>
              </Section>

              <Section title="Support & Notes">
                <textarea
                  className="w-full border rounded-md p-2"
                  placeholder="Internal notes for this partner..."
                />
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-md">
                    Save Note
                  </button>
                  <button
                    className="px-3 py-2 border rounded-md"
                    onClick={() =>
                      Swal.fire("Message sent to partner (mock)", "", "success")
                    }
                  >
                    Message Partner
                  </button>
                </div>
              </Section>
            </div>

            <div className="mt-6">
              <button
                className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md"
                onClick={() => {
                  closeDrawer();
                  Swal.fire("Opening settlements...", "", "info");
                }}
              >
                Open Settlements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper components ---
function StatCard({ title, value, currency }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold mt-1">
          {currency ? `₹${Number(value).toLocaleString()}` : value}
        </div>
      </div>
      <div className="text-indigo-600 text-3xl">
        {title === "Total Partners" ? <HiOutlineUsers /> : <RiBuilding4Line />}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-2">{title}</h3>
      <div className="text-sm text-gray-600 space-y-2">{children}</div>
    </div>
  );
}

function KeyVal({ label, value }) {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}

function FiDownloadIconPlaceholder() {
  // simple inline icon placeholder to avoid extra import complexity
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
      />
    </svg>
  );
}
