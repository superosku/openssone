import './MainMenu.scss'
import {Link} from "react-router-dom";
import React from "react";

export const MainMenu = () => {
  return <nav className={'main-menu'}>
    <ul>
      <li><Link to={'/'}>Try</Link></li>
      <li><Link to={'/generated'}>Generated</Link></li>
      <li><Link to={'/pieces'}>Pieces</Link></li>
      <li><Link to={'/games'}>Games</Link></li>
    </ul>
  </nav>
}
