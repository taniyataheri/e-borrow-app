import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar/Navbar"
import { AuthContext } from "../context/authContext";
import axios from "axios";
import { Container, Table, Card } from "react-bootstrap";
import Swal from "sweetalert2";

function ReturnHistory() {
  const [returnList, setReturnList] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useContext(AuthContext);
  console.log("🧑‍💻 user:", user);
  console.log("🔐 token:", token);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [unreturned, setUnreturned] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/borrow/unreturned")
      .then(res => setUnreturned(res.data))
      .catch(err => console.error("Error fetching unreturned:", err));
  }, []);

  useEffect(() => {
    if (!user || !token) return;
    fetchReturnDetail();
  }, [user, token]);

  const fetchReturnDetail = () => {
    const url =
      user.role === 1
        ? "http://localhost:3001/return-detail"
        : `http://localhost:3001/return-detail/user/${user.id}`;

    axios.get(url, {
      headers: { Authorization: token },
    })
      .then((res) => setReturnList(res.data))
      .catch((err) => console.error("เกิดข้อผิดพลาด:", err));
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const filteredData = Array.isArray(returnList)
    ? returnList.filter((r) => {
        const totalReturned = r.return_good + r.return_damaged + r.return_lost;
        const matchTab =
          activeTab === "all"
            ? totalReturned === r.total
            : activeTab === "partial"
            ? totalReturned < r.total && (r.return_damaged > 0 || r.return_lost > 0)
            : activeTab === "overdue"
            ? totalReturned < r.total
            : true;

        const searchMatch =
          r.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.member_name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchTab && searchMatch;
      })
    : [];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedList = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const calculateFine = (dueDate, quantity) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now - due;
    const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return lateDays > 0 ? lateDays * 50 * quantity : 0;
  };

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
        <Card className="p-4 w-100">
          <h4 className="text-center mb-3" style={{ color: "#2e7d32" }}>ประวัติการคืนทรัพย์สิน</h4>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
              <div className="mb-2" style={{ width: "350px" }}>
                <input
                  type="text"
                  placeholder="🔍 ค้นหาทรัพย์สินหรือผู้ใช้งาน"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="btn-group mb-2">
                <button className={`btn btn-outline-success ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>📦 คืนครบแล้ว</button>
                <button className={`btn btn-outline-warning ${activeTab === "partial" ? "active" : ""}`} onClick={() => setActiveTab("partial")}>🧩 คืนไม่ครบ</button>
                <button className={`btn btn-outline-danger ${activeTab === "unreturned" ? "active" : ""}`} onClick={() => setActiveTab("unreturned")}>❌ ค้างคืน</button>
                <button className={`btn btn-outline-dark ${activeTab === "overdue" ? "active" : ""}`} onClick={() => setActiveTab("overdue")}>📍 เลยกำหนดคืน</button>
              </div>
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>คำขอ</th>
                  <th>ทรัพย์สิน</th>
                  <th>ผู้คืน</th>
                  <th>สมบูรณ์</th>
                  <th>ชำรุด</th>
                  <th>สูญหาย</th>
                  <th>ค่าปรับ</th>
                  <th>หมายเหตุ</th>
                  <th>ผู้รับคืน</th>
                  <th>วัน-เวลา</th>
                </tr>
              </thead>
              {(activeTab === "all" || activeTab === "partial") && (
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">ไม่พบข้อมูล</td>
                    </tr>
                  ) : (
                    paginatedList.map((r) => (
                      <tr key={r.return_id}>
                        <td>{r.request_id}</td>
                        <td>{r.product_name}</td>
                        <td>{r.member_name}</td>
                        <td>{r.return_good}</td>
                        <td>{r.return_damaged}</td>
                        <td>{r.return_lost}</td>
                        <td>{r.fine?.toLocaleString()} บาท</td>
                        <td>{r.note || "-"}</td>
                        <td>{r.receiver || "-"}</td>
                        <td>{formatDate(r.return_date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}

              {activeTab === "unreturned" && (
                <tbody>
                  {unreturned.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">ไม่พบรายการค้างคืน</td>
                    </tr>
                  ) : (
                    unreturned.map((item, index) => (
                      <tr key={item.request_id}>
                        <td>{item.request_id}</td>
                        <td>{item.product_name}</td>
                        <td>{item.full_name || `${item.frist_name} ${item.last_name}`}</td>
                        <td colSpan="3">-</td>
                        <td>-</td>
                        <td>{item.purpose || "-"}</td>
                        <td>-</td>
                        <td><span className="text-danger fw-bold">❌ ค้างคืน</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}

              {activeTab === "overdue" && (
                <tbody>
                  {unreturned.filter(item => new Date(item.due_return_date) < new Date()).length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-muted">ไม่พบรายการที่เลยกำหนด</td>
                    </tr>
                  ) : (
                    unreturned
                      .filter(item => new Date(item.due_return_date) < new Date())
                      .map((item, index) => (
                        <tr key={item.request_id}>
                          <td>{item.request_id}</td>
                          <td>{item.product_name}</td>
                          <td>{item.full_name || `${item.frist_name} ${item.last_name}`}</td>
                          <td colSpan="3">-</td>
                          <td className="text-danger fw-bold">{calculateFine(item.due_return_date, item.quantity).toLocaleString()} บาท</td>
                          <td>{item.purpose || "-"}</td>
                          <td>-</td>
                          <td>{formatDate(item.due_return_date)}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              )}
            </Table>

            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
              </ul>
            </nav>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default ReturnHistory;
