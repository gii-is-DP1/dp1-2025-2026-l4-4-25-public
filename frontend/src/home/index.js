import React, {useEffect} from 'react';
import '../App.css';
import '../static/css/home/home.css';
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate('/login');
    }, [navigate]);

    return null;
}