// Script to update the forwardLookingAnalysis field in a financial due diligence report
// Run this script with: node update-forward-looking-analysis.js

const { MongoClient, ObjectId } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function updateForwardLookingAnalysis() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("karmicDD"); // Replace with your database name
    const collection = database.collection("financialduediligencereports"); // Replace with your collection name

    // Replace with the ID of the document you want to update
    const reportId = "6820841111baa5499c3b1a05";

    // Sample data for forwardLookingAnalysis
    const forwardLookingAnalysisData = {
      marketPotential: {
        tamSize: "170 Billion USD",
        growthRate: "12.5% CAGR",
        adoptionStage: "Early Majority",
        targetSegments: [
          "Enterprise SaaS customers in Finance",
          "Mid-market Technology companies",
          "Healthcare data management sector"
        ],
        entryStrategy: "Focus on mid-market segment with specialized AI solutions before expanding to enterprise",
        competitiveLandscape: "Moderately competitive with 5-7 major players and numerous smaller startups",
        historicalComparisons: [
          "Similar adoption curve to cloud computing (2010-2015)",
          "Pricing pressure patterns similar to enterprise SaaS (2018-2020)"
        ],
        goToMarketRecommendations: [
          {
            recommendation: "Develop industry-specific AI solutions",
            implementationSteps: [
              "Identify top 3 industry verticals with highest ROI potential",
              "Create specialized product offerings for each vertical",
              "Develop case studies and ROI calculators"
            ],
            timeline: "6-9 months",
            resourceRequirements: "Product team (3 FTEs), Marketing (1 FTE)",
            expectedOutcome: "30% increase in conversion rates for targeted verticals"
          }
        ],
        metrics: [
          {
            name: "Market Penetration",
            value: "0.5%",
            description: "Current share of addressable market",
            trend: "increasing"
          }
        ]
      },
      innovationAssessment: {
        uniquenessScore: 75,
        ipStrength: "Moderate",
        competitiveAdvantage: "AI-driven predictive analytics",
        keyDifferentiators: [
          "Proprietary machine learning algorithms",
          "Real-time data processing capabilities",
          "Industry-specific AI models"
        ],
        protectionStrategies: [
          "Patent core algorithms and methodologies",
          "Maintain key components as trade secrets",
          "Implement robust IP assignment agreements"
        ],
        innovationGaps: [
          "Limited natural language processing capabilities",
          "Lack of computer vision technology",
          "Edge computing integration"
        ],
        rdRoadmap: [
          {
            priority: "High",
            initiative: "Enhance NLP capabilities",
            timeline: "Q3-Q4 2023",
            resourceRequirements: "2 ML engineers, 1 data scientist",
            expectedOutcome: "70% improvement in text analysis accuracy"
          }
        ],
        historicalComparisons: [
          "Innovation trajectory similar to early Salesforce",
          "R&D efficiency comparable to mid-stage fintech startups"
        ],
        metrics: [
          {
            name: "Patent Applications",
            value: 3,
            description: "Number of patents filed in last 12 months",
            trend: "stable"
          }
        ]
      },
      teamCapability: {
        executionScore: 68,
        experienceLevel: "Mid-Senior",
        trackRecord: "Previous startup experience with one successful exit",
        founderAchievements: [
          "Previous exit valued at $40M",
          "Built and scaled engineering team from 5 to 50",
          "Developed patented technology in AI space"
        ],
        identifiedSkillGaps: [
          "Enterprise sales leadership",
          "Product marketing expertise",
          "International expansion experience"
        ],
        hiringPriorities: [
          {
            role: "VP of Enterprise Sales",
            responsibilities: [
              "Build and lead enterprise sales team",
              "Develop enterprise sales strategy",
              "Establish key account management process"
            ],
            impact: "Accelerate enterprise revenue growth by 50%",
            timeline: "Q2 2023"
          }
        ],
        organizationalImprovements: [
          {
            area: "Sales Process",
            recommendation: "Implement structured sales methodology",
            implementationSteps: [
              "Document current sales process",
              "Train team on new methodology",
              "Implement CRM tracking and reporting"
            ],
            expectedOutcome: "25% improvement in sales cycle efficiency"
          }
        ],
        historicalComparisons: [
          "Team composition similar to successful B2B SaaS startups",
          "Leadership experience comparable to Series B stage companies"
        ],
        metrics: [
          {
            name: "Team Growth Rate",
            value: "45%",
            description: "Annual team growth rate",
            trend: "increasing"
          }
        ]
      },
      growthTrajectory: {
        scenarios: {
          conservative: 25,
          moderate: 40,
          aggressive: 65
        },
        assumptions: [
          {
            scenario: "conservative",
            assumptions: [
              "Market growth slows to 8% annually",
              "Customer acquisition costs increase by 15%",
              "Retention rates remain stable"
            ]
          },
          {
            scenario: "moderate",
            assumptions: [
              "Market growth continues at 12% annually",
              "Customer acquisition costs increase by 5%",
              "Retention rates improve by 5%"
            ]
          }
        ],
        unitEconomics: {
          currentCac: 12000,
          projectedCac: 10000,
          currentLtv: 45000,
          projectedLtv: 60000
        },
        scalingStrategies: [
          {
            strategy: "International Expansion",
            implementationSteps: [
              "Market research and prioritization",
              "Localization of product and marketing",
              "Establish regional partnerships"
            ],
            resourceRequirements: "Expansion team (5 FTEs), $1.2M budget",
            timeline: "12-18 months",
            expectedOutcome: "20% of revenue from international markets within 2 years"
          }
        ],
        growthLevers: [
          "Expansion into adjacent markets",
          "Upsell and cross-sell to existing customers",
          "Strategic partnerships with complementary solutions"
        ],
        optimizationTactics: [
          "Implement product-led growth model",
          "Optimize customer onboarding process",
          "Develop customer success playbooks"
        ],
        historicalComparisons: [
          "Growth trajectory similar to successful SaaS companies at Series B stage",
          "Unit economics comparable to industry leaders in early growth phase"
        ],
        metrics: [
          {
            name: "Annual Recurring Revenue Growth",
            value: "85%",
            description: "Year-over-year ARR growth rate",
            trend: "increasing"
          }
        ]
      },
      dimensions: [
        {
          name: "Market Opportunity",
          score: 85,
          description: "Large addressable market with strong growth trends",
          status: "excellent"
        },
        {
          name: "Product Innovation",
          score: 75,
          description: "Strong differentiation with room for continued innovation",
          status: "good"
        },
        {
          name: "Team Capability",
          score: 68,
          description: "Experienced team with some key gaps to address",
          status: "good"
        },
        {
          name: "Growth Potential",
          score: 80,
          description: "Strong unit economics and multiple growth vectors",
          status: "excellent"
        }
      ],
      chartData: {
        type: "radar",
        labels: ["Market Opportunity", "Product Innovation", "Team Capability", "Growth Potential", "Execution Risk"],
        datasets: [
          {
            label: "Forward-Looking Assessment",
            data: [85, 75, 68, 80, 60],
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)"
          }
        ]
      }
    };

    // Update the document
    const result = await collection.updateOne(
      { _id: new ObjectId(reportId) },
      {
        $set: {
          forwardLookingAnalysis: forwardLookingAnalysisData
        }
      }
    );

    console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

updateForwardLookingAnalysis().catch(console.error);
