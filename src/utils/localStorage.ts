// utils/localStorage.ts

// Store user info in local storage (handling both login and register data)
export const setUserInfoInLocalStorage = (
    companyName: string | null,
    email: string,
    logo: string,
    businessName?: string,
    buisnessEmail?: string,
    buisnessWebsite?: string
) => {
    // Login flow data
    if (companyName) localStorage.setItem('companyName', companyName);
    if (email) localStorage.setItem('email', email);
    if (logo) localStorage.setItem('logo', logo);

    // Register flow data
    if (businessName) localStorage.setItem('businessName', businessName);
    if (buisnessEmail) localStorage.setItem('buisnessEmail', buisnessEmail);
    if (buisnessWebsite) localStorage.setItem('buisnessWebsite', buisnessWebsite);
};

// Retrieve user info from local storage (handling both login and register data)
export const getUserInfoFromLocalStorage = () => {
    const companyName = localStorage.getItem('companyName');
    const email = localStorage.getItem('email');
    const logo = localStorage.getItem('logo');

    const businessName = localStorage.getItem('businessName');
    const buisnessEmail = localStorage.getItem('buisnessEmail');
    const buisnessWebsite = localStorage.getItem('buisnessWebsite');

    return { companyName, email, logo, businessName, buisnessEmail, buisnessWebsite };
};

// Clear user info from local storage (handling both login and register data)
export const clearUserInfoFromLocalStorage = () => {
    localStorage.removeItem('companyName');
    localStorage.removeItem('email');
    localStorage.removeItem('logo');

    localStorage.removeItem('businessName');
    localStorage.removeItem('buisnessEmail');
    localStorage.removeItem('buisnessWebsite');
};
