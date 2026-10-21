import { createContext, useContext, useState, useEffect } from "react";
import { OAuthProvider } from "appwrite";
import { account } from "../appwrite/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        handleOAuthCallbackAndInit();
    }, []);

    const handleOAuthCallbackAndInit = async () => {
        // Check if this is an OAuth callback (Appwrite redirects back with userId & secret in URL)
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const secret = urlParams.get('secret');

        if (userId && secret) {
            try {
                // Exchange the token for a real session
                await account.createSession(userId, secret);
                // Clean the URL params after successful session creation
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('OAuth session creation failed:', error);
            }
        }

        // Now check user status (whether from OAuth or existing session)
        await checkUserStatus();
    };

    const checkUserStatus = async () => {
        try {
            const accountDetails = await account.get();
            setUser(accountDetails);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = () => {
        // Use createOAuth2Token (correct for Appwrite SDK v13+)
        // It redirects back to the app with userId & secret in URL params
        const redirectUrl = window.location.origin;
        const failureUrl = `${window.location.origin}/login`;
        account.createOAuth2Token(OAuthProvider.Google, redirectUrl, failureUrl);
    };

    const registerWithEmail = async (email, password, name) => {
        try {
            await account.create('unique()', email, password, name);
            await loginWithEmail(email, password);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            await checkUserStatus();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const contextData = {
        user,
        loading,
        loginWithGoogle,
        registerWithEmail,
        loginWithEmail,
        logoutUser,
        checkUserStatus
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0c0e16' }}>
                    <h2 style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}>Loading...</h2>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
