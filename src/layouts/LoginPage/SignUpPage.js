import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

function SignUpPage({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const cookies = new Cookies();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== repeatPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/create-account', null, {
                params: { username, password, password1: repeatPassword, email }
            });
            if (response.data.success) {
                setSuccess(true);
                setError('');
                // Attempt to login after successful sign up
                await handleLogin(username, password);
            } else {
                setError('Sign up failed. Error code: ' + response.data.errorCode);
                setSuccess(false);
            }
        } catch (error) {
            setError('Sign up failed. Please try again later.');
            setSuccess(false);
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8080/login', null, {
                params: { username, password }
            });
            if (response.data.success && response.data.secret) {
                const { secret } = response.data;
                cookies.set('secret', secret, { path: '/' });
                const userResponse = await axios.post('http://localhost:8080/get-user', null, {
                    params: { secret }
                });
                const user = userResponse.data;
                onLoginSuccess(user);
                navigate('/dashboard'); // Navigate to dashboard on successful login
            } else {
                setError('Login after sign up failed. Please try to login manually.');
            }
        } catch (error) {
            setError('Login after sign up failed. Please try to login manually.');
        }
    };

    return (
        <div className="container mt-5">
            <h3>Sign Up</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Username</label>
                    <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Repeat Password</label>
                    <input type="password" className="form-control" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>Sign up successful! Redirecting...</p>}
                <button type="submit" className="btn-primary">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUpPage;
