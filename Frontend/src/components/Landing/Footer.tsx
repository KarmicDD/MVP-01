import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colours } from "../../utils/colours";
import { FaLinkedinIn, FaTwitter, FaInstagram, FaGithub, FaPaperPlane, FaCheck } from "react-icons/fa";
import { Logo } from "../Auth/Logo";
import { toast } from "react-toastify";
import axios from "axios";

export const Footer: React.FC = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [hoverLink, setHoverLink] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        hover: {
            scale: 1.2,
            rotate: 5,
            boxShadow: "0 0 15px rgba(90, 66, 227, 0.5)"
        },
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Updated submission handler to use the new API
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setIsSubmitting(true);

        try {

            // Make the API call to send welcome email
            const response = await axios.post('http://localhost:5000/api/email/welcome', { email });

            if (response.status !== 200) {
                const errorData = response.data;

                // we dont have an domain so for all say subbsiced though toast
                toast.success("Thank you for subscribing to our newsletter!");


                // Handle different error types
                // if (response.status === 400) {
                //     throw new Error(errorData.message || "Invalid email address");
                // } else if (response.status === 403) {
                //     throw new Error("You don't have permission to perform this action");
                // } else {
                //     throw new Error("Server error. Please try again later");
                // }
            }

            setIsSubscribed(true);
            toast.success("Thank you for subscribing to our newsletter!");
            // setEmail("");

            // Reset after 5 seconds so they can subscribe again if needed
            setTimeout(() => {
                setIsSubscribed(false);
            }, 5000);
        } catch (error) {
            console.error("Error subscribing to newsletter:", error);
            // toast.error(error instanceof Error ? error.message : "Sorry, something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
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
            onMouseMove={handleMouseMove}
        >
            {/* Animated background glow effect */}
            <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                animate={{
                    background: [
                        `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${colours.indigo600}33 0%, transparent 60%)`,
                        `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${colours.indigo600}22 0%, transparent 50%)`
                    ],
                }}
                transition={{ duration: 0.8 }}
            />

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />
            <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full opacity-5"
                style={{ background: colours.primaryGradient, filter: 'blur(40px)' }} />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-5"
                style={{ background: colours.secondaryGradient, filter: 'blur(60px)' }} />

            {/* Back to top button with enhanced animation */}
            <motion.div
                className="absolute right-4 top-4 md:right-8 md:top-8 z-10"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-gray-800 hover:bg-indigo-600 text-white p-3 md:p-4 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 relative overflow-hidden group"
                    aria-label="Back to top"
                >
                    <motion.div
                        className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 rounded-full"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                    <svg
                        className="w-5 h-5 relative z-10"
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
                    <motion.p
                        className="mt-4 text-center max-w-lg text-gray-300 font-light text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Building the future of value-aligned startup and investor partnerships
                    </motion.p>
                </motion.div>

                {/* Main footer content */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative inline-block">
                            About Us
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                            />
                        </h3>
                        <p style={{ color: colours.gray400 }} className="mb-4 leading-relaxed">
                            Connecting value-aligned startups and investors through innovative
                            matching technology and a transparent platform.
                        </p>
                        <div className="flex space-x-4 mt-6">
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
                                    className="bg-gray-800 hover:bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative overflow-hidden"
                                    whileHover="hover"
                                    variants={socialVariants}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-indigo-600 opacity-0"
                                        initial={{ scale: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <social.Icon className="relative z-10" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative inline-block">
                            Company
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.6, duration: 0.4 }}
                            />
                        </h3>
                        <ul className="space-y-3">
                            {["About Us", "How It Works", "Careers", "Contact", "Blog"].map(
                                (item, index) => (
                                    <motion.li
                                        key={index}
                                        className="relative"
                                        onMouseEnter={() => setHoverLink(item)}
                                        onMouseLeave={() => setHoverLink(null)}
                                    >
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-white flex items-center transition-colors duration-200 group"
                                        >
                                            <motion.span
                                                className="absolute left-0 opacity-0 group-hover:opacity-100 text-indigo-400"
                                                animate={{ x: hoverLink === item ? [0, 4, 0] : 0 }}
                                                transition={{ repeat: hoverLink === item ? Infinity : 0, duration: 1 }}
                                            >
                                                ›
                                            </motion.span>
                                            <span className="ml-0 group-hover:ml-4 transition-all duration-200">
                                                {item}
                                            </span>
                                        </a>
                                    </motion.li>
                                )
                            )}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative inline-block">
                            Legal
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.7, duration: 0.4 }}
                            />
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Privacy Policy",
                                "Terms of Service",
                                "Cookie Policy",
                                "GDPR Compliance",
                                "Security",
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    className="relative"
                                    onMouseEnter={() => setHoverLink(item)}
                                    onMouseLeave={() => setHoverLink(null)}
                                >
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white flex items-center transition-colors duration-200 group"
                                    >
                                        <motion.span
                                            className="absolute left-0 opacity-0 group-hover:opacity-100 text-indigo-400"
                                            animate={{ x: hoverLink === item ? [0, 4, 0] : 0 }}
                                            transition={{ repeat: hoverLink === item ? Infinity : 0, duration: 1 }}
                                        >
                                            ›
                                        </motion.span>
                                        <span className="ml-0 group-hover:ml-4 transition-all duration-200">
                                            {item}
                                        </span>
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h3 className="text-xl font-bold mb-4 relative inline-block">
                            Stay Updated
                            <motion.span
                                className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-600 to-primaryBlue"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.8, duration: 0.4 }}
                            />
                        </h3>
                        <p style={{ color: colours.gray400 }} className="mb-4">
                            Subscribe to our newsletter for the latest updates and insights.
                        </p>
                        <form onSubmit={handleSubmit} className="mt-4 relative">
                            <AnimatePresence mode="wait">
                                {!isSubscribed ? (
                                    <motion.div
                                        key="form"
                                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2"
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="relative flex-grow">
                                            <input
                                                type="email"
                                                placeholder="Your email address"
                                                className="bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full pl-10 transition-all duration-300"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            />
                                            <FaPaperPlane className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-3 rounded-lg transition-all duration-300 whitespace-nowrap flex items-center justify-center"
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(90, 66, 227, 0.5)" }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <motion.div
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                />
                                            ) : (
                                                "Subscribe"
                                            )}
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        className="bg-green-800 bg-opacity-30 text-green-300 rounded-lg p-4 flex items-center"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <FaCheck className="text-green-400 mr-2" />
                                        <span>Thank you for subscribing!</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </motion.div>

                {/* Copyright section */}
                <motion.div
                    className="mt-12 pt-8 border-t border-gray-800 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                >
                    <p style={{ color: colours.gray400 }} className="text-sm">
                        © {new Date().getFullYear()} KarmicDD. All rights reserved.
                    </p>
                    <p className="text-xs mt-3" style={{ color: colours.gray600 }}>
                        <motion.span
                            initial={{ opacity: 0.5 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                        >
                            Empowering belief-based connections in the startup ecosystem.
                        </motion.span>
                    </p>
                </motion.div>
            </div>
        </motion.footer>
    );
};