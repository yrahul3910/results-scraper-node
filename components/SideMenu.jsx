﻿import React from "react";
import { NavLink } from "react-router-dom";

class SideMenu extends React.Component {
    render() {
        return (
            <div className='main-nav'>
                <div className='navbar navbar-inverse'>
                    <div className='navbar-header'>
                        <button type='button' className='navbar-toggle' data-toggle='collapse' data-target='.navbar-collapse'>
                            <span className='sr-only'>Toggle navigation</span>
                            <span className='icon-bar'></span>
                            <span className='icon-bar'></span>
                            <span className='icon-bar'></span>
                        </button>
                        <h3 style={{
                            marginTop: "10px", marginBottom: "10px", marginLeft: "5px",
                            color: "red", fontFamily: "'Segoe UI', 'sans-serif'"
                        }}>PESIT South Campus</h3>
                    </div>
                    <div className='navbar-collapse collapse'>
                        <ul className='nav navbar-nav'>
                            <li>
                                <NavLink to={"/"} exact activeClassName='active'>
                                    Home
                                </NavLink>
                                <NavLink to={"/individual"} exact activeClassName='active'>
                                    Individual Result
                                </NavLink>
                                <NavLink to={"/batch"} exact activeClassName='active'>
                                    Batch Result
                                </NavLink>
                                <NavLink to={"/update"} exact activeClassName='active'>
                                    Update Reval Results
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default SideMenu;
