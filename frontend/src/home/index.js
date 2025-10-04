import React, {useEffect} from 'react';
import '../App.css';
import logo from '../static/images/Foto_logo.jpg';
import '../static/css/home/home.css';
import { useNavigate } from "react-router-dom";
import tokenService from "../services/token.service";

export default function Home() {
    //const jwt = tokenService.getLocalAccessToken();

    const navigate = useNavigate();
    /*useEffect(() => {
        if (jwt) {
            navigate('/lobby');
        } else {
            navigate('/login');
        }
    }, [jwt, navigate]);*/
    useEffect(() => {
        navigate('/login'); // siempre va a login al iniciar
    }, [navigate]);


}