import React from "react";
import { motion } from 'framer-motion';
import { colours } from "../../utils/colours";

interface LogoProps {
    Title: string;
}

export const Logo: React.FC<LogoProps> = ({ Title = "KarmicDD" }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center mb-8 pt-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <motion.div
                whileHover={{
                    scale: 1.03,
                    rotate: [0, -2, 2, -2, 0],
                    transition: { duration: 0.5 }
                }}
            >
                <h1 className="text-3xl font-bold" style={{ color: colours.primaryBlue }}>
                    {Title}
                </h1>
                <motion.div
                    className="h-1 mt-1 rounded-full"
                    style={{ background: `linear-gradient(to right, ${colours.indigo600}, ${colours.primaryBlue})` }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                />
            </motion.div>
            <motion.p
                className="text-sm text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                Connect startups and investors seamlessly
            </motion.p>
        </motion.div>
    );
}