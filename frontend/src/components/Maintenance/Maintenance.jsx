import { useState, useContext, useEffect } from "react";
import { Container, Card, Table, Form, Button, Row, Col, Modal } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTools, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
const apiUrl = import.meta.env.VITE_API_URL;

function Maintenance() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [repairData, setRepairData] = useState({ responsible_person: "", cost: "", repair_date: "" });

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { user } = auth;

  useEffect(() => {
    if (!user) return;
    fetchMaintenance();
  }, [auth]);

  const fetchMaintenance = () => {
    axios.get(`${apiUrl}/maintenance-record`).then((response) => {
      setHistory(response.data);
    });
  };

  const updateStatus = (id, status_name) => {
    axios.put(`${apiUrl}/maintenance-record/${id}`, { status_name }).then(() => {
      fetchMaintenance();
    });
  };

  const handleSaveRepair = () => {
    axios.put(`${apiUrl}/maintenance/update-repair/${selectedRecord.record_id}`, repairData)
      .then(() => {
        setShowModal(false);
        setRepairData({ responsible_person: "", cost: "", repair_date: "" });
        fetchMaintenance();
      });
  };

  const DateComponent = ({ dateString }) => {
    const formattedDate = new Date(dateString).toLocaleDateString("th-TH");
    return formattedDate;
  };

  const filteredData = history.filter((item) => {
    const fullName =
      item.full_name && item.full_name.trim() !== ""
        ? item.full_name
        : `${item.frist_name || ""} ${item.last_name || ""}`;
  
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      fullName.toLowerCase().includes(search.toLowerCase());
  
    const matchesStatus = filter === "" || item.status_name === filter;
  
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const statusOptions = ["รอการอนุมัติ", "กำลังดำเนินการ", "ดำเนินการเสร็จสิ้น"];

  const statusIcon = (status) => {
    if (status === "รอการอนุมัติ") return <FaHourglassHalf color="orange" />;
    if (status === "กำลังดำเนินการ") return <FaTools color="blue" />;
    if (status === "ดำเนินการเสร็จสิ้น") return <FaCheckCircle color="green" />;
  };

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
        <Card className="p-4 w-100">
          <h4 className="text-center mb-4" style={{ color: "#2e7d32" }}>รายการซ่อมทรัพย์สิน</h4>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Control
                type="text"
                placeholder="🔍 ค้นหารายการทรัพย์สิน หรือชื่อผู้ใช้งาน..."
                value={search}
                style={{ width: "360px" }}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: "250px" }}
              >
                <option value="">-- กรุณาเลือกสถานะ --</option>
                {statusOptions.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>คำร้อง</th>
                <th>ผู้ใช้งาน</th>
                <th>ทรัพย์สิน</th>
                <th>วันที่แจ้งซ่อม</th>
                <th>รายละเอียด</th>
                <th>สถานะ</th>
                <th>ผู้รับผิดชอบ</th>
                <th>ค่าใช้จ่าย</th>
                <th>วันซ่อมเสร็จ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record) => (
                <tr key={record.record_id}>
                  <td>{record.record_id}</td>
                  <td>
                    {record.full_name && record.full_name.trim() !== ""
                      ? record.full_name
                      : `${record.frist_name || ""} ${record.last_name || ""}`.trim() || "-"}
                  </td>
                  <td>{record.name}</td>
                  <td><DateComponent dateString={record.maintenance_date} /></td>
                  <td>{record.description}</td>
                  <td>{statusIcon(record.status_name)} {record.status_name}</td>
                  <td>{record.responsible_person || "-"}</td>
                  <td>{record.cost || "-"}</td>
                  <td>{record.repair_date ? <DateComponent dateString={record.repair_date} /> : "-"}</td>
                  <td>
                    {record.status_name === "รอการอนุมัติ" && (
                      <Button variant="success" className="w-100 my-1" onClick={() => updateStatus(record.record_id, "กำลังดำเนินการ")}>
                        อนุมัติ
                      </Button>
                    )}
                    {record.status_name === "กำลังดำเนินการ" && (
                      <Button variant="info" className="w-100 my-1" onClick={() => { setShowModal(true); setSelectedRecord(record); }}>
                        บันทึกผลซ่อม
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination แบบตัวเลข */}
          <div className="d-flex justify-content-center mt-3">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "primary" : "outline-secondary"}
                className="mx-1"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </Card>

        {/* Modal บันทึกผลซ่อม */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton><Modal.Title>บันทึกผลการซ่อม</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ผู้รับผิดชอบ</Form.Label>
                <Form.Control type="text" value={repairData.responsible_person} onChange={(e) => setRepairData({ ...repairData, responsible_person: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ค่าใช้จ่าย</Form.Label>
                <Form.Control type="number" value={repairData.cost} onChange={(e) => setRepairData({ ...repairData, cost: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>วันที่ซ่อมเสร็จ</Form.Label>
                <Form.Control type="date" value={repairData.repair_date} onChange={(e) => setRepairData({ ...repairData, repair_date: e.target.value })} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button variant="primary" onClick={handleSaveRepair}>บันทึก</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Maintenance;
