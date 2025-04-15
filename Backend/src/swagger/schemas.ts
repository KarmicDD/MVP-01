/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [startup, investor]
 *           description: User's role in the system
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the user was created
 *       required:
 *         - userId
 *         - email
 *         - role
 *
 *     StartupProfile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID associated with this profile
 *         companyName:
 *           type: string
 *           description: Name of the startup
 *         industry:
 *           type: string
 *           description: Industry the startup operates in
 *         fundingStage:
 *           type: string
 *           enum: [pre-seed, seed, series-a, series-b, series-c, growth]
 *           description: Current funding stage of the startup
 *         employeeCount:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 501+]
 *           description: Number of employees
 *         location:
 *           type: string
 *           description: Location of the startup
 *         pitch:
 *           type: string
 *           description: Brief pitch of the startup
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was last updated
 *       required:
 *         - userId
 *         - companyName
 *         - industry
 *         - fundingStage
 *
 *     InvestorProfile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID associated with this profile
 *         companyName:
 *           type: string
 *           description: Name of the investment firm
 *         industriesOfInterest:
 *           type: array
 *           items:
 *             type: string
 *           description: Industries the investor is interested in
 *         preferredStages:
 *           type: array
 *           items:
 *             type: string
 *             enum: [pre-seed, seed, series-a, series-b, series-c, growth]
 *           description: Funding stages the investor is interested in
 *         ticketSize:
 *           type: string
 *           enum: [0-10L, 10L-50L, 50L-1Cr, 1Cr-10Cr, 10Cr+]
 *           description: Investment ticket size range in Indian currency
 *         investmentCriteria:
 *           type: array
 *           items:
 *             type: string
 *           description: Investment criteria and preferences
 *         pastInvestments:
 *           type: string
 *           description: Description of past investments
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was last updated
 *       required:
 *         - userId
 *         - companyName
 *         - industriesOfInterest
 *         - preferredStages
 *
 *     ExtendedProfile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID associated with this profile
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           description: URL to the user's avatar image
 *         socialLinks:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: Social media platform name
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL to the social media profile
 *           description: Social media links
 *         teamMembers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Team member's name
 *               role:
 *                 type: string
 *                 description: Team member's role
 *               bio:
 *                 type: string
 *                 description: Team member's biography
 *           description: Team members information
 *         investmentHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Name of the company invested in
 *               amount:
 *                 type: string
 *                 description: Investment amount
 *               date:
 *                 type: string
 *                 description: Investment date
 *               stage:
 *                 type: string
 *                 description: Funding stage at time of investment
 *               outcome:
 *                 type: string
 *                 description: Investment outcome
 *           description: Investment history for investors
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the profile was last updated
 *       required:
 *         - userId
 *
 *     QuestionnaireSubmission:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID associated with this submission
 *         userRole:
 *           type: string
 *           enum: [startup, investor]
 *           description: Role of the user
 *         responses:
 *           type: object
 *           additionalProperties: true
 *           description: Map of question IDs to responses
 *         status:
 *           type: string
 *           enum: [draft, submitted]
 *           description: Status of the questionnaire submission
 *         analysisResults:
 *           type: object
 *           properties:
 *             categories:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               description: Scores by category
 *             overallProfile:
 *               type: array
 *               items:
 *                 type: string
 *               description: Overall profile characteristics
 *             matchPreferences:
 *               type: object
 *               additionalProperties: true
 *               description: Match preferences derived from responses
 *           description: Results of the analysis of the questionnaire responses
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the submission was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the submission was last updated
 *       required:
 *         - userId
 *         - userRole
 *         - responses
 *
 *     BeliefSystemAnalysis:
 *       type: object
 *       properties:
 *         startupId:
 *           type: string
 *           format: uuid
 *           description: ID of the startup
 *         investorId:
 *           type: string
 *           format: uuid
 *           description: ID of the investor
 *         perspective:
 *           type: string
 *           enum: [startup, investor]
 *           description: Perspective of the analysis
 *         overallMatch:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Overall match percentage between startup and investor
 *         compatibility:
 *           type: object
 *           properties:
 *             visionAlignment:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 100
 *               description: Alignment score for vision
 *             coreValues:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 100
 *               description: Alignment score for core values
 *             businessGoals:
 *               type: number
 *               format: float
 *               minimum: 0
 *               maximum: 100
 *               description: Alignment score for business goals
 *           description: Compatibility scores in different areas
 *         risks:
 *           type: object
 *           properties:
 *             marketFitRisk:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   enum: [High, Medium, Low]
 *                   description: Risk level
 *                 description:
 *                   type: string
 *                   description: Description of the risk
 *               description: Market fit risk assessment
 *             operationalRisk:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   enum: [High, Medium, Low]
 *                   description: Risk level
 *                 description:
 *                   type: string
 *                   description: Description of the risk
 *               description: Operational risk assessment
 *           description: Risk assessments
 *         riskMitigationRecommendations:
 *           type: array
 *           items:
 *             type: string
 *           description: Recommendations for mitigating identified risks
 *         improvementAreas:
 *           type: object
 *           properties:
 *             strategicFocus:
 *               type: string
 *               description: Improvement area for strategic focus
 *             communication:
 *               type: string
 *               description: Improvement area for communication
 *             growthMetrics:
 *               type: string
 *               description: Improvement area for growth metrics
 *           description: Areas for improvement
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the analysis was created
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the analysis expires
 *       required:
 *         - startupId
 *         - investorId
 *         - perspective
 *         - overallMatch
 *
 *     MatchAnalysis:
 *       type: object
 *       properties:
 *         startupId:
 *           type: string
 *           format: uuid
 *           description: ID of the startup
 *         investorId:
 *           type: string
 *           format: uuid
 *           description: ID of the investor
 *         perspective:
 *           type: string
 *           enum: [startup, investor]
 *           description: Perspective of the analysis
 *         overallScore:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: Overall match score
 *         breakdown:
 *           type: object
 *           properties:
 *             missionAlignment:
 *               type: number
 *               format: float
 *               description: Mission alignment score
 *             investmentPhilosophy:
 *               type: number
 *               format: float
 *               description: Investment philosophy alignment score
 *             sectorFocus:
 *               type: number
 *               format: float
 *               description: Sector focus alignment score
 *             fundingStageAlignment:
 *               type: number
 *               format: float
 *               description: Funding stage alignment score
 *             valueAddMatch:
 *               type: number
 *               format: float
 *               description: Value add match score
 *           description: Breakdown of match scores by category
 *         insights:
 *           type: array
 *           items:
 *             type: string
 *           description: Insights about the match
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the analysis was created
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the analysis expires
 *       required:
 *         - startupId
 *         - investorId
 *         - perspective
 *         - overallScore
 *
 *     FinancialReport:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID associated with this report
 *         companyName:
 *           type: string
 *           description: Name of the company
 *         reportType:
 *           type: string
 *           enum: [analysis, audit]
 *           description: Type of financial report
 *         generatedBy:
 *           type: string
 *           description: Entity that generated the report
 *         summary:
 *           type: string
 *           description: Executive summary of the report
 *         metrics:
 *           type: object
 *           additionalProperties: true
 *           description: Financial metrics
 *         recommendations:
 *           type: array
 *           items:
 *             type: string
 *           description: Recommendations based on the analysis
 *         riskFactors:
 *           type: array
 *           items:
 *             type: string
 *           description: Identified risk factors
 *         complianceItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *                 description: Compliance item description
 *               status:
 *                 type: string
 *                 enum: [compliant, non-compliant, needs-review]
 *                 description: Compliance status
 *               impact:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: Impact level
 *           description: Compliance items (for audit reports)
 *         documentSources:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of source documents
 *         status:
 *           type: string
 *           enum: [draft, processing, final]
 *           description: Status of the report
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the report was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the report was last updated
 *       required:
 *         - userId
 *         - companyName
 *         - reportType
 *         - summary
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information (only in development)
 *       required:
 *         - message
 */

// This file is only for Swagger documentation and doesn't export anything
export { };
