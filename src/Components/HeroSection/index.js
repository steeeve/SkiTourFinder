import React, {useState} from "react";
import styled from "styled-components";
import { MdKeyboardArrowRight, MdArrowForward } from "react-icons/md";
//import { Button } from '../ButtonElement';
import { ButtonR } from '../ButtonRElement';



const HeroContainer = styled.div`
    background: #0c0c0c;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 30px;
    height: 400px;
    position: relative;
    z-index: 1;


`

const HeroBg = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;

        :before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            180deg, 
            rgba(0,0,0,0.1) 0%, 
            rgba(0,0,0,0.3) 100%
            ), 
            linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%);
        z-index: 2;
    }

`

const VideoBg = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: cover;
    background: #232a34;
`

const HeroContent = styled.div`
    z-index: 3;
    max-width: 1200px;
    position: absolute;
    padding: 8px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    opacity: 1;
   
`

const HeroH1 = styled.h1`
    color: #ffffff;
    font-size: 48px;
    text-align: center;

    @media screen and (max-width: 768px) {
        font-size: 40px;
    }

    @media screen and (max-width: 480px) {
        font-size: 32px;
    }
`

const HeroP = styled.p`
    margin-top: 24px;
    color: #ffffff;
    font-size: 24px;
    text-align: center;
    max-width: 600px;

    @media screen and (max-width: 768px) {
        font-size: 24px;
    }

    @media screen and (max-width: 480px) {
        font-size: 18px;
    }
`

const HeroBtnWrapper = styled.div`
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const ArrowForward = styled(MdArrowForward)`
    margin-left: 8px;
    font-size: 20px;
`

const ArrowRight = styled(MdKeyboardArrowRight)`
    margin-left: 8px;
    font-size: 20px;
`


const HeroElements = () => {
    const [hover, setHover] = useState(false);

    const onHover = () => {
        setHover(!hover)
    };

    return (
        <HeroContainer>
            <HeroBg>
                <VideoBg autoPlay loop muted src='/videos/video2.mp4' type = 'video/mp4' />
            </HeroBg>
            <HeroContent>
                <HeroH1>Backcountry Objectives</HeroH1>
                <HeroP>
                    Get out there!
                </HeroP>

                <HeroBtnWrapper>

                    
                    <ButtonR 
                        to="/signup" 
                        onMouseEnter={onHover} 
                        onMouseLeave={onHover}
                        primary='true'
                        dark='true'
                    >
                        Sign-up {hover ? <ArrowForward /> : <ArrowRight />}
                    </ButtonR>
                

                </HeroBtnWrapper>
            </HeroContent>
        </HeroContainer>

    )
}

export default HeroElements