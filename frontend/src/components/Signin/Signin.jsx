import { useState, useContext } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signin() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      setErrorMessage(""); // ล้าง error ถ้าเข้าสำเร็จ
      navigate('/Home');
    } catch (error) {
      console.error(error);
      setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
    }
  };
  

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#e8f5e9" }} >
      <Card
        style={{
          width: "350px",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Card.Body>
          <h3 className="text-center" style={{ color: "#2e7d32" }}>
            เข้าสู่ระบบ
          </h3>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>อีเมล</Form.Label>
              <Form.Control
                type="email"
                placeholder="อีเมล"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
          <Form.Label style={{ fontWeight: "bold", color: "#2e7d32" }}>
    รหัสผ่าน
  </Form.Label>
  <div style={{ position: "relative", borderRadius: "8px" }}>
    <Form.Control
      type={showPassword ? "text" : "password"}
      placeholder="กรอกรหัสผ่านของคุณ"
      style={{
        border: errorMessage ? "1px solid #d32f2f" : "1px solid #ccc",
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
  {errorMessage && (
    <div style={{ color: "#d32f2f", marginTop: "8px", fontSize: "14px" }}>
      {errorMessage}
    </div>
  )}
</Form.Group>


            <Button variant="success" type="submit" className="w-100">
              เข้าสู่ระบบ
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Signin;
