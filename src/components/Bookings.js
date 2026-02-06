import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Loader from "./Loader";

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [staffMap, setStaffMap] = useState({});
  const [activeTab, setActiveTab] = useState("unassigned");
  const [loading, setLoading] = useState(true);

  const [showStaff, setShowStaff] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [assignmentDone, setAssignmentDone] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [showRefundSuccess, setShowRefundSuccess] = useState(false);
  const [targetRefundId, setTargetRefundId] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  /* ===== FILTER STATE ===== */
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    setBookings(data || []);
    setLoading(false);

    const emails = data?.map(b => b.assigned_staff_email).filter(Boolean);
    if (!emails?.length) {
      setStaffMap({});
      return;
    }

    const { data: staffData } = await supabase
      .from("staff_profile")
      .select("full_name, email")
      .in("email", emails);

    const map = {};
    staffData?.forEach(s => (map[s.email] = s.full_name));
    setStaffMap(map);
  };

  /* ================= REFUND FUNCTION ================= */
  const markRefunded = (bookingId) => {
    setTargetRefundId(bookingId);
    setShowRefundConfirm(true);
  };

  const handleConfirmRefund = async () => {
    const { error } = await supabase
      .from("bookings")
      .update({
        refund_status: "REFUNDED",
        refund_time: new Date().toISOString(),
      })
      .eq("id", targetRefundId);

    if (!error) {
      setShowRefundConfirm(false);
      setShowRefundSuccess(true);
      fetchBookings();
    }
  };

  /* ================= STAFF FLOW ================= */
  const fetchStaff = async (booking) => {
    setSelectedBooking(booking);
    setShowStaff(true);
    setSelectedStaff(null);
    setAssignmentDone(false);

    const { data } = await supabase
      .from("staff_profile")
      .select("id, full_name, email, phone");

    setStaffList(data || []);
  };

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const confirmAssignment = async () => {
    if (!selectedBooking || !selectedStaff) return;

    let startOtp = generateOtp();
    let endOtp = generateOtp();
    while (startOtp === endOtp) endOtp = generateOtp();

    const { error } = await supabase
      .from("bookings")
      .update({
        assigned_staff_email: selectedStaff.email,
        startotp: startOtp,
        endotp: endOtp,
      })
      .eq("id", selectedBooking.id);

    if (!error) {
      setAssignmentDone(true);
      setShowAlert(true);
      fetchBookings();
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (Array.isArray(img)) return img[0] || null;
    if (typeof img === "string" && img.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(img);
        return Array.isArray(parsed) ? parsed[0] : null;
      } catch {
        return null;
      }
    }
    return img;
  };

  /* ================= TAB GROUPS ================= */
  const unassignedBookings = bookings.filter(b => !b.assigned_staff_email);
  const assignedBookings = bookings.filter(b => b.assigned_staff_email);
  const completedBookings = bookings.filter(
    b => b.work_status?.toLowerCase() === "completed"
  );
  const cancelledBookings = bookings.filter(
    b =>
      b.work_status &&
      (b.work_status.toLowerCase() === "cancelled" ||
        b.work_status.toLowerCase() === "refunded")
  );

  /* ===== FILTER HELPERS ===== */
  const uniqueDates = [...new Set(bookings.map(b => b.booking_date).filter(Boolean))].sort();

  const uniqueTimes = [...new Set(
    bookings.map(b => b.booking_time).filter(Boolean)
  )].sort((a, b) => {
    const toMinutes = (time) => {
      const [t, meridian] = time.toLowerCase().split(" ");
      let [h, m] = t.split(":").map(Number);
      if (meridian === "pm" && h !== 12) h += 12;
      if (meridian === "am" && h === 12) h = 0;
      return h * 60 + m;
    };
    return toMinutes(a) - toMinutes(b);
  });

  const applyDateTimeFilter = (data) =>
    data.filter(b => {
      if (filterDate && b.booking_date !== filterDate) return false;
      if (filterTime && b.booking_time !== filterTime) return false;
      return true;
    });

  const visibleBookings =
    activeTab === "unassigned"
      ? applyDateTimeFilter(unassignedBookings)
      : activeTab === "assigned"
        ? applyDateTimeFilter(assignedBookings)
        : activeTab === "completed"
          ? applyDateTimeFilter(completedBookings)
          : applyDateTimeFilter(cancelledBookings);

  /* ================= STAFF CONFIRM SCREEN ================= */
  if (showStaff && selectedBooking && selectedStaff) {
    return (
      <div className="dashboard">
        <h2>Assign Staff</h2>

        <div className="staff-card">
          <p><b>Name:</b> {selectedStaff.full_name}</p>
          <p><b>Email:</b> {selectedStaff.email}</p>
          <p><b>Phone:</b> {selectedStaff.phone}</p>

          {assignmentDone ? (
            <button className="allot-btn" disabled>Assigned</button>
          ) : (
            <button className="allot-btn" onClick={confirmAssignment}>
              Confirm Assignment
            </button>
          )}
        </div>

        <button className="allot-btn" onClick={() => setShowStaff(false)}
          style={{
            display: "block",
            margin: "20px auto 0",
          }}>
          Back to Bookings
        </button>

        {showAlert && (
          <>
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 9998,
            }} />
            <div style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "32px",
              borderRadius: "16px",
              zIndex: 9999,
              textAlign: "center",
            }}>
              <h3>Success</h3>
              <p>Start OTP and End OTP have been saved</p>
              <button className="allot-btn" onClick={() => setShowAlert(false)}>
                OK
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ================= STAFF LIST SCREEN ================= */
  if (showStaff && selectedBooking) {
    return (
      <div className="dashboard">
        <h2>Available Staff</h2>

        <div className="staff-grid">
          {staffList.map(staff => (
            <div key={staff.id} className="staff-card">
              <p><b>Name:</b> {staff.full_name}</p>
              <p><b>Email:</b> {staff.email}</p>
              <p><b>Phone:</b> {staff.phone}</p>

              <button className="allot-btn" onClick={() => setSelectedStaff(staff)}>
                Assign
              </button>
            </div>
          ))}
        </div>

        <button className="allot-btn" onClick={() => setShowStaff(false)}
          style={{
            display: "block",
            margin: "20px auto 0",
          }}>
          Back to Bookings
        </button>
      </div>
    );
  }

  /* ================= BOOKINGS TABLE ================= */
  if (loading) return <Loader />;

  return (
    <div className="dashboard">
      <h2>No of Bookings</h2>
      <h1>{bookings.length}</h1>

      {/* Tabs + Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
        <div className="dashboard-tabs" style={{ margin: 0, gap: "30px" }}>
          <span className={activeTab === "unassigned" ? "active" : ""} onClick={() => setActiveTab("unassigned")}>Unassigned ({unassignedBookings.length})</span>
          <span className={activeTab === "assigned" ? "active" : ""} onClick={() => setActiveTab("assigned")}>Assigned ({assignedBookings.length})</span>
          <span className={activeTab === "completed" ? "active" : ""} onClick={() => setActiveTab("completed")}>Completed ({completedBookings.length})</span>
          <span className={activeTab === "cancelled" ? "active" : ""} onClick={() => setActiveTab("cancelled")}>Cancelled ({cancelledBookings.length})</span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option value=""> Date</option>
            {uniqueDates.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={filterTime} onChange={e => setFilterTime(e.target.value)}>
            <option value=""> Time</option>
            {uniqueTimes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <button className="allot-btn" onClick={() => {
            setFilterDate("");
            setFilterTime("");
          }}>
            Clear Filter
          </button>
        </div>
      </div>

      <table className="booking-table">
        <thead>
          {activeTab === "completed" ? (
            <tr>
              <th>Customer Name</th>
              <th>Service Title</th>
              <th>Service Price</th>
              <th>Time</th>
              <th>Customer Address</th>
              <th>Staff Name</th>
              <th>Staff Email</th>
              <th>Start Image</th>
              <th>End Image</th>
            </tr>
          ) : activeTab === "cancelled" ? (
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Total Amount</th>
              <th>Payment ID</th>
              <th>Status</th>
              <th>Cancel Time</th>
              <th>Cancel Reason</th>
              <th>Refund Status</th>
              <th>Action</th>
            </tr>
          ) : (
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Assigned Staff</th>
              <th>Action</th>
            </tr>
          )}
        </thead>

        <tbody>
          {activeTab === "completed"
            ? visibleBookings.map(b => (
              <tr key={b.id}>
                <td>{b.customer_name}</td>
                <td>{b.services?.[0]?.title}</td>
                <td>{b.services?.[0]?.price}</td>
                <td>{b.booking_time}</td>
                <td>{b.full_address}</td>
                <td>{staffMap[b.assigned_staff_email]}</td>
                <td>{b.assigned_staff_email}</td>
                <td>
                  {getImageUrl(b.start_photo_url) && (
                    <button className="allot-btn" onClick={() => {
                      setModalImageUrl(getImageUrl(b.start_photo_url));
                      setShowImageModal(true);
                    }}>View</button>
                  )}
                </td>
                <td>
                  {getImageUrl(b.end_photo_url) && (
                    <button className="allot-btn" onClick={() => {
                      setModalImageUrl(getImageUrl(b.end_photo_url));
                      setShowImageModal(true);
                    }}>View</button>
                  )}
                </td>
              </tr>
            ))
            : activeTab === "cancelled"
              ? visibleBookings.map(b => (
                <tr key={b.id}>
                  <td>{b.customer_name}</td>
                  <td>{b.email}</td>
                  <td>{b.phone_number}</td>
                  <td>{b.full_address}</td>
                  <td>{b.services?.[0]?.title}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.booking_time}</td>
                  <td>{b.total_amount}</td>
                  <td>{b.razorpay_payment_id}</td>
                  <td>{b.work_status}</td>
                  <td>{b.cancel_time}</td>
                  <td>{b.cancel_reason}</td>
                  <td style={{ fontWeight: "bold", color: b.refund_status === "REFUNDED" ? "green" : "orange" }}>
                    {b.refund_status === "REFUNDED" ? "Refunded" : "Pending"}
                  </td>
                  <td>
                    {b.refund_status !== "REFUNDED" && (
                      <button className="allot-btn" onClick={() => markRefunded(b.id)}>
                        Mark Refunded
                      </button>
                    )}
                  </td>
                </tr>
              ))
              : visibleBookings.map(b => (
                <tr key={b.id}>
                  <td>{b.customer_name}</td>
                  <td>{b.phone_number}</td>
                  <td>{b.email}</td>
                  <td>{b.services?.[0]?.title || "N/A"}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.booking_time}</td>
                  <td>
                    {b.assigned_staff_email
                      ? staffMap[b.assigned_staff_email]
                      : "Not Assigned"}
                  </td>
                  <td>
                    <button className="allot-btn" onClick={() => fetchStaff(b)}>
                      {b.assigned_staff_email ? "Change Staff" : "Allot Staff"}
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* IMAGE MODAL */}
      {showImageModal && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9998 }} />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px",
            borderRadius: "16px",
            zIndex: 9999,
            textAlign: "center",
          }}>
            <img src={modalImageUrl} alt="Work" style={{ maxWidth: "300px", display: "block", marginBottom: "15px", borderRadius: "8px" }} />
            <button
              className="allot-btn"
              onClick={() => setShowImageModal(false)}
              style={{ margin: "0 auto", display: "inline-block" }}
            >
              OK
            </button>
          </div>
        </>
      )}

      {/* ✅ REFUND CONFIRM MODAL */}
      {showRefundConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px 40px",
              borderRadius: "12px",
              textAlign: "center",
              minWidth: "350px",
              position: "relative",
            }}
          >
            <span
              onClick={() => setShowRefundConfirm(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "15px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              ✕
            </span>

            <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>Confirm</h3>
            <p style={{ margin: "0 0 20px", color: "#666" }}>
              Confirm you have completed the refund in Razorpay?
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button
                onClick={handleConfirmRefund}
                style={{
                  padding: "8px 25px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#facc15",
                  color: "#000",
                  fontWeight: "600",
                }}
              >
                OK
              </button>
              <button
                onClick={() => setShowRefundConfirm(false)}
                style={{
                  padding: "8px 25px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ REFUND SUCCESS MODAL */}
      {showRefundSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px 40px",
              borderRadius: "12px",
              textAlign: "center",
              minWidth: "350px",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: "20px" }}>Success</h3>
            <p style={{ margin: "0 0 20px", color: "#666" }}>
              Refund marked as completed ✅
            </p>

            <button
              onClick={() => setShowRefundSuccess(false)}
              style={{
                padding: "8px 25px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#facc15",
                color: "#000",
                fontWeight: "600",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;








/* eslint-disable no-unused-vars */

