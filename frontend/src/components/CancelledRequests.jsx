import { useEffect, useState, useContext } from "react";
import { Container, Card, Table } from "react-bootstrap";
import Navbar from "../components/Navbar/Navbar";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import Swal from "sweetalert2";

function CancelHistory() {
  const [canceledList, setCanceledList] = useState([]);
  const { user, token } = useContext(AuthContext); // ✅ ต้องมีบรรทัดนี้
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user || !token) return; // ✅ รอให้ user/token พร้อมก่อน
  
    axios
      .get("http://localhost:3001/cancel-history", {
        headers: {
          Authorization: token, // ✅ ส่ง token ไปกับ header
        },
      })
      .then((res) => {
        setCanceledList(res.data);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถโหลดข้อมูลได้",
          text: err.response?.data?.message || "เกิดข้อผิดพลาด",
        });
      });
  }, [user, token]);
  
  

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const filteredList = canceledList.filter((item) => {
      const fullName =
        item.full_name && item.full_name.trim() !== ""
          ? item.full_name
          : `${item.frist_name || ""} ${item.last_name || ""}`.trim();
    
      const searchLower = searchTerm.toLowerCase();
    
      return (
        fullName.toLowerCase().includes(searchLower) ||
        item.team?.toLowerCase().includes(searchLower) ||
        item.product_name?.toLowerCase().includes(searchLower)
      );
    });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
        <Card className="p-4 w-100">
          <h4 className="text-center mb-4" style={{ color: "#c62828" }}>
            รายการที่ถูกยกเลิก
          </h4>

          {/* 🔍 Search Bar ชิดซ้าย */}
          <div className="d-flex justify-content-start mb-3">
            <input
              type="text"
              placeholder="🔍 ค้นหาทรัพย์สิน / ผู้ยืม / ทีม"
              className="form-control"
              style={{ width: "350px" }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>คำขอ</th>
                <th>ผู้ยืม</th>
                <th>ทีม</th>
                <th>ทรัพย์สิน</th>
                <th>จำนวน</th>
                <th>วันที่ยืม</th>
                <th>วัตถุประสงค์</th>
                <th>เหตุผลที่ยกเลิก</th>
                <th>ผู้ยกเลิก</th>
                <th>วันที่ยกเลิก</th>
              </tr>
            </thead>
            <tbody>
              {paginatedList.map((item, index) => (
                <tr key={index}>
                  <td>{item.request_id}</td>
                  <td>
                      {item.full_name && item.full_name.trim() !== ""
                        ? item.full_name
                        : `${item.frist_name || ""} ${item.last_name || ""}`.trim() || "-"}
                  </td>
                  <td>{item.team}</td>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatDate(item.request_date)}</td>
                  <td>{item.purpose || "-"}</td>
                  <td>{item.cancel_reason || "-"}</td>
                  <td>{item.canceled_by || "-"}</td>
                  <td>{formatDate(item.updated_date)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* 📄 Pagination */}
          <nav className="d-flex justify-content-center mt-3">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  «
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  »
                </button>
              </li>
            </ul>
          </nav>
        </Card>
      </Container>
    </div>
  );
}

export default CancelHistory;
