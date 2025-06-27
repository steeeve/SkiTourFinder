import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa';
import styled from 'styled-components';
import { Link as LinkR } from 'react-router-dom';
import { Link as LinkS } from 'react-scroll';
import supabase from '../../utils/supabaseClient';
import { animateScroll as scroll } from 'react-scroll';

// Filter out non-DOM props to prevent passing to DOM elements
const Nav = styled.nav.withConfig({
  shouldForwardProp: (prop) => !['scrollNav'].includes(prop)
})`
  background: ${({ scrollNav }) => (scrollNav ? '#000' : 'transparent')};
  height: 80px;
  margin-top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  transition: 0.8s all ease;

  @media screen and (max-width: 960px) {
    transition: 0.8s all ease;
  }
`;

const NavbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 80px;
  z-index: 1;
  width: 100%;
  padding: 0 24px;
  max-width: 1100px;
`;

const NavLogo = styled(LinkR).withConfig({
  shouldForwardProp: (prop) => !['scrollNav'].includes(prop)
})`
  color: ${({ scrollNav }) => (scrollNav ? '#fff' : 'transparent')};
  justify-self: flex-start;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  margin-left: 24px;
  font-weight: bold;
  text-decoration: none;
  transition: 0.8s all ease;
`;

const MobileIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => !['scrollNav'].includes(prop)
})`
  display: none;
  font-size: 2.2rem;
  transition: 0.8s all ease;

  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 20px;
    right: 20px;
    transform: translate(-100%, 60%);
    cursor: pointer;
    color: #fff;
    padding: 0px;
    color: ${({ scrollNav }) => (scrollNav ? '#000' : 'transparent')};
  }
`;

const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  text-align: center;
  margin-right: -22px;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.li`
  height: 80px;

  &:hover {
    transition: all 0.8s ease-in-out;
    background: ${({ scrollNav }) => (scrollNav ? '#fff000' : 'transparent')};
    color: #010606;
  }
`;

const NavLinks = styled(LinkS).withConfig({
  shouldForwardProp: (prop) => !['scrollNav', 'smooth', 'duration', 'spy', 'exact', 'offset'].includes(prop)
})`
  color: ${({ scrollNav }) => (scrollNav ? '#fff' : 'transparent')};
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  transition: color 0.8s ease, border-bottom 0.1s ease;

  &.active {
    border-bottom: 3px solid #0BF71;
  }
`;

const NavLinksRouter = styled(LinkR).withConfig({
  shouldForwardProp: (prop) => !['scrollNav', 'smooth', 'duration', 'spy', 'exact', 'offset'].includes(prop)
})`
  color: ${({ scrollNav }) => (scrollNav ? '#fff' : 'transparent')};
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 1rem;
  height: 100%;
  cursor: pointer;
  transition: color 0.8s ease, border-bottom 0.1s ease;

  &.active {
    border-bottom: 3px solid #0BF71;
  }
`;

const NavBtn = styled.nav`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const NavBtnLink = styled(LinkR)`
  border-radius: 50px;
  background: #01bf71;
  white-space: nowrap;
  padding: 10px 22px;
  color: #010606;
  font-size: 16px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;

  &:hover {
    transition: all 0.8s ease-in-out;
    background: #fff;
    color: #010606;
  }
`;

const SignOutButton = styled.button`
  border-radius: 50px;
  background: #01bf71;
  white-space: nowrap;
  padding: 10px 22px;
  color: #010606;
  font-size: 16px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;

  &:hover {
    transition: all 0.2s ease-in-out;
    background: #fff;
    color: #010606;
  }
`;

const Navbar = ({ toggle }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrollNav, setScrollNav] = useState(true);
  const [first, setfirst] = useState(true);

  useEffect(() => {
    // Check initial auth state
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Navbar Auth event:', event, 'Session:', session);
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  /*
  useEffect(() => {
    window.addEventListener('scroll', changeNav);
  }, []);
  
  const changeNav = () => {
    if (window.scrollY >= 99999) {
      setScrollNav(false);
    } else {
      setScrollNav(true);
    }
  };
  */

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error.message);
    } else {
      setIsAuthenticated(false);
    }
  };

  const toggleHome = () => {
    scroll.scrollToTop();
  };

  if (first) {
    setfirst(false);
    setScrollNav(true);
  }

  return (
    <>
      <Nav scrollNav={scrollNav}>
        <NavbarContainer>
          <NavLogo to="/" onClick={toggleHome} scrollNav={scrollNav}>
            Ski Tour Finder
          </NavLogo>
          <MobileIcon onClick={toggle} scrollNav={scrollNav}>
            <FaBars />
          </MobileIcon>
          <NavMenu>
            <NavItem>
              <NavLinks to="map" smooth="true" duration={500} spy="true" exact="true" offset={-80} scrollNav={scrollNav}>
                Map
              </NavLinks>
            </NavItem>
            <NavItem>
              <NavLinksRouter to="/profile" smooth="true" duration={500} spy="true" exact="true" offset={-80} scrollNav={scrollNav}>
                Profile
              </NavLinksRouter>
            </NavItem>
            <NavItem>
              <NavLinks to="services" smooth="true" duration={500} spy="true" exact="true" offset={-80} scrollNav={scrollNav}>
                Services
              </NavLinks>
            </NavItem>
            <NavItem>
              <NavLinks to="contact" smooth="true" duration={500} spy="true" exact="true" offset={-80} scrollNav={scrollNav}>
                Contact
              </NavLinks>
            </NavItem>
          </NavMenu>
          <NavBtn>
            {isAuthenticated ? (
              <SignOutButton onClick={handleSignOut}>
                Sign Out
              </SignOutButton>
            ) : (
              <NavBtnLink to="/signin">Sign In</NavBtnLink>
            )}
          </NavBtn>
        </NavbarContainer>
      </Nav>
    </>
  );
};

export default Navbar;