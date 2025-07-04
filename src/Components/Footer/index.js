import React from 'react';
import styled from 'styled-components';
import { FaGithub } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa';

const FooterContainer = styled.footer`
  background: #000;
  color: #fff;
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const FooterText = styled.p`
  font-size: 1rem;
  color: #fff;
  margin: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const FooterLink = styled.a`
  color: #01bf71;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: #fff;
    transform: translateY(-2px);
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          © 2025 SkiTourFinder. Built with ❤️ by Steven Chang
        </FooterText>
        <FooterLinks>
          <FooterLink 
            href="https://github.com/steeeve" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaGithub size={20} />
            GitHub
          </FooterLink>
          <FooterLink 
            href="https://steeeve.github.io/Website/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FaGlobe size={20} />
            Website
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 