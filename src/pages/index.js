import React, {useState} from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import HeroElements from "../Components/HeroSection";
import MyMap from "../Components/Map";

const Home = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggle = () => {
        setIsOpen(!isOpen)
    }


    return (
        <>
            <Sidebar isOpen={isOpen} toggle={toggle}/>
            <Navbar toggle={toggle}/>
            <HeroElements />
            <MyMap />
        </>
    )
}

export default Home;