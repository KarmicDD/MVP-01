// ../components/Auth/Logo.tsx
import React from "react";
import { colours } from "../../utils/colours";

interface LogoProps {
    Title: string;
}

export const Logo: React.FC<LogoProps> = ({ Title = "KarmicDD" }) => {
    return (
        <div className="flex justify-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: colours.primaryBlue }}>{Title}</h1>
        </div>
    );
}