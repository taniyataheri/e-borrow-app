import { useState, useContext } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/logo.png"; //
import axios from "axios";
import Swal from "sweetalert2";

function forgot() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Cpassword, setCPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const handleRepassword = async (e) => {
    e.preventDefault();
  
    if (password !== Cpassword) {
      setErrorMessage("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่");
      return; // ถ้าไม่ตรงกัน ไม่ต้องส่งไป backend
    }
  
    try {
      const response = await axios.post("http://localhost:3001/forgot-password", {
        email,
        password,     // อย่าลืม เปลี่ยนเป็น newPassword ตามที่ backend รอ
        Cpassword, // และ confirmPassword ด้วย
      });
      setErrorMessage(""); 
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่",
        confirmButtonColor: "#2e7d32",
      }).then(() => {
        navigate("/");
      });
      
    } catch (error) {
      console.error(error);
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    }
  };
  const isErrorBorder = errorMessage && errorMessage !== "อีเมลไม่ถูกต้อง หรือไม่มีในระบบ";

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card
        style={{
          width: "100%",
          maxWidth: "350px",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Card.Body>
          <div className="row d-flex-column align-items-center justify-content-center">
            <img src={logo} alt="TLC Logo" style={{ width: "200px", objectFit: "contain", }}/>
          </div>
          
          <h3 className="text-center" style={{ color: "#2e7d32" }}>
            รีเซ็ตรหัสผ่าน
          </h3>
          <Form onSubmit={handleRepassword}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>อีเมล</Form.Label>
          <Form.Control
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={errorMessage === "อีเมลไม่ถูกต้อง หรือไม่มีในระบบ"}
          />
          </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{ fontWeight: "bold", color: "#2e7d32" }}>รหัสผ่านใหม่</Form.Label>
              <div style={{ position: "relative", borderRadius: "8px" }}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  style={{
                    border: isErrorBorder ? "1px solid #d32f2f" : "1px solid #ccc",
                    paddingRight: "40px",
                    paddingLeft: "12px",
                    height: "45px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#f7fdf9",
                    transition: "all 0.3s ease",
                  }}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6c757d",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label style={{ fontWeight: "bold", color: "#2e7d32" }}>ยืนยันรหัสผ่านใหม่</Form.Label>
              <div style={{ position: "relative", borderRadius: "8px" }}>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  style={{
                    border: isErrorBorder ? "1px solid #d32f2f" : "1px solid #ccc",
                    paddingRight: "40px",
                    paddingLeft: "12px",
                    height: "45px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    backgroundColor: "#f7fdf9",
                    transition: "all 0.3s ease",
                  }}
                  onChange={(e) => setCPassword(e.target.value)}
                />
                <span
                  onClick={() => setConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6c757d",
                    fontSize: "18px",
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </Form.Group>
            {errorMessage && <div className="mb-3 text-center" style={{ color: "#d32f2f", marginTop: "8px", fontSize: "14px" }}>{errorMessage}</div>}
            <Button variant="success" type="submit" className="mb-3 w-100">
              รีเซ็ตรหัสผ่าน
            </Button>

            <div className="row d-flex justify-content-center">
              <div className="12">
                <p className="text-center" style={{ color: "#2e7d32" }}>
                  ต้องการเข้าสู่ระบบ?&nbsp;&nbsp;&nbsp;
                  <span style={{ fontWeight: "bold" }}>
                    <a href="/" style={{ textDecoration: "none", color: "#2e7d32" }}>
                      คลิก
                    </a>
                  </span>
                </p>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default forgot;
