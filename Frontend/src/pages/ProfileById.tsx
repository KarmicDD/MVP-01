import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { profileService } from '../services/api';
import { LoadingSpinner } from '../components/Loading';
import { toast } from 'react-hot-toast';

const ProfileById: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileById = async () => {
            if (!userId) {
                navigate('/dashboard');
                return;
            }

            try {
                setLoading(true);
                console.log(`Fetching profile for userId: ${userId}`);

                // Try to get the profile directly using the userId
                try {
                    const profileResponse = await fetch(`https://mvp-01.onrender.com/api/profile/public/${userId}`);

                    if (profileResponse.ok) {
                        const data = await profileResponse.json();
                        if (data && data.profile && data.profile.companyName) {
                            // Redirect to the username-based URL
                            navigate(`/${encodeURIComponent(data.profile.companyName)}`, { replace: true });
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching profile directly:', error);
                }

                // If direct fetch fails, try searching
                try {
                    // Try to search for startups with the userId
                    const startupResponse = await fetch(`https://mvp-01.onrender.com/api/search/startups?userId=${userId}`);

                    if (startupResponse.ok) {
                        const data = await startupResponse.json();
                        if (data && data.startups && data.startups.length > 0) {
                            const matchingProfile = data.startups[0];
                            if (matchingProfile.companyName) {
                                // Redirect to the username-based URL
                                navigate(`/${encodeURIComponent(matchingProfile.companyName)}`, { replace: true });
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error searching startups:', error);
                }

                try {
                    // Try to search for investors with the userId
                    const investorResponse = await fetch(`https://mvp-01.onrender.com/api/search/investors?userId=${userId}`);

                    if (investorResponse.ok) {
                        const data = await investorResponse.json();
                        if (data && data.investors && data.investors.length > 0) {
                            const matchingProfile = data.investors[0];
                            if (matchingProfile.companyName) {
                                // Redirect to the username-based URL
                                navigate(`/${encodeURIComponent(matchingProfile.companyName)}`, { replace: true });
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error searching investors:', error);
                }

                // If we get here, we couldn't find a matching profile
                toast.error('Profile not found');
                navigate('/dashboard');
            } catch (error) {
                console.error('Error fetching profile by ID:', error);
                toast.error('Error loading profile');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileById();
    }, [userId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return null; // This component will redirect, so no need to render anything
};

export default ProfileById;
