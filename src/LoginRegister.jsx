// Archivo eliminado para reinicio total.
import React, { useState } from "react";
import "./LoginRegister.css";

function LoginRegister() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container">
            <div className="left-panel">
                <div className="decorative-image">
                    <svg
                        width="180"
                        height="180"
                        viewBox="0 0 180 180"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="90"
                            cy="90"
                            r="80"
                            fill="url(#radialGreen)"
                            opacity="0.3"
                        />
                        <path
                            d="M90 40 L130 90 L90 140 L50 90 Z"
                            fill="#00ff99"
                            opacity="0.7"
                        />
                        <circle cx="90" cy="90" r="30" fill="#1a2a3a" opacity="0.7" />
                        <defs>
                            <radialGradient
                                id="radialGreen"
                                cx="0"
                                cy="0"
                                r="1"
                                gradientTransform="translate(90 90) scale(80)"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#00ff99" />
                                <stop offset="1" stopColor="#1a2a3a" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
                <div className="logo-text">Secure Portal</div>
            </div>
            <div className={`right-panel ${isLogin ? "login" : "register"}`}>
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`,
                                animationDelay: `${Math.random() * 4}s`,
                            }}
                        />
                    ))}
                </div>
                <div className="form-box">
                    <div className="avatar"></div>
                    <h2>{isLogin ? "Login System" : "Register System"}</h2>
                    <form>
                        <input type="email" placeholder="E-mail" required />
                        <input type="password" placeholder="Password" required />
                        {!isLogin && <input type="text" placeholder="Username" required />}
                        <button type="submit">{isLogin ? "Login" : "Register"}</button>
                    </form>
                    <div className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin
                            ? "No account? Register"
                            : "Already have an account? Login"}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginRegister;
