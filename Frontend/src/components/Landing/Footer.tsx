import React from "react";
import { motion } from "framer-motion";
import { colours } from "../../utils/colours";
import { FaLinkedinIn, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import { Logo } from "../Auth/Logo";

export const Footer: React.FC = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 },
        },
    };

    const socialVariants = {
        hover: { scale: 1.2, rotate: 5 },
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
    };

    return (
        <motion.footer
            className="py-10 md:py-16 relative overflow-hidden"
            style={{
                backgroundColor: colours.gray900,
                color: colours.white,
                backgroundImage: `radial-gradient(circle at 25% 10%, ${colours.gray900}aa 0%, transparent 60%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Back to top button */}
            <motion.div
                className="absolute right-4 top-4 md:right-8 md:top-8"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-gray-800 text-white p-2 md:p-3 rounded-full flex items-center justify-center"
                    aria-label="Back to top"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </a>
            </motion.div>

            {/* Footer content container */}
            <div className="container mx-auto px-4">
                {/* Logo and tagline */}
                <motion.div
                    className="flex flex-col items-center mb-10"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <Logo Title="KarmicDD" />
                </motion.div>

                {/* Main footer content */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative">
                            About Us
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "40%" }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                            />
                        </h3>
                        <p style={{ color: colours.gray400 }} className="mb-4">
                            Connecting value-aligned startups and investors through innovative
                            matching technology and a transparent platform.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            {[
                                { Icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
                                { Icon: FaTwitter, href: "#", label: "Twitter" },
                                { Icon: FaInstagram, href: "#", label: "Instagram" },
                                { Icon: FaGithub, href: "#", label: "GitHub" },
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="bg-gray-800 hover:bg-indigo-600 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300"
                                    style={{ color: colours.white }}
                                    whileHover="hover"
                                    variants={socialVariants}
                                >
                                    <social.Icon />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative">
                            Company
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "40%" }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                            />
                        </h3>
                        <ul className="space-y-2">
                            {["About Us", "How It Works", "Careers", "Contact", "Blog"].map(
                                (item, index) => (
                                    <motion.li key={index} whileHover={{ x: 5 }}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-white flex items-center transition-colors duration-200"
                                        >
                                            <span className="mr-2 opacity-0 group-hover:opacity-100">
                                                →
                                            </span>
                                            {item}
                                        </a>
                                    </motion.li>
                                )
                            )}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative">
                            Legal
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "40%" }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                            />
                        </h3>
                        <ul className="space-y-2">
                            {[
                                "Privacy Policy",
                                "Terms of Service",
                                "Cookie Policy",
                                "GDPR Compliance",
                                "Security",
                            ].map((item, index) => (
                                <motion.li key={index} whileHover={{ x: 5 }}>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white flex items-center transition-colors duration-200"
                                    >
                                        <span className="mr-2 opacity-0 group-hover:opacity-100">
                                            →
                                        </span>
                                        {item}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative">
                            Stay Updated
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "40%" }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                            />
                        </h3>
                        <p style={{ color: colours.gray400 }} className="mb-4">
                            Subscribe to our newsletter for the latest updates and insights.
                        </p>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                                    required
                                />
                                <motion.button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 whitespace-nowrap"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Subscribe
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>

                {/* Copyright section */}
                <motion.div
                    className="mt-12 pt-6 border-t border-gray-800 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <p style={{ color: colours.gray400 }} className="text-sm">
                        © {new Date().getFullYear()} KarmicDD. All rights reserved.
                    </p>
                    <p className="text-xs mt-2" style={{ color: colours.gray600 }}>
                        Empowering belief-based connections in the startup ecosystem.
                    </p>
                </motion.div>
            </div>
        </motion.footer>
    );
};
