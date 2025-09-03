import { useState, useEffect } from "react";

const useDashboardLogic = () => {
    const [isSidebarHidden, setSidebarHidden] = useState(window.innerWidth <= 576);
    const [isSearchFormShown, setSearchFormShown] = useState(false);
    const [isDarkMode, setDarkMode] = useState(false);
    const [isNotificationMenuOpen, setNotificationMenuOpen] = useState(false);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setSidebarHidden(window.innerWidth <= 576);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Adjust on mount

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarHidden((prev) => !prev);
    };

    const toggleSearchForm = (e) => {
        e.preventDefault();
        setSearchFormShown((prev) => !prev);
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    const toggleNotificationMenu = () => {
        setNotificationMenuOpen((prev) => !prev);
        setProfileMenuOpen(false); // Close profile menu if open
    };

    const toggleProfileMenu = () => {
        setProfileMenuOpen((prev) => !prev);
        setNotificationMenuOpen(false); // Close notification menu if open
    };

    const closeMenus = (e) => {
        if (!e.target.closest(".notification") && !e.target.closest(".profile")) {
            setNotificationMenuOpen(false);
            setProfileMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", closeMenus);
        return () => {
            document.removeEventListener("click", closeMenus);
        };
    }, []);

    return {
        isSidebarHidden,
        toggleSidebar,
        isSearchFormShown,
        toggleSearchForm,
        isDarkMode,
        toggleDarkMode,
        isNotificationMenuOpen,
        toggleNotificationMenu,
        isProfileMenuOpen,
        toggleProfileMenu,
    };
};

export default useDashboardLogic;