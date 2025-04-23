import React, { useState, useEffect, useContext } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Swal from "sweetalert2";

const Signup = () => {
  const [formData, setFormData] = useState({
    frist_name: "",
    last_name: "",
    prefix_name: "",
    email: "",
    team: "",
    phone: "",
    birthDate: "",
    username: "",
    password: "",
    role_id: 2,
  });

  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/Signup");
  }, [auth]);

  const validateForm = () => {
    const { frist_name, last_name, email, phone, username, password } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    if (!frist_name || !last_name || !email || !phone || !username || !password) {
      Swal.fire("กรอกข้อมูลไม่ครบ", "กรุณากรอกทุกช่องให้ครบถ้วน", "warning");
      return false;
    }

    if (!emailRegex.test(email)) {
      Swal.fire("อีเมลไม่ถูกต้อง", "โปรดตรวจสอบรูปแบบอีเมล", "warning");
      return false;
    }

    if (!phoneRegex.test(phone)) {
      Swal.fire("เบอร์โทรไม่ถูกต้อง", "กรุณาใส่เบอร์โทร 10 หลัก", "warning");
      return false;
    }

    if (!usernameRegex.test(username)) {
      Swal.fire("ชื่อผู้ใช้ไม่ถูกต้อง", "ห้ามมีช่องว่างหรืออักขระพิเศษ", "warning");
      return false;
    }

    if (password.length < 6) {
      Swal.fire("รหัสผ่านสั้นเกินไป", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", "warning");
      return false;
    }

    return true;
  };

  const addMember = () => {
    axios
      .get(`http://localhost:3001/check-duplicate?email=${formData.email}&username=${formData.username}`)
      .then((res) => {
        const { emailExists, usernameExists } = res.data;
        if (emailExists || usernameExists) {
          Swal.fire({
            icon: "warning",
            title: "ข้อมูลซ้ำ",
            html: `${emailExists ? "อีเมลนี้ถูกใช้แล้ว<br/>" : ""}${usernameExists ? "ชื่อผู้ใช้นี้มีคนใช้แล้ว" : ""}`,
          });
          return;
        }

        axios
          .post("http://localhost:3001/users", formData)
          .then(() => {
            Swal.fire({
              icon: "success",
              title: "สร้างบัญชีผู้ใช้งานสำเร็จ",
              text: "บัญชีผู้ใช้ถูกสร้างเรียบร้อยแล้ว",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "ตกลง",
            });
            setFormData({
              frist_name: "",
              last_name: "",
              prefix_name: "",
              email: "",
              team: "",
              phone: "",
              birthDate: "",
              username: "",
              password: "",
              role_id: 2,
            });
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              icon: "error",
              title: "เกิดข้อผิดพลาด",
              text: "ไม่สามารถลงทะเบียนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
            });
          });
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถตรวจสอบข้อมูลซ้ำได้ กรุณาลองใหม่",
        });
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 10) {
        setFormData({ ...formData, [name]: digits });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addMember();
  };

  const today = new Date();
  const minBirthDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split("T")[0];
  const maxBirthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0];

  return (
    <div className="d-flex flex-column flex-lg-row">
      <Navbar />
      <Container className="py-4" style={{ backgroundColor: "#F5F5F5", minHeight: "100vh", marginTop: "80px" }}>
        <Card className="p-4 mx-auto mt-3" style={{maxWidth: "800px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
          <h3 className="col-12 text-center mb-3" style={{ color: "#2e7d32" }}>
            สร้างบัญชีผู้ใช้งาน
          </h3>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>คำนำหน้า</Form.Label>
                <Form.Control as="select" name="prefix_name" value={formData.prefix_name} onChange={handleChange}>
                  <option value=""></option>
                  <option value="นาย">นาย</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="นาง">นาง</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>ชื่อ</Form.Label>
                <Form.Control type="text" name="frist_name" value={formData.frist_name} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="row">
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>นามสกุล</Form.Label>
                <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>อีเมล</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="row">
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>ทีม</Form.Label>
                <Form.Control as="select" name="team" value={formData.team} onChange={handleChange}>
                  <option value="">เลือกทีม</option>
                  <option value="ทีม A">ทีม A</option>
                  <option value="ทีม B">ทีม B</option>
                  <option value="ทีม C">ทีม C</option>
                  <option value="ทีม E">ทีม E</option>
                  <option value="ทีม F">ทีม F</option>
                  <option value="ทีม G">ทีม G</option>
                  <option value="ทีม H">ทีม H</option>
                  <option value="ทีม I">ทีม I</option>
                  <option value="ทีม J">ทีม J</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>เบอร์โทรศัพท์</Form.Label>
                <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="row">
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>วันเกิด</Form.Label>
                <Form.Control type="date" name="birthDate" min={minBirthDate} max={maxBirthDate} value={formData.birthDate} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="col-12 col-lg-6 mb-3">
                <Form.Label>ชื่อผู้ใช้(username)</Form.Label>
                <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="row">
              <Form.Group className="col-12 mb-3">
                <Form.Label>รหัสผ่าน</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="กรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร" />
              </Form.Group>
            </div>
            <div className="row d-flex justify-content-center">
              <Button variant="success" type="submit" className="w-100" style={{ maxWidth: "500px" }}>
                ลงทะเบียน
              </Button>
            </div>
            
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default Signup;
