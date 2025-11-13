import { useDispatch } from "react-redux";
import { Menu } from "lucide-react";
import { toggleSidebar } from "../redux/actions/sidebarActions";
import { useCallback } from "react";

const Header = () => {
  const dispatch = useDispatch();
  const logout = useCallback(() => {
    window.catalyst.auth.signOut("/");
  }, []);
  return (

    <header>
      <button
        className="p-3 focus:outline-none"
        onClick={() => dispatch(toggleSidebar())}
      >
        <Menu size={30} />
      </button>
    </header>
  );
};

export default Header;
