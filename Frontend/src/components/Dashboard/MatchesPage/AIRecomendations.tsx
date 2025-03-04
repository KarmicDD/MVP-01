import { BsFillLightbulbFill } from "react-icons/bs";
import { FiTarget, FiUsers } from "react-icons/fi";

const AIRecommendations = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>

            <div className="mb-4">
                <div className="flex items-start mb-3">
                    <BsFillLightbulbFill className="text-blue-500 mt-1 mr-2" />
                    <p>Strong alignment in AI and machine learning focus areas</p>
                </div>

                <div className="flex items-start mb-3">
                    <FiTarget className="text-blue-500 mt-1 mr-2" />
                    <p>Growth trajectory matches investor's portfolio preferences</p>
                </div>

                <div className="flex items-start mb-3">
                    <FiUsers className="text-blue-500 mt-1 mr-2" />
                    <p>Team composition indicates strong execution capability</p>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendations;