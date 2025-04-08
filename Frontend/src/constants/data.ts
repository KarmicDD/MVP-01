// lib/data.ts
export const links = [
    {
        name: "Home",
        hash: "#hero",
    },
    {
        name: "About",
        hash: "#features",
    },
    {
        name: "How It Works",
        hash: "#how-it-works",
    },
    {
        name: "Contact",
        hash: "#contact",
    },
] as const;

export type SectionName = typeof links[number]['name'];

// src/utils/data.ts

// Add this to your existing data.ts file or create a new one

export const ddFacts = [
    {
        id: 1,
        fact: "78% of investors say proper due diligence is the most crucial factor in investment success.",
        icon: "📈"
    },
    {
        id: 2,
        fact: "Startups that undergo thorough due diligence are 2.5x more likely to secure funding.",
        icon: "💼"
    },
    {
        id: 3,
        fact: "Due diligence reduces investment risk by up to 60% according to industry studies.",
        icon: "🛡️"
    },
    {
        id: 4,
        fact: "Financial due diligence typically reveals 15-20% more financial risks than initially disclosed.",
        icon: "💰"
    },
    {
        id: 5,
        fact: "93% of failed investments had incomplete legal due diligence.",
        icon: "⚖️"
    },
    {
        id: 6,
        fact: "Market due diligence helps investors identify emerging market trends 8-12 months before general awareness.",
        icon: "📊"
    },
    {
        id: 7,
        fact: "Companies that conduct comprehensive due diligence on potential partners see 35% fewer partnership disputes.",
        icon: "🤝"
    },
    {
        id: 8,
        fact: "Forensic due diligence uncovers fraud in approximately 12% of investment opportunities.",
        icon: "🔍"
    },
    {
        id: 9,
        fact: "Digital due diligence has become crucial, with 67% of startups having unrealized tech debt.",
        icon: "💻"
    },
    {
        id: 10,
        fact: "Proper due diligence typically takes 45-60 days for complex investments.",
        icon: "⏱️"
    },
    {
        id: 11,
        fact: "Investors utilizing data-driven due diligence models can achieve exit rates up to 60%, nearly double that of top venture capital firms.",
        icon: "🚀"
    },
    {
        id: 12,
        fact: "Implementing graph neural network-based due diligence can enhance prediction accuracy of startup success, surpassing traditional methods.",
        icon: "🧠"
    },
    {
        id: 13,
        fact: "Automated data-driven due diligence frameworks can efficiently screen investment opportunities, reducing manual assessment time significantly.",
        icon: "⚙️"
    },
    {
        id: 14,
        fact: "Utilizing time series transformer models in due diligence helps identify high-potential investment opportunities beyond traditional gut-feel approaches.",
        icon: "📉"
    },
    {
        id: 15,
        fact: "Comprehensive due diligence can uncover potential compliance issues, mitigating future legal risks.",
        icon: "📝"
    },
    {
        id: 16,
        fact: "Environmental due diligence assesses potential environmental liabilities, crucial for sustainable investments.",
        icon: "🌱"
    },
    {
        id: 17,
        fact: "Operational due diligence evaluates internal processes, ensuring operational efficiency and identifying potential bottlenecks.",
        icon: "🔄"
    },
    {
        id: 18,
        fact: "Tax due diligence identifies tax liabilities and opportunities for optimization, impacting the financial viability of investments.",
        icon: "💲"
    },
    {
        id: 19,
        fact: "Cultural due diligence assesses organizational culture fit, essential for successful mergers and acquisitions.",
        icon: "🏢"
    },
    {
        id: 20,
        fact: "Human resources due diligence evaluates employee contracts and benefits, identifying potential liabilities.",
        icon: "👥"
    },
    {
        id: 21,
        fact: "Intellectual property due diligence ensures protection of key assets, vital for technology-driven companies.",
        icon: "💡"
    },
    {
        id: 22,
        fact: "Supply chain due diligence identifies vulnerabilities, ensuring resilience against disruptions.",
        icon: "🔗"
    },
    {
        id: 23,
        fact: "Customer due diligence assesses client relationships, providing insights into revenue stability.",
        icon: "🤵"
    },
    {
        id: 24,
        fact: "Strategic due diligence aligns investment opportunities with long-term business objectives.",
        icon: "🎯"
    },
    {
        id: 25,
        fact: "Reputational due diligence evaluates public perception, safeguarding brand value.",
        icon: "👍"
    },
    {
        id: 26,
        fact: "Regulatory due diligence ensures compliance with industry-specific laws, avoiding potential fines.",
        icon: "📋"
    },
    {
        id: 27,
        fact: "Insurance due diligence assesses coverage adequacy, protecting against unforeseen events.",
        icon: "🔒"
    },
    {
        id: 28,
        fact: "IT due diligence evaluates technology infrastructure, ensuring scalability and security.",
        icon: "🖥️"
    },
    {
        id: 29,
        fact: "Cybersecurity due diligence identifies vulnerabilities, protecting against data breaches.",
        icon: "🔐"
    },
    {
        id: 30,
        fact: "Post-investment due diligence monitors ongoing compliance, ensuring sustained investment health.",
        icon: "📌"
    },
    {
        id: 31,
        fact: "62% of mergers and acquisitions fail to meet their financial objectives, with poor due diligence cited as a primary reason.",
        icon: "📉"
    },
    {
        id: 32,
        fact: "Companies that perform due diligence on a target's technology are 2.8 times more likely to achieve a successful outcome.",
        icon: "💻"
    },
    {
        id: 33,
        fact: "The average time spent on due diligence for technology companies is 12 weeks.",
        icon: "⏳"
    },
    {
        id: 34,
        fact: "80% of tech executives consider data security and privacy the most important factors during tech due diligence.",
        icon: "🔒"
    },
    {
        id: 35,
        fact: "70% of private equity firms conduct tech due diligence before investing.",
        icon: "💼"
    },
    {
        id: 36,
        fact: "70% of M&A deals fail to achieve desired synergies, often due to inadequate due diligence.",
        icon: "🔄"
    },
    {
        id: 37,
        fact: "Cybersecurity breaches cost businesses $6 trillion annually, highlighting the importance of cybersecurity due diligence.",
        icon: "🛡️"
    },
    {
        id: 38,
        fact: "Intellectual property accounts for over 80% of a company's value, making IP due diligence critical.",
        icon: "📜"
    },
    {
        id: 39,
        fact: "Less than 40% of companies have a comprehensive data governance strategy, underscoring the need for data due diligence.",
        icon: "📊"
    },
    {
        id: 40,
        fact: "60-90% of IT projects fail to meet their objectives, emphasizing the importance of thorough tech due diligence.",
        icon: "🖥️"
    },
    {
        id: 41,
        fact: "Commercial due diligence is becoming a priority, with 28% of M&A professionals emphasizing its importance.",
        icon: "📈"
    },
    {
        id: 42,
        fact: "ESG due diligence is gaining traction, with 24% of dealmakers prioritizing it in the next 12 months.",
        icon: "🌍"
    },
    {
        id: 43,
        fact: "Cybersecurity due diligence is crucial, as 16% of M&A professionals highlight its growing importance.",
        icon: "🔐"
    },
    {
        id: 44,
        fact: "Companies with robust ESG practices are more attractive to investors, emphasizing the need for ESG due diligence.",
        icon: "♻️"
    },
    {
        id: 45,
        fact: "Thorough cybersecurity due diligence can significantly reduce the risk of digital threats in M&A transactions.",
        icon: "🛡️"
    },
    {
        id: 46,
        fact: "Legal due diligence ensures a company's compliance with regulations, reducing the risk of legal complications post-investment.",
        icon: "⚖️"
    },
    {
        id: 47,
        fact: "Financial due diligence audits a company's financial statements to uncover potential irregularities.",
        icon: "💰"
    },
    {
        id: 48,
        fact: "Tax due diligence assesses a company's tax exposure, ensuring there are no hidden liabilities.",
        icon: "📝"
    },
    {
        id: 49,
        fact: "Operational due diligence evaluates a company's operational efficiency, identifying areas of potential improvement.",
        icon: "⚙️"
    },
    {
        id: 50,
        fact: "Environmental due diligence assesses a company's environmental impact, ensuring compliance with environmental regulations.",
        icon: "🌱"
    }
];


export const upcomingFeatures = [
    {
        id: 1,
        name: "Legal DD",
        description: "Comprehensive legal risk assessment and compliance verification",
        icon: "⚖️",
        color: "#4A90E2"
    },
    {
        id: 2,
        name: "Financial DD",
        description: "Deep analysis of financial health, projections, and reporting accuracy",
        icon: "💰",
        color: "#50C878"
    },
    {
        id: 3,
        name: "Market DD",
        description: "Detailed market positioning and competitive landscape evaluation",
        icon: "📊",
        color: "#FF7F50"
    },
    {
        id: 4,
        name: "Forensic DD",
        description: "Advanced verification of claims and detection of potential fraud",
        icon: "🔍",
        color: "#9370DB"
    },
    {
        id: 5,
        name: "Astro DD",
        description: "Innovative predictive analytics based on market cycle patterns",
        icon: "🔮",
        color: "#C71585"
    }
];
