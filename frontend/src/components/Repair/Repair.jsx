import { useState, useContext, useEffect } from "react";
import { Container, Card, Table, Button, Form, Modal, OverlayTrigger, Tooltip, Row, Col } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Repair() {
  const { token } = useContext(AuthContext);
  const [returnList, setReturnList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [repairQuantity, setRepairQuantity] = useState(0);
  const [repairComment, setRepairComment] = useState("");

  // const fetchCategories = async () => {
  //   const response = await axios.get("http://localhost:3001/categories");
  //   setCategories(response.data);
  // };

  const fetchReturnDetail = () => {
    const url = "http://localhost:3001/return-detail";
    // console.log("ข้อมูลที่ได้:", url);
    axios
      .get(url, {
        headers: { Authorization: token },
      })
      .then((res) => setReturnList(res.data))
      .catch((err) => console.error("เกิดข้อผิดพลาด:", err));
  };
  useEffect(() => {
    fetchReturnDetail();
  }, []);
  const damagedReturns = returnList
    .filter((item) => item.status_name === "คืนของแล้ว/มีของชำรุด" || item.status_name === "คืนไม่ครบ/มีของชำรุด")
    .sort((a, b) => {
      if (a.returned_damaged === 0 && b.returned_damaged !== 0) return 1;
      if (a.returned_damaged !== 0 && b.returned_damaged === 0) return -1;
      const dateA = new Date(a.return_date);
      const dateB = new Date(b.return_date);
      return dateB - dateA;
    });

  console.log(damagedReturns);

  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdateRepair = async () => {
    if (!selectedItem) return;
    if (!repairQuantity || !repairComment) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งคำร้อง",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }
    try {
      await axios.put(`http://localhost:3001/repair/${selectedItem.return_id}`, {
        repaired_quantity: repairQuantity,
        repair_note: repairComment,
        product_id: selectedItem.product_id,
      });

      Swal.fire("สำเร็จ!", "อัปเดตรายการซ่อมเรียบร้อย", "success");
      setShowModal(false);
      fetchReturnDetail(); // รีโหลดข้อมูลหลังอัปเดต
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    }
  };
  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container
        className="py-4"
        style={{
          backgroundColor: "#F5F5F5",
          minHeight: "100vh",
          marginTop: "80px",
        }}
      >
        <Card>
          <Card.Body>
            <h4 className="text-center mb-3" style={{ color: "#2e7d32" }}>
              จัดการรายการชำรุด/เสียหาย
            </h4>

            <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
              <Form.Group controlId="search" style={{ maxWidth: "400px" }}>
                <Form.Control
                  type="text"
                  placeholder="🔍 ค้นหารายการทรัพย์สิน หรือชื่อผู้ใช้..."
                  className="form-control"
                  style={{ width: "350px" }}
                  onChange={(e) => {
                    setSearch(e.target.value); // อย่าลืมประกาศ useState สำหรับ search
                  }}
                />
              </Form.Group>
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ชื่อทรัพย์สิน</th>
                  <th>จำนวนดี</th>
                  <th>จำนวนชำรุด</th>
                  <th>จำนวนสูญหาย</th>
                  <th>หมายเหตุ</th>
                  <th>รายละเอียดการซ่อม</th>
                  <th>คืนโดย</th>
                  <th>รับโดย</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {damagedReturns.map((item, index) => (
                  <tr key={item.return_id}>
                    <td>{index + 1}</td>
                    <td>{item.product_name}</td>
                    <td>{item.returned_good}</td>
                    <td>{item.returned_damaged}</td>
                    <td>{item.returned_lost}</td>
                    <td>{item.note || "-"}</td>
                    <td>{item.repair_note || "-"}</td>
                    <td>{item.returned_by_name}</td>
                    <td>{item.received_by_name}</td>
                    {item.returned_damaged === 0 ? (
                      <>
                        <td>ซ่อมแซมหมดแล้ว</td>
                        <td>
                          <Button variant="warning" disabled onClick={() => handleShowModal(item)}>
                            อัพเดทสถานะ
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.status_name}</td>
                        <td>
                          <Button variant="warning" onClick={() => handleShowModal(item)}>
                            อัพเดทสถานะ
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>รายละเอียดการซ่อมแซม</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <p>
                <strong>ชื่อทรัพย์สิน:</strong> {selectedItem.product_name}
              </p>
              <p>
                <strong>จำนวนชำรุด:</strong> {selectedItem.returned_damaged}
              </p>
              <p>
                <strong>หมายเหตุ:</strong> {selectedItem.note || "-"}
              </p>
              <p>
                <strong>คืนโดย:</strong> {selectedItem.returned_by_name}
              </p>
              <p>
                <strong>รับโดย:</strong> {selectedItem.received_by_name}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>จำนวนที่ซ่อมเสร็จ</strong>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedItem.returned_damaged || 1}
                  value={repairQuantity}
                  onChange={(e) => {
                    // ตรวจสอบให้ไม่เกิน max และ min
                    let value = e.target.value;
                    if (value < 1) value = 1;
                    if (value > (selectedItem.returned_damaged || 1)) value = selectedItem.returned_damaged || 1;

                    setRepairQuantity(value); // อัปเดตค่าที่ถูกต้อง
                  }}
                />
                <Form.Text muted>มีทั้งหมด {selectedItem.returned_damaged || 0} รายการ</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <strong>รายละเอียดการซ่อมแซม</strong>
                </Form.Label>
                <Form.Control type="text" placeholder="ระบุรายละเอียดการซ่อมแซม" required onChange={(e) => setRepairComment(e.target.value)} />
              </Form.Group>
              {/* เพิ่มฟอร์มอัพเดทสถานะหากต้องการ */}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            ปิด
          </Button>
          <Button variant="success" onClick={handleUpdateRepair}>
            บันทึก
          </Button>
          {/* ปุ่มบันทึกสถานะหรืออื่น ๆ */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Repair;
