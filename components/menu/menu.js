import ActiveLink from '../active-link/active-link';

const Menu = () => {
  return (
    <nav>
      <ul>
        <li>
          <ActiveLink href='/'>
            Main
          </ActiveLink>
        </li>
        <li>
          <ActiveLink href='/dashboard'>
            Dashboard
          </ActiveLink>
        </li>
        <li>
          <ActiveLink href='/user'>
            User
          </ActiveLink>
        </li>
      </ul>
    </nav>
  )
}

export default Menu;