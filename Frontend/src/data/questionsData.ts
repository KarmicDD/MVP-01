import { Question } from '../types/questionnaire.types';

// Define categories for organizing questions
const CATEGORIES = {
    PRODUCT_STRATEGY: 'Product Strategy',
    CULTURE: 'Company Culture',
    GOVERNANCE: 'Governance & Transparency',
    FINANCE: 'Financial Strategy',
    GROWTH: 'Growth & Scaling',
    LEADERSHIP: 'Leadership Style',
    COMMUNICATION: 'Communication Style',
    INNOVATION: 'Innovation & Technology',
    VALUES: 'Values & Mission',
    OPERATIONS: 'Operations'
};

// Helper function to create question ID
const createQuestionId = (userType: string, index: number): string => {
    return `${userType}_q${index + 1}`;
}

// Startup questions
export const startupQuestions: Question[] = [
    // 1. Product Roadmap Flexibility
    {
        id: createQuestionId('startup', 0),
        text: 'How flexible is the startup in adapting its product roadmap?',
        type: 'radio',
        category: CATEGORIES.PRODUCT_STRATEGY,
        required: true,
        options: [
            { value: 'very_flexible', label: 'Very flexible, quick to pivot' },
            { value: 'somewhat_flexible', label: 'Somewhat flexible, open to adjustments' },
            { value: 'balanced', label: 'Balanced approach to stability and change' },
            { value: 'mostly_stable', label: 'Mostly stable, with occasional adjustments' },
            { value: 'very_stable', label: 'Very stable, committed to original vision' }
        ]
    },
    // 2. External Connections
    {
        id: createQuestionId('startup', 1),
        text: 'Can the startup benefit from external connections?',
        type: 'multi-select',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'industry_connections', label: 'Industry connections' },
            { value: 'customer_intros', label: 'Customer introductions' },
            { value: 'talent_acquisition', label: 'Talent acquisition' },
            { value: 'strategic_partnerships', label: 'Strategic partnerships' },
            { value: 'international_expansion', label: 'International expansion' },
            { value: 'supply_chain', label: 'Supply chain optimization' }
        ]
    },
    // 3. Investor-Led PR
    {
        id: createQuestionId('startup', 2),
        text: 'Does the startup want investor-led public relations (PR)?',
        type: 'radio',
        category: CATEGORIES.COMMUNICATION,
        required: true,
        options: [
            { value: 'yes_pr', label: 'Yes, prefers investor-led PR' },
            { value: 'no_pr', label: 'No, prefers organic PR' },
            { value: 'open_discussion', label: 'Open to discussion' }
        ]
    },
    // 4. Upskilling & Continuous Learning
    {
        id: createQuestionId('startup', 3),
        text: 'Does the startup encourage upskilling and continuous learning?',
        type: 'slider',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 1, label: 'Not at all' },
            { value: 2, label: 'Slightly' },
            { value: 3, label: 'Moderately' },
            { value: 4, label: 'Strongly' },
            { value: 5, label: 'Very strongly' }
        ]
    },
    // 5. Marketing Strategy Alignment
    {
        id: createQuestionId('startup', 4),
        text: 'Does the startup’s marketing strategy align with its brand objectives?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Not aligned' },
            { value: 2, label: 'Slightly aligned' },
            { value: 3, label: 'Moderately aligned' },
            { value: 4, label: 'Well aligned' },
            { value: 5, label: 'Perfectly aligned' }
        ]
    },
    // 6. Alignment with Investor’s Target Market
    {
        id: createQuestionId('startup', 5),
        text: 'Is the startup aligned with the investor’s target market?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Not aligned' },
            { value: 2, label: 'Slightly aligned' },
            { value: 3, label: 'Moderately aligned' },
            { value: 4, label: 'Well aligned' },
            { value: 5, label: 'Perfectly aligned' }
        ]
    },
    // 7. Legal Compliance
    {
        id: createQuestionId('startup', 6),
        text: 'Is the startup legally sound and compliant with relevant regulations?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'fully_compliant', label: 'Fully compliant' },
            { value: 'mostly_compliant', label: 'Mostly compliant' },
            { value: 'moderately_compliant', label: 'Moderately compliant' },
            { value: 'somewhat_noncompliant', label: 'Somewhat non-compliant' },
            { value: 'non_compliant', label: 'Non-compliant' }
        ]
    },
    // 8. Work Culture Balance
    {
        id: createQuestionId('startup', 7),
        text: 'Is the startup’s work culture balanced between high energy and work–life balance?',
        type: 'slider',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 1, label: 'Very imbalanced' },
            { value: 2, label: 'Somewhat imbalanced' },
            { value: 3, label: 'Balanced' },
            { value: 4, label: 'Mostly balanced' },
            { value: 5, label: 'Perfectly balanced' }
        ]
    },
    // 9. Board Seat Offering
    {
        id: createQuestionId('startup', 8),
        text: 'Is the startup willing to offer board seats to investors?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'negotiable', label: 'Negotiable' }
        ]
    },
    // 10. Adherence to ESG Principles
    {
        id: createQuestionId('startup', 9),
        text: 'Does the startup adhere to Environmental, Social, and Governance (ESG) principles?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Not at all' },
            { value: 2, label: 'Slightly committed' },
            { value: 3, label: 'Moderately committed' },
            { value: 4, label: 'Strongly committed' },
            { value: 5, label: 'Fully committed' }
        ]
    },
    // 11. Acquisition / External Growth
    {
        id: createQuestionId('startup', 10),
        text: 'Is the startup open to potential acquisition or external growth opportunities?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'open_acquisition', label: 'Open to acquisition' },
            { value: 'prefer_organic', label: 'Prefer organic growth' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 12. Transparency in Reporting
    {
        id: createQuestionId('startup', 11),
        text: 'Is the startup prepared for high levels of financial and operational transparency?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Not transparent' },
            { value: 2, label: 'Slightly transparent' },
            { value: 3, label: 'Moderately transparent' },
            { value: 4, label: 'Very transparent' },
            { value: 5, label: 'Extremely transparent' }
        ]
    },
    // 13. MVP vs. Early Funding
    {
        id: createQuestionId('startup', 12),
        text: 'Is the startup willing to develop a working prototype or MVP before seeking funding, or does it require early funding to build one?',
        type: 'radio',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 'mvp_first', label: 'Develop MVP before funding' },
            { value: 'early_funding', label: 'Require early funding to build MVP' },
            { value: 'case_by_case', label: 'Depends on circumstances' }
        ]
    },
    // 14. Founders’ History
    {
        id: createQuestionId('startup', 13),
        text: 'Have the startup’s founders worked together previously, or is the team newly formed?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'experienced_team', label: 'Experienced team' },
            { value: 'new_team', label: 'Newly formed team' },
            { value: 'mixed', label: 'Mixed background' }
        ]
    },
    // 15. Leadership Model
    {
        id: createQuestionId('startup', 14),
        text: 'Does the startup prefer a solo founder leadership model or a shared (co-founding) team approach?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'solo', label: 'Solo founder' },
            { value: 'co_founders', label: 'Co-founding team' },
            { value: 'no_preference', label: 'No preference' }
        ]
    },
    // 16. Work Culture Model
    {
        id: createQuestionId('startup', 15),
        text: 'Is the startup inclined to adopt a remote-first work culture versus a hybrid or office-based model?',
        type: 'radio',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 'remote_first', label: 'Remote-first' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'office_based', label: 'Office-based' },
            { value: 'flexible', label: 'Flexible' }
        ]
    },
    // 17. Communication Style Preference
    {
        id: createQuestionId('startup', 16),
        text: 'Does the startup value transparent, regular communication over informal, sporadic updates?',
        type: 'radio',
        category: CATEGORIES.COMMUNICATION,
        required: true,
        options: [
            { value: 'regular', label: 'Regular, transparent communication' },
            { value: 'informal', label: 'Informal, sporadic updates' },
            { value: 'no_preference', label: 'No strong preference' }
        ]
    },
    // 18. Flexible Compensation
    {
        id: createQuestionId('startup', 17),
        text: 'Is the startup open to flexible compensation structures, such as adaptable equity arrangements?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'flexible', label: 'Yes, flexible' },
            { value: 'fixed', label: 'Prefer fixed structures' },
            { value: 'negotiable', label: 'Open to negotiation' }
        ]
    },
    // 19. Launch Timing
    {
        id: createQuestionId('startup', 18),
        text: 'What is the startup’s planned launch timing, and does it aim to be a first-mover or a late adopter?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'first_mover', label: 'First-mover' },
            { value: 'late_adopter', label: 'Late adopter' },
            { value: 'flexible', label: 'Flexible' }
        ]
    },
    // 20. Cash Burn Philosophy
    {
        id: createQuestionId('startup', 19),
        text: 'What is the startup’s cash burn philosophy—does it favor frugality or aggressive spending?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Frugal' },
            { value: 2, label: 'Somewhat frugal' },
            { value: 3, label: 'Balanced' },
            { value: 4, label: 'Somewhat aggressive' },
            { value: 5, label: 'Aggressive spending' }
        ]
    },
    // 21. Intellectual Property Strength
    {
        id: createQuestionId('startup', 20),
        text: 'Does the startup have a strong intellectual property (IP) portfolio to protect its innovations?',
        type: 'radio',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 'strong', label: 'Strong IP portfolio' },
            { value: 'moderate', label: 'Moderate IP portfolio' },
            { value: 'weak', label: 'Weak or no IP portfolio' },
            { value: 'na', label: 'Not applicable' }
        ]
    },
    // 22. Work–Life Balance Approach
    {
        id: createQuestionId('startup', 21),
        text: 'What is the startup’s approach to work–life balance in creating a sustainable work environment?',
        type: 'slider',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 1, label: 'Poor balance' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Good balance' },
            { value: 5, label: 'Excellent balance' }
        ]
    },
    // 23. Exit/Succession Plan
    {
        id: createQuestionId('startup', 22),
        text: 'Does the startup have a well-defined exit or succession plan?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'well_defined', label: 'Well-defined plan' },
            { value: 'somewhat_defined', label: 'Somewhat defined' },
            { value: 'not_defined', label: 'Not defined' }
        ]
    },
    // 24. Governance Structure
    {
        id: createQuestionId('startup', 23),
        text: 'How is the startup’s governance structured regarding board involvement and decision-making?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'centralized', label: 'Centralized governance' },
            { value: 'distributed', label: 'Distributed governance' },
            { value: 'hybrid', label: 'Hybrid/Flexible' }
        ]
    },
    // 25. Operational Transparency
    {
        id: createQuestionId('startup', 24),
        text: 'What is the startup’s track record regarding transparency in its operations and reporting?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Low transparency' },
            { value: 2, label: 'Somewhat transparent' },
            { value: 3, label: 'Moderately transparent' },
            { value: 4, label: 'Very transparent' },
            { value: 5, label: 'Extremely transparent' }
        ]
    },
    // 26. Handling Internal Conflicts
    {
        id: createQuestionId('startup', 25),
        text: 'How does the startup handle internal conflicts and disputes?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'direct_resolution', label: 'Direct resolution' },
            { value: 'mediated', label: 'Mediated resolution' },
            { value: 'avoid_confrontation', label: 'Avoids confrontation' },
            { value: 'unclear', label: 'Unclear process' }
        ]
    },
    // 27. Alignment with Social & Political Values
    {
        id: createQuestionId('startup', 26),
        text: 'Does the startup align with the investor’s social and political values and ideologies?',
        type: 'radio',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 'fully_aligned', label: 'Fully aligned' },
            { value: 'partially_aligned', label: 'Partially aligned' },
            { value: 'not_aligned', label: 'Not aligned' }
        ]
    },
    // 28. Hiring Independence
    {
        id: createQuestionId('startup', 27),
        text: 'How independent is the startup in making its hiring decisions without excessive investor interference?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Highly dependent' },
            { value: 2, label: 'Somewhat dependent' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Somewhat independent' },
            { value: 5, label: 'Highly independent' }
        ]
    },
    // 29. Employee Wellness Programs
    {
        id: createQuestionId('startup', 28),
        text: 'Does the startup offer wellness programs or otherwise prioritize employee well–being?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'comprehensive', label: 'Yes, comprehensive programs' },
            { value: 'some', label: 'Some programs' },
            { value: 'none', label: 'No programs' }
        ]
    },
    // 30. CSR & Philanthropy Alignment
    {
        id: createQuestionId('startup', 29),
        text: 'Does the startup align with corporate social responsibility (CSR) initiatives and philanthropic goals?',
        type: 'radio',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 'strongly_aligned', label: 'Strongly aligned' },
            { value: 'moderately_aligned', label: 'Moderately aligned' },
            { value: 'not_aligned', label: 'Not aligned' }
        ]
    },
    // 31. Geographic Expansion
    {
        id: createQuestionId('startup', 30),
        text: 'Is the startup willing to expand into the investor’s preferred geographic markets?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'negotiable', label: 'Negotiable' }
        ]
    },
    // 32. Flexibility to Pivot
    {
        id: createQuestionId('startup', 31),
        text: 'Is the startup flexible enough to pivot based on market demands while staying true to its core idea?',
        type: 'slider',
        category: CATEGORIES.PRODUCT_STRATEGY,
        required: true,
        options: [
            { value: 1, label: 'Not flexible' },
            { value: 2, label: 'Slightly flexible' },
            { value: 3, label: 'Moderately flexible' },
            { value: 4, label: 'Very flexible' },
            { value: 5, label: 'Extremely flexible' }
        ]
    },
    // 33. Fast Funding Requirement
    {
        id: createQuestionId('startup', 32),
        text: 'Does the startup require fast funding, or is it willing to wait for the right investor match?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'fast_funding', label: 'Requires fast funding' },
            { value: 'willing_to_wait', label: 'Willing to wait' },
            { value: 'case_by_case', label: 'Depends on opportunity' }
        ]
    },
    // 34. Benefit from Investor Connections
    {
        id: createQuestionId('startup', 33),
        text: 'Can the startup benefit from an investor who can open doors through strong industry connections?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'maybe', label: 'Maybe' }
        ]
    },
    // 35. Portfolio Complementarity
    {
        id: createQuestionId('startup', 34),
        text: 'How well does the startup complement and integrate with the investor’s existing portfolio?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Poor complementarity' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Above average' },
            { value: 5, label: 'Excellent integration' }
        ]
    },
    // 36. Investor-Led PR Efforts
    {
        id: createQuestionId('startup', 35),
        text: 'Is the startup open to investor-led PR efforts as part of its branding strategy?',
        type: 'radio',
        category: CATEGORIES.COMMUNICATION,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'open', label: 'Open to discussion' }
        ]
    },
    // 37. Alignment Through Shared Backgrounds
    {
        id: createQuestionId('startup', 36),
        text: 'Does the startup align with investor values through shared experiences and educational backgrounds?',
        type: 'radio',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 'strong', label: 'Strong alignment' },
            { value: 'moderate', label: 'Some alignment' },
            { value: 'none', label: 'No alignment' }
        ]
    },
    // 38. Preference for Strategic Guidance
    {
        id: createQuestionId('startup', 37),
        text: 'What is the startup’s preference for strategic guidance—do they seek a hands-on approach or prefer advisory input from investors?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'hands_on', label: 'Hands-on approach' },
            { value: 'advisory', label: 'Prefer advisory input' },
            { value: 'no_preference', label: 'No preference' }
        ]
    },
    // 39. Crisis Management Capability
    {
        id: createQuestionId('startup', 38),
        text: 'How capable is the startup in managing crises and effectively mitigating risks?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Poorly equipped' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Moderately capable' },
            { value: 4, label: 'Very capable' },
            { value: 5, label: 'Highly capable' }
        ]
    },
    // 40. Decision-Making Process
    {
        id: createQuestionId('startup', 39),
        text: 'Does the startup’s decision-making process lean more toward data-driven analysis or intuition-based judgments?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'data_driven', label: 'Data-driven' },
            { value: 'intuition', label: 'Intuition-based' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 41. Hiring & Talent Acquisition Approach
    {
        id: createQuestionId('startup', 40),
        text: 'What is the startup’s approach to hiring and talent acquisition, and does it reflect a merit-based, diversity–focused philosophy?',
        type: 'radio',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 'merit_diversity', label: 'Merit and diversity focused' },
            { value: 'merit_only', label: 'Merit focused' },
            { value: 'unclear', label: 'No clear focus' }
        ]
    },
    // 42. Cutting-Edge Technologies
    {
        id: createQuestionId('startup', 41),
        text: 'Does the startup incorporate cutting–edge technologies (such as AI and automation) into its operations?',
        type: 'radio',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 'heavily', label: 'Yes, heavily' },
            { value: 'somewhat', label: 'Somewhat' },
            { value: 'no', label: 'No' }
        ]
    },
    // 43. Competitive Advantage
    {
        id: createQuestionId('startup', 42),
        text: 'Does the startup have a sustainable competitive advantage or moat in its market?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'No advantage' },
            { value: 2, label: 'Minimal advantage' },
            { value: 3, label: 'Moderate advantage' },
            { value: 4, label: 'Strong advantage' },
            { value: 5, label: 'Significant advantage' }
        ]
    },
    // 44. Supply Chain & Logistics
    {
        id: createQuestionId('startup', 43),
        text: 'Is the startup’s supply chain and logistics strategy robust and aligned with investor expectations?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Not robust' },
            { value: 2, label: 'Slightly robust' },
            { value: 3, label: 'Moderately robust' },
            { value: 4, label: 'Very robust' },
            { value: 5, label: 'Extremely robust' }
        ]
    },
    // 45. Commitment to Innovation & R&D
    {
        id: createQuestionId('startup', 44),
        text: 'Is the startup strongly committed to innovation and continuous research and development (R&D)?',
        type: 'slider',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 1, label: 'Not committed' },
            { value: 2, label: 'Slightly committed' },
            { value: 3, label: 'Moderately committed' },
            { value: 4, label: 'Very committed' },
            { value: 5, label: 'Extremely committed' }
        ]
    },
    // 46. Market Expansion Plans
    {
        id: createQuestionId('startup', 45),
        text: 'What are the startup’s market expansion plans—are they focused on local growth, global scaling, or both?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'local', label: 'Local growth' },
            { value: 'global', label: 'Global scaling' },
            { value: 'both', label: 'Both' },
            { value: 'undecided', label: 'Undecided' }
        ]
    },
    // 47. Revenue Growth Strategy
    {
        id: createQuestionId('startup', 46),
        text: 'What is the startup’s preferred strategy for revenue growth—do they aim for organic scaling or pursue hyper–growth?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'organic', label: 'Organic scaling' },
            { value: 'hyper_growth', label: 'Hyper–growth' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 48. Scaling Preparedness
    {
        id: createQuestionId('startup', 47),
        text: 'How prepared is the startup to scale its operations as market demand increases?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Not prepared' },
            { value: 2, label: 'Somewhat prepared' },
            { value: 3, label: 'Moderately prepared' },
            { value: 4, label: 'Well prepared' },
            { value: 5, label: 'Fully prepared' }
        ]
    },
    // 49. Complementing Investor’s Portfolio
    {
        id: createQuestionId('startup', 48),
        text: 'How well does the startup complement the investor’s existing portfolio of companies?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Poor complementarity' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Above average' },
            { value: 5, label: 'Excellent complementarity' }
        ]
    },
    // 50. Industry/Sector Match
    {
        id: createQuestionId('startup', 49),
        text: 'Does the startup operate within an industry or sector that matches the investor’s target focus?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'partially', label: 'Partially' }
        ]
    },
    // 51. Capital Utilization Strategy
    {
        id: createQuestionId('startup', 50),
        text: 'Does the startup adopt a lean capital utilization strategy, or does it engage in high–burn spending?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'lean', label: 'Lean strategy' },
            { value: 'high_burn', label: 'High–burn spending' },
            { value: 'balanced', label: 'Balanced approach' }
        ]
    },
    // 52. Business Model Viability
    {
        id: createQuestionId('startup', 51),
        text: 'How viable is the startup’s business model (e.g., SaaS, DTC, marketplace) in terms of market fit and execution?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Not viable' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Moderately viable' },
            { value: 4, label: 'Viable' },
            { value: 5, label: 'Highly viable' }
        ]
    },
    // 53. Equity vs. Debt Financing
    {
        id: createQuestionId('startup', 52),
        text: 'Is the startup open to offering equity dilution, or do they prefer using debt financing for growth?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'equity', label: 'Equity dilution' },
            { value: 'debt', label: 'Debt financing' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 54. Financial Transparency Readiness
    {
        id: createQuestionId('startup', 53),
        text: 'Is the startup ready to meet rigorous financial transparency and disclosure requirements, including regular audits and reports?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Not ready' },
            { value: 2, label: 'Somewhat ready' },
            { value: 3, label: 'Moderately ready' },
            { value: 4, label: 'Very ready' },
            { value: 5, label: 'Fully ready' }
        ]
    },
    // 55. Runway & Long-Term Vision
    {
        id: createQuestionId('startup', 54),
        text: 'What is the startup’s expected runway and long–term vision—does it align with a short–term or long–term investment horizon?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'short_term', label: 'Short-term' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'long_term', label: 'Long-term' }
        ]
    },
    // 56. Funding Stage
    {
        id: createQuestionId('startup', 55),
        text: 'At what funding stage (Seed, Series A, B, etc.) is the startup seeking capital, and is it prepared to scale at that level?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'seed', label: 'Seed' },
            { value: 'series_a', label: 'Series A' },
            { value: 'series_b', label: 'Series B' },
            { value: 'series_c', label: 'Series C or later' },
            { value: 'unsure', label: 'Not sure' }
        ]
    },
    // 57. Defined Exit Strategy
    {
        id: createQuestionId('startup', 56),
        text: 'Is the startup willing to align with a defined exit strategy, such as an IPO, M&A, buyback, or dividend model?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'defined', label: 'Yes, defined' },
            { value: 'flexible', label: 'No, flexible' },
            { value: 'not_defined', label: 'Not defined' }
        ]
    },
    // 58. Risk Profile Matching
    {
        id: createQuestionId('startup', 57),
        text: 'Does the startup’s risk profile match a high–risk, disruptive approach or a low–risk, stable growth strategy?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Low risk' },
            { value: 2, label: 'Moderate risk' },
            { value: 3, label: 'Balanced' },
            { value: 4, label: 'High risk' },
            { value: 5, label: 'Very high risk' }
        ]
    },
    // 59. Anticipated Valuation
    {
        id: createQuestionId('startup', 58),
        text: 'What valuation does the startup anticipate at its current funding stage?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'below_1m', label: 'Below $1M' },
            { value: '1m_to_5m', label: '$1M - $5M' },
            { value: '5m_to_10m', label: '$5M - $10M' },
            { value: 'above_10m', label: 'Above $10M' }
        ]
    },
    // 60. ROI Targets
    {
        id: createQuestionId('startup', 59),
        text: 'Is the startup positioned to meet the investor’s return on investment (ROI) targets, such as 5×, 10×, or 20× returns?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'uncertain', label: 'Uncertain' }
        ]
    }
];


// Investor questions
export const investorQuestions: Question[] = [
    // 1.
    {
        id: createQuestionId('investor', 0),
        text: 'What is your preferred level of input in the product development process of your portfolio companies—active involvement or a hands‑off approach?',
        type: 'slider',
        category: CATEGORIES.PRODUCT_STRATEGY,
        required: true,
        options: [
            { value: 1, label: 'Hands‑off' },
            { value: 2, label: 'Light guidance' },
            { value: 3, label: 'Balanced input' },
            { value: 4, label: 'Active involvement' },
            { value: 5, label: 'Highly involved' }
        ]
    },
    // 2.
    {
        id: createQuestionId('investor', 1),
        text: 'How do you balance offering strategic guidance while respecting the founders’ autonomy in product decisions?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'founder_led', label: 'Strongly favor founder autonomy', description: 'I trust founders to make decisions with minimal interference' },
            { value: 'light_guidance', label: 'Light guidance approach', description: 'Advice provided only when needed or on critical issues' },
            { value: 'collaborative', label: 'Collaborative partnership', description: 'Work alongside founders as a strategic partner' },
            { value: 'active_guidance', label: 'Active guidance', description: 'Regularly provide direction while respecting decisions' },
            { value: 'directive', label: 'Directive approach', description: 'Take an active role in steering decisions' }
        ]
    },
    // 3.
    {
        id: createQuestionId('investor', 2),
        text: 'To what extent do you leverage your network to create partnership opportunities and facilitate introductions for your investments?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Not at all' },
            { value: 2, label: 'Slightly' },
            { value: 3, label: 'Moderately' },
            { value: 4, label: 'Significantly' },
            { value: 5, label: 'Extensively' }
        ]
    },
    // 4.
    {
        id: createQuestionId('investor', 3),
        text: 'How important is it for you to take a public stance in your investments, and do you favor a high‑profile approach over operating behind the scenes?',
        type: 'radio',
        category: CATEGORIES.COMMUNICATION,
        required: true,
        options: [
            { value: 'high_profile', label: 'High‑profile approach' },
            { value: 'balanced', label: 'Balanced visibility' },
            { value: 'low_profile', label: 'Operate behind the scenes' }
        ]
    },
    // 5.
    {
        id: createQuestionId('investor', 4),
        text: 'What are your expectations regarding continuous learning and development in the startups you support?',
        type: 'slider',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 1, label: 'Not important' },
            { value: 2, label: 'Slightly important' },
            { value: 3, label: 'Moderately important' },
            { value: 4, label: 'Very important' },
            { value: 5, label: 'Extremely important' }
        ]
    },
    // 6.
    {
        id: createQuestionId('investor', 5),
        text: 'How do you assess whether a startup’s marketing strategy aligns with your broader investment thesis?',
        type: 'slider',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 1, label: 'Not aligned' },
            { value: 2, label: 'Slightly aligned' },
            { value: 3, label: 'Moderately aligned' },
            { value: 4, label: 'Well aligned' },
            { value: 5, label: 'Strongly aligned' }
        ]
    },
    // 7.
    {
        id: createQuestionId('investor', 6),
        text: 'What criteria do you use to evaluate if a startup’s target market and customer focus match your investment priorities?',
        type: 'multi-select',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'market_size', label: 'Market size' },
            { value: 'growth_potential', label: 'Growth potential' },
            { value: 'customer_demographics', label: 'Customer demographics' },
            { value: 'competitive_landscape', label: 'Competitive landscape' },
            { value: 'product_market_fit', label: 'Product‑market fit' }
        ]
    },
    // 8.
    {
        id: createQuestionId('investor', 7),
        text: 'How do you incorporate legal and compliance standards into your evaluation process when considering an investment?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'thorough_review', label: 'Conduct thorough legal review' },
            { value: 'external_counsel', label: 'Rely on external legal counsel' },
            { value: 'basic_compliance', label: 'Consider only basic compliance' },
            { value: 'delegate', label: 'Delegate to startup’s legal team' }
        ]
    },
    // 9.
    {
        id: createQuestionId('investor', 8),
        text: 'What type of work culture do you expect from a startup, and how does that align with your own values?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'innovative', label: 'Innovative and dynamic' },
            { value: 'structured', label: 'Structured and disciplined' },
            { value: 'collaborative', label: 'Collaborative and inclusive' },
            { value: 'traditional', label: 'Traditional and hierarchical' }
        ]
    },
    // 10.
    {
        id: createQuestionId('investor', 9),
        text: 'How critical is securing board representation to you, and what level of governance involvement do you seek?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Not critical' },
            { value: 2, label: 'Slightly critical' },
            { value: 3, label: 'Moderately critical' },
            { value: 4, label: 'Very critical' },
            { value: 5, label: 'Extremely critical' }
        ]
    },
    // 11.
    {
        id: createQuestionId('investor', 10),
        text: 'How do Environmental, Social, and Governance (ESG) factors influence your investment decisions?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'No influence' },
            { value: 2, label: 'Minor influence' },
            { value: 3, label: 'Moderate influence' },
            { value: 4, label: 'Significant influence' },
            { value: 5, label: 'Primary factor' }
        ]
    },
    // 12.
    {
        id: createQuestionId('investor', 11),
        text: 'Do you prefer that startups pursue independent, organic growth, or are you supportive of strategies that include potential acquisitions?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'organic', label: 'Independent organic growth' },
            { value: 'acquisitions', label: 'Pursue acquisitions' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 13.
    {
        id: createQuestionId('investor', 12),
        text: 'What transparency standards do you require from startups regarding financial and operational reporting?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'high', label: 'High transparency' },
            { value: 'moderate', label: 'Moderate transparency' },
            { value: 'low', label: 'Low transparency' }
        ]
    },
    // 14.
    {
        id: createQuestionId('investor', 13),
        text: 'When evaluating opportunities, do you require startups to have a working prototype/MVP, or are you comfortable investing in an early idea stage?',
        type: 'radio',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 'prototype_required', label: 'Require working prototype/MVP' },
            { value: 'early_stage', label: 'Comfortable with early idea stage' },
            { value: 'case_by_case', label: 'Depends on other factors' }
        ]
    },
    // 15.
    {
        id: createQuestionId('investor', 14),
        text: 'How much importance do you place on a founder’s prior collaborative experience or history of working with co‑founders?',
        type: 'slider',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 1, label: 'Not important' },
            { value: 2, label: 'Slightly important' },
            { value: 3, label: 'Moderately important' },
            { value: 4, label: 'Very important' },
            { value: 5, label: 'Extremely important' }
        ]
    },
    // 16.
    {
        id: createQuestionId('investor', 15),
        text: 'Do you have a preference for investing in solo founders versus teams, and what drives that preference?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'solo', label: 'Solo founders' },
            { value: 'team', label: 'Founder teams' },
            { value: 'no_preference', label: 'No preference' }
        ]
    },
    // 17.
    {
        id: createQuestionId('investor', 16),
        text: 'How do you view the adoption of remote‑first or hybrid work cultures in startups?',
        type: 'radio',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 'supportive', label: 'Strongly support' },
            { value: 'somewhat_supportive', label: 'Support with reservations' },
            { value: 'neutral', label: 'Neutral' },
            { value: 'prefer_office', label: 'Prefer in‑office' },
            { value: 'oppose', label: 'Against remote‑first' }
        ]
    },
    // 18.
    {
        id: createQuestionId('investor', 17),
        text: 'What style and frequency of communication do you expect from your portfolio companies regarding progress and challenges?',
        type: 'radio',
        category: CATEGORIES.COMMUNICATION,
        required: true,
        options: [
            { value: 'frequent_detailed', label: 'Frequent and detailed' },
            { value: 'regular', label: 'Regular updates' },
            { value: 'occasional', label: 'Occasional summaries' },
            { value: 'minimal', label: 'Minimal communication' }
        ]
    },
    // 19.
    {
        id: createQuestionId('investor', 18),
        text: 'What is your investment philosophy regarding market timing—do you favor early first‑mover startups or later entrants with more validation?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'first_mover', label: 'Early first‑mover' },
            { value: 'validated', label: 'Validated later entrant' },
            { value: 'no_preference', label: 'No strong preference' }
        ]
    },
    // 20.
    {
        id: createQuestionId('investor', 19),
        text: 'How do you assess a startup’s financial discipline, particularly its approach to managing cash burn and spending?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Poor discipline' },
            { value: 2, label: 'Below average' },
            { value: 3, label: 'Average' },
            { value: 4, label: 'Good' },
            { value: 5, label: 'Excellent' }
        ]
    },
    // 21.
    {
        id: createQuestionId('investor', 20),
        text: 'How important is a robust intellectual property (IP) portfolio when considering an investment?',
        type: 'slider',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 1, label: 'Not important' },
            { value: 2, label: 'Slightly important' },
            { value: 3, label: 'Moderately important' },
            { value: 4, label: 'Very important' },
            { value: 5, label: 'Crucial' }
        ]
    },
    // 22.
    {
        id: createQuestionId('investor', 21),
        text: 'What expectations do you have regarding a startup’s approach to work–life balance, and how does that affect your decision?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'strict_balance', label: 'Strict balance' },
            { value: 'flexible', label: 'Flexible balance' },
            { value: 'work_first', label: 'Work‑first culture' }
        ]
    },
    // 23.
    {
        id: createQuestionId('investor', 22),
        text: 'How do you evaluate a startup’s succession planning or backup leadership strategy?',
        type: 'radio',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 'comprehensive', label: 'Comprehensive planning' },
            { value: 'basic', label: 'Basic planning' },
            { value: 'not_focus', label: 'Not a focus' }
        ]
    },
    // 24.
    {
        id: createQuestionId('investor', 23),
        text: 'What is your preferred style of board involvement—do you actively participate or serve in a purely advisory capacity?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'active', label: 'Active participation' },
            { value: 'advisory', label: 'Advisory role' },
            { value: 'none', label: 'No board involvement' }
        ]
    },
    // 25.
    {
        id: createQuestionId('investor', 24),
        text: 'How do you measure the trustworthiness and transparency of a startup during your due diligence process?',
        type: 'slider',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 1, label: 'Not trustworthy' },
            { value: 2, label: 'Slightly trustworthy' },
            { value: 3, label: 'Moderately trustworthy' },
            { value: 4, label: 'Very trustworthy' },
            { value: 5, label: 'Extremely trustworthy' }
        ]
    },
    // 26.
    {
        id: createQuestionId('investor', 25),
        text: 'What conflict resolution style do you value in a startup: direct confrontation or a more diplomatic, measured approach?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'direct', label: 'Direct confrontation' },
            { value: 'diplomatic', label: 'Diplomatic approach' },
            { value: 'hybrid', label: 'Hybrid approach' }
        ]
    },
    // 27.
    {
        id: createQuestionId('investor', 26),
        text: 'How critical is alignment on social and political ideologies when deciding to invest in a startup?',
        type: 'slider',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 1, label: 'Not critical' },
            { value: 2, label: 'Slightly critical' },
            { value: 3, label: 'Moderately critical' },
            { value: 4, label: 'Very critical' },
            { value: 5, label: 'Extremely critical' }
        ]
    },
    // 28.
    {
        id: createQuestionId('investor', 27),
        text: 'To what degree do you involve yourself in key hiring decisions at your portfolio companies?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Not involved' },
            { value: 2, label: 'Slightly involved' },
            { value: 3, label: 'Moderately involved' },
            { value: 4, label: 'Significantly involved' },
            { value: 5, label: 'Highly involved' }
        ]
    },
    // 29.
    {
        id: createQuestionId('investor', 28),
        text: 'How do you incorporate employee health and wellness priorities into your investment evaluation?',
        type: 'radio',
        category: CATEGORIES.CULTURE,
        required: true,
        options: [
            { value: 'high', label: 'High priority' },
            { value: 'moderate', label: 'Moderate priority' },
            { value: 'low', label: 'Low priority' }
        ]
    },
    // 30.
    {
        id: createQuestionId('investor', 29),
        text: 'Do you prioritize investments in startups with a strong focus on corporate social responsibility (CSR) and philanthropy, or is profit the primary driver?',
        type: 'radio',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 'csr', label: 'CSR focus' },
            { value: 'profit', label: 'Profit focus' },
            { value: 'balanced', label: 'Balanced approach' }
        ]
    },
    // 31.
    {
        id: createQuestionId('investor', 30),
        text: 'What are your geographic preferences for investments, and how do you view startups expanding into these regions?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'local', label: 'Local' },
            { value: 'national', label: 'National' },
            { value: 'international', label: 'International' },
            { value: 'no_preference', label: 'No preference' }
        ]
    },
    // 32.
    {
        id: createQuestionId('investor', 31),
        text: 'How do you evaluate a startup’s ability to adapt to market shifts—is a steadfast adherence to a core vision preferable to a willingness to pivot?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'steadfast', label: 'Steadfast adherence' },
            { value: 'pivot', label: 'Willingness to pivot' },
            { value: 'combination', label: 'Combination of both' }
        ]
    },
    // 33.
    {
        id: createQuestionId('investor', 32),
        text: 'How do you determine the ideal timing for market entry when considering new investment opportunities?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Too early' },
            { value: 2, label: 'Slightly early' },
            { value: 3, label: 'Optimal timing' },
            { value: 4, label: 'Slightly late' },
            { value: 5, label: 'Too late' }
        ]
    },
    // 34.
    {
        id: createQuestionId('investor', 33),
        text: 'What metrics do you use to assess the effectiveness of a startup’s financial management and capital utilization?',
        type: 'multi-select',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'cash_burn', label: 'Cash burn rate' },
            { value: 'revenue_growth', label: 'Revenue growth' },
            { value: 'profit_margins', label: 'Profit margins' },
            { value: 'cost_management', label: 'Cost management' },
            { value: 'capital_efficiency', label: 'Capital efficiency' }
        ]
    },
    // 35.
    {
        id: createQuestionId('investor', 34),
        text: 'How do current market trends and industry shifts factor into your overall investment strategy?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Not at all' },
            { value: 2, label: 'Somewhat' },
            { value: 3, label: 'Moderately' },
            { value: 4, label: 'Significantly' },
            { value: 5, label: 'Critically' }
        ]
    },
    // 36.
    {
        id: createQuestionId('investor', 35),
        text: 'What is your typical pace in the decision‑making process—do you prefer swift due diligence or a more thorough, structured analysis?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Swift' },
            { value: 2, label: 'Somewhat swift' },
            { value: 3, label: 'Balanced' },
            { value: 4, label: 'Thorough' },
            { value: 5, label: 'Very structured' }
        ]
    },
    // 37.
    {
        id: createQuestionId('investor', 36),
        text: 'How do you ensure that your core values and beliefs are clearly reflected in your investment decisions?',
        type: 'radio',
        category: CATEGORIES.VALUES,
        required: true,
        options: [
            { value: 'strong', label: 'Strongly reflected' },
            { value: 'moderate', label: 'Somewhat reflected' },
            { value: 'not_reflected', label: 'Not reflected' }
        ]
    },
    // 38.
    {
        id: createQuestionId('investor', 37),
        text: 'What level of involvement do you seek in shaping the strategic direction of the companies you invest in?',
        type: 'slider',
        category: CATEGORIES.LEADERSHIP,
        required: true,
        options: [
            { value: 1, label: 'Minimal involvement' },
            { value: 2, label: 'Limited involvement' },
            { value: 3, label: 'Moderate involvement' },
            { value: 4, label: 'Active involvement' },
            { value: 5, label: 'Highly involved' }
        ]
    },
    // 39.
    {
        id: createQuestionId('investor', 38),
        text: 'How do you approach crisis management within your portfolio companies—are you interventionist or do you allow founders to navigate challenges independently?',
        type: 'radio',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 'interventionist', label: 'Interventionist' },
            { value: 'founder_led', label: 'Founder‑led' },
            { value: 'collaborative', label: 'Collaborative approach' }
        ]
    },
    // 40.
    {
        id: createQuestionId('investor', 39),
        text: 'When evaluating opportunities, do you rely more on data‑driven analysis or intuition‑based judgment?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'data', label: 'Data‑driven' },
            { value: 'intuition', label: 'Intuition‑based' },
            { value: 'both', label: 'Both equally' }
        ]
    },
    // 41.
    {
        id: createQuestionId('investor', 40),
        text: 'What criteria do you use to assess a startup’s hiring and talent strategy to ensure it aligns with your investment philosophy?',
        type: 'multi-select',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 'experience', label: 'Experience' },
            { value: 'cultural_fit', label: 'Cultural fit' },
            { value: 'skill_diversity', label: 'Skill diversity' },
            { value: 'growth_potential', label: 'Growth potential' },
            { value: 'team_dynamics', label: 'Team dynamics' }
        ]
    },
    // 42.
    {
        id: createQuestionId('investor', 41),
        text: 'How do you evaluate a startup’s commitment to technological innovation, including the adoption of AI and automation?',
        type: 'slider',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 1, label: 'Not committed' },
            { value: 2, label: 'Slightly committed' },
            { value: 3, label: 'Moderately committed' },
            { value: 4, label: 'Very committed' },
            { value: 5, label: 'Extremely committed' }
        ]
    },
    // 43.
    {
        id: createQuestionId('investor', 42),
        text: 'What factors do you consider when determining a startup’s competitive differentiation—such as being a first mover, cost leader, or niche specialist?',
        type: 'multi-select',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'first_mover', label: 'First mover' },
            { value: 'cost_leader', label: 'Cost leader' },
            { value: 'niche', label: 'Niche specialist' },
            { value: 'innovation', label: 'Innovation' },
            { value: 'brand', label: 'Brand strength' }
        ]
    },
    // 44.
    {
        id: createQuestionId('investor', 43),
        text: 'How do you assess the operational efficiency of a startup’s supply chain and logistics strategy?',
        type: 'slider',
        category: CATEGORIES.OPERATIONS,
        required: true,
        options: [
            { value: 1, label: 'Very inefficient' },
            { value: 2, label: 'Inefficient' },
            { value: 3, label: 'Moderately efficient' },
            { value: 4, label: 'Efficient' },
            { value: 5, label: 'Highly efficient' }
        ]
    },
    // 45.
    {
        id: createQuestionId('investor', 44),
        text: 'How significant is a commitment to research and development (R&D) in your decision to invest?',
        type: 'slider',
        category: CATEGORIES.INNOVATION,
        required: true,
        options: [
            { value: 1, label: 'Not significant' },
            { value: 2, label: 'Slightly significant' },
            { value: 3, label: 'Moderately significant' },
            { value: 4, label: 'Very significant' },
            { value: 5, label: 'Crucial' }
        ]
    },
    // 46.
    {
        id: createQuestionId('investor', 45),
        text: 'What market expansion strategies do you find most compelling—are you more interested in local growth or global scaling opportunities?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'local', label: 'Local growth' },
            { value: 'global', label: 'Global scaling' },
            { value: 'both', label: 'Both' }
        ]
    },
    // 47.
    {
        id: createQuestionId('investor', 46),
        text: 'How do you evaluate a startup’s growth strategy in terms of organic scaling versus pursuing hyper‑growth?',
        type: 'radio',
        category: CATEGORIES.GROWTH,
        required: true,
        options: [
            { value: 'organic', label: 'Organic scaling' },
            { value: 'hyper_growth', label: 'Hyper‑growth' },
            { value: 'balanced', label: 'Balanced approach' }
        ]
    },
    // 48.
    {
        id: createQuestionId('investor', 47),
        text: 'What indicators do you use to determine a startup’s scalability in terms of both infrastructure and market potential?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Not scalable' },
            { value: 2, label: 'Slightly scalable' },
            { value: 3, label: 'Moderately scalable' },
            { value: 4, label: 'Scalable' },
            { value: 5, label: 'Highly scalable' }
        ]
    },
    // 49.
    {
        id: createQuestionId('investor', 48),
        text: 'How does portfolio diversification play into your overall strategy, and what role does each new investment serve in that context?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'diversification_key', label: 'Diversification is key' },
            { value: 'unique_role', label: 'Each investment is unique' },
            { value: 'focused', label: 'Focused strategy' }
        ]
    },
    // 50.
    {
        id: createQuestionId('investor', 49),
        text: 'How important is industry or sector focus in your investment decisions, and which sectors are currently of highest interest?',
        type: 'multi-select',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'technology', label: 'Technology' },
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'finance', label: 'Finance' },
            { value: 'consumer', label: 'Consumer' },
            { value: 'energy', label: 'Energy' },
            { value: 'real_estate', label: 'Real Estate' },
            { value: 'other', label: 'Other' }
        ]
    },
    // 51.
    {
        id: createQuestionId('investor', 50),
        text: 'What is your approach to capital utilization—do you favor startups that are frugal or are you comfortable with a higher burn rate for accelerated growth?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'frugal', label: 'Frugal' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high_burn', label: 'High burn rate' }
        ]
    },
    // 52.
    {
        id: createQuestionId('investor', 51),
        text: 'How do you assess the viability of a startup’s business model (e.g., SaaS, DTC, marketplace), and what factors are most critical?',
        type: 'multi-select',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'scalability', label: 'Scalability' },
            { value: 'revenue_streams', label: 'Revenue streams' },
            { value: 'cost_structure', label: 'Cost structure' },
            { value: 'market_demand', label: 'Market demand' },
            { value: 'competitive_advantage', label: 'Competitive advantage' }
        ]
    },
    // 53.
    {
        id: createQuestionId('investor', 52),
        text: 'When structuring deals, how do you decide between equity investment and debt financing?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'equity', label: 'Equity investment' },
            { value: 'debt', label: 'Debt financing' },
            { value: 'hybrid', label: 'Hybrid models' }
        ]
    },
    // 54.
    {
        id: createQuestionId('investor', 53),
        text: 'What level of financial transparency and regular reporting do you require from your portfolio companies?',
        type: 'radio',
        category: CATEGORIES.GOVERNANCE,
        required: true,
        options: [
            { value: 'high', label: 'High transparency' },
            { value: 'moderate', label: 'Moderate transparency' },
            { value: 'low', label: 'Low transparency' }
        ]
    },
    // 55.
    {
        id: createQuestionId('investor', 54),
        text: 'What is your typical investment horizon, and how do you balance the pursuit of short‑term returns with a long‑term vision?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Short‑term focused' },
            { value: 2, label: 'Somewhat short‑term' },
            { value: 3, label: 'Balanced' },
            { value: 4, label: 'Somewhat long‑term' },
            { value: 5, label: 'Long‑term focused' }
        ]
    },
    // 56.
    {
        id: createQuestionId('investor', 55),
        text: 'At which stage (Seed, Series A, B, etc.) do you typically invest, and how do you determine that a startup is ready for that stage?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'seed', label: 'Seed' },
            { value: 'series_a', label: 'Series A' },
            { value: 'series_b', label: 'Series B' },
            { value: 'series_c', label: 'Series C or later' },
            { value: 'depends', label: 'Depends on opportunity' }
        ]
    },
    // 57.
    {
        id: createQuestionId('investor', 56),
        text: 'How do you approach exit strategy planning—do you favor IPOs, M&A, buybacks, or dividend models?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'ipo', label: 'IPO' },
            { value: 'ma', label: 'M&A' },
            { value: 'buybacks', label: 'Buybacks' },
            { value: 'dividends', label: 'Dividend models' },
            { value: 'other', label: 'Other' }
        ]
    },
    // 58.
    {
        id: createQuestionId('investor', 57),
        text: 'What is your overall risk appetite when investing—do you lean toward high‑risk, disruptive startups or those with stable, incremental growth?',
        type: 'slider',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 1, label: 'Low risk' },
            { value: 2, label: 'Slightly low' },
            { value: 3, label: 'Moderate risk' },
            { value: 4, label: 'High risk' },
            { value: 5, label: 'Very high risk' }
        ]
    },
    // 59.
    {
        id: createQuestionId('investor', 58),
        text: 'How do you set and negotiate valuation expectations during the investment process?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: 'market_based', label: 'Market‑based valuation' },
            { value: 'founder_led', label: 'Founder‑led valuation' },
            { value: 'negotiated', label: 'Negotiated case‑by‑case' },
            { value: 'fixed', label: 'Fixed benchmarks' }
        ]
    },
    // 60.
    {
        id: createQuestionId('investor', 59),
        text: 'What return on investment (ROI) targets do you aim for (such as 5×, 10×, or 20×), and how do you assess a startup’s potential to meet those goals?',
        type: 'radio',
        category: CATEGORIES.FINANCE,
        required: true,
        options: [
            { value: '5x', label: '5×' },
            { value: '10x', label: '10×' },
            { value: '20x', label: '20×' },
            { value: 'flexible', label: 'Flexible target' }
        ]
    }
];
